/* eslint-disable no-unused-vars */
import os from 'os'
import path from 'path'
import { execa } from 'execa'
import fs from 'fs-extra'
const binaryPath =
  process.env.TAILWIND_BINARY_PATH ??
  path.join(__dirname, '..', '..', 'bin', 'tailwindcss-linux-x64')

const dis = [binaryPath]
const headers = {
  "Access-Control-Allow-Origin": "*",
  'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
  "Access-Control-Allow-Methods": "POST, GET, PUT, DELETE",
  'Content-Type': 'application/json',
};

export async function handler(event, context) {
  if (event.httpMethod === "OPTIONS") {
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
    const userTailwindConfig = postData.userTailwindConfig || {}

    const tempDir = os.tmpdir()

    // const inputFilePath = path.join(tempDir, 'input.css');
    // fs.writeFileSync(inputFilePath, css);

    const contentFilePath = path.join(tempDir, 'content.html')
    fs.writeFileSync(
      contentFilePath,
      typeof content === 'string' ? content : JSON.stringify(content)
    )

    const configContent = `
        module.exports = {
            content: ["${contentFilePath}"],
            corePlugins: {preflight: false},
            theme: { extend: {...${JSON.stringify(userTailwindConfig)}} },
        };
    `
    const configFilePath = path.join(tempDir, 'config.js')
    fs.writeFileSync(configFilePath, configContent)

    const binaryPath =
      process.env.TAILWIND_BINARY_PATH ??
      path.join(__dirname, '..', '..', 'bin', 'tailwindcss-linux-x64')

    const { stdout: generatedCss } = await execa(
      binaryPath,
      ['-i', '-', '--config', configFilePath, '--minify'],
      {
        input: css,
      }
    )

    // const { stdout: generatedCss } = await execa(binaryPath, ['--input', inputFilePath, '--config', configFilePath]);

    // cleanup temp files
    // fs.removeSync(inputFilePath);
    fs.removeSync(contentFilePath)
    fs.removeSync(configFilePath)

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ css: generatedCss.toString() }),
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: error.toString() }), // better JSON format for errors
    };
  }
}
