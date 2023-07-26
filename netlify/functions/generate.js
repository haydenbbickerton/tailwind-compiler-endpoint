import os from 'os';
import path from 'path';
import {execa} from 'execa';
import fs from 'fs-extra';

const platformMap = {
  darwin: `tailwindcss-macos-${process.arch}`,
  linux: `tailwindcss-linux-${process.arch}`,
  win32: `tailwindcss-windows-${process.arch}`,
};

export const handler = async (event, context) => {
  try {
    const postData = JSON.parse(event.body);

    const css = postData.css; 
    const content = postData.content;
    const userTailwindConfig = postData.userTailwindConfig || {};

    const tempDir = os.tmpdir();

    const inputFilePath = path.join(tempDir, 'input.css');
    fs.writeFileSync(inputFilePath, css);

    const contentFilePath = path.join(tempDir, 'content.html');
    fs.writeFileSync(contentFilePath, typeof content === 'string' ? content : JSON.stringify(content));

    const configContent = `
        module.exports = {
            content: ["${contentFilePath}"],
            corePlugins: {preflight: false},
            theme: { extend: {...${JSON.stringify(userTailwindConfig)}} },
        };
    `;
    const configFilePath = path.join(tempDir, 'config.js');
    fs.writeFileSync(configFilePath, configContent);

    const binaryPath = path.join(process.env.LAMBDA_RUNTIME_DIR, 'bin', platformMap[os.platform()]);


    const { stdout: generatedCss } = await execa(binaryPath, ['--input', inputFilePath, '--config', configFilePath]);

    // cleanup temp files
    fs.removeSync(inputFilePath);
    fs.removeSync(contentFilePath);
    fs.removeSync(configFilePath);


    return {
      statusCode: 200,
      body: JSON.stringify({css: generatedCss.toString()}),
    };
  } catch (error) {
    return { statusCode: 500, body: error.toString() };
  }
}
