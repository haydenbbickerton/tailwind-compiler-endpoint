/* eslint-disable no-unused-vars */
import os from 'os'
import path from 'path'
import { execa } from 'execa'
import fs from 'fs-extra'

/**
 * This is a workaround for a "bug" in Netlify's build system (idk what causes it, but this fixes it)
 * 
 * I THINK this is because netlify only includes files actually used, to avoid bloating the function bundle (ie with node_modules)
 * And since the our binary is only executed on POST, it's not used during build time.
 * 
 * So my netlify.toml file has `included_files = ["bin/3.3.5/tailwindcss-linux-x64"]`, and here
 * we will reference that path in our top-level scope to ensure it gets included in the build
 */
const binaryPath =
  process.env.TAILWIND_BINARY_PATH ??
  path.join(__dirname, '..', '..', 'bin', '3.3.5', 'tailwindcss-linux-x64')
const workaroundVar = [binaryPath]
console.log(`tailwind binary path: ${workaroundVar}`);


const headers = {
  "Access-Control-Allow-Origin": "*",
  'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
  "Access-Control-Allow-Methods": "POST, GET, PUT, DELETE",
  'Content-Type': 'application/json',
};
const defaultOptions = {
  disablePreflight: false,
  disableMinify: false,
  disableAutoprefixer: false,
  tailwindVersion: '3.3.5'
};

const isTrue = v => v === true || v === 'true' // ignores POSTED 'false'/false/0/null/etc
const castToString = v => typeof v === 'string' ? v : JSON.stringify(v)

export async function handler(event, context) {
  if (event.httpMethod === "OPTIONS") { 
    // This is for preflight requests that are checking CORS
    return {
      statusCode: 204,
      headers,
      body: ""
    };
  }

  try {
    const postData = JSON.parse(event.body)

    const css = postData.css
    const content = postData.content
    const theme = postData.theme || {}
    const plugins = postData.plugins || []
    const options = {
      ...defaultOptions,
      ...(postData.options || {})
    }

    // Create a temp folder to process files for this request
    const tempDir = path.join(os.tmpdir(), Math.random().toString(20).substr(2, 6))
    fs.ensureDirSync(tempDir)
    
    const inputCssFilePath = path.join(tempDir, 'input.css')
    fs.writeFileSync(inputCssFilePath, castToString(css))

    const contentFilePath = path.join(tempDir, 'content.html')
    fs.writeFileSync(contentFilePath, castToString(content))



    // For each entry in the posted `plugins` field, write a require statement
    // so if they send `plugins: ['@tailwindcss/forms', '@tailwindcss/typography']`
    // we write: `plugins: [ require('@tailwindcss/forms'), require('@tailwindcss/typography')]
    const pluginsString = plugins.map((plugin) => `require('${plugin}')`).join(',')

    const configContent = `
        module.exports = {
            content: ["${contentFilePath}"],
            ${isTrue(options.disablePreflight) ? 'corePlugins: {preflight: false}' : ''},
            theme: { ${castToString(theme)} },
            plugins: [${pluginsString}]
        };
    `
    const configFilePath = path.join(tempDir, 'config.js')
    fs.writeFileSync(configFilePath, configContent)

    const binaryPath =
      process.env.TAILWIND_BINARY_PATH ??
      path.join(__dirname, '..', '..', 'bin', options.tailwindVersion, 'tailwindcss-linux-x64')


    const minifyFlag = isTrue(options.disableMinify) ? '' : '--minify'
    const autoprefixerFlag = isTrue(options.disableAutoprefixer) ? '--no-autoprefixer' : ''
    const { stdout: generatedCss } = await execa(
      binaryPath,
      ['--input', inputCssFilePath, '--config', configFilePath, minifyFlag, autoprefixerFlag]
    )

    const output = JSON.stringify({ css: generatedCss.toString() })

    // const { stdout: generatedCss } = await execa(binaryPath, ['--input', inputFilePath, '--config', configFilePath]);

    // cleanup our working temp folder
    fs.removeSync(tempDir)
    // fs.removeSync(inputCssFilePath);
    // fs.removeSync(contentFilePath)
    // fs.removeSync(configFilePath)

    return {
      statusCode: 200,
      headers,
      body: output,
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: error.toString() }), // better JSON format for errors
    };
  }
}
