const execa = require('execa');
const tempy = require('tempy');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

// Load default configuration
const defaultConfig = require('./defaultConfig.json');

exports.handler = async function(event, context) {
  try {
    const postData = JSON.parse(event.body);
    
    // 0. Reads a config object from the POST data, with defaults stored in a local json file
    const css = postData.cssString; 
    const config = {
      ...defaultConfig,
      ...postData.config,
    };
    // Now, `config` is an object that merges the default config and the POST data config.
    // The properties in POST data config will overwrite those in default config.

    // 1. Writes that CSS string to a temporary file
    const filePath = await tempy.temporaryWrite('unicorn', {name: 'test.png'});
    const tempFile = tempy.file({ extension: 'css' });
    await writeFileAsync(tempFile, cssString);

    const outputFilePath = tempy.file({ extension: 'css' }); // Temporary file for output

    // 2. Executes a binary file with our temporary file path as input
    const binaryPath = path.join(__dirname, 'your-binary-file');
    
    await execa(binaryPath, [tempFile, outputFilePath]); 

    // 3. Reads the different (output) file and return as the result body
    const outputFileContents = await readFileAsync(outputFilePath, 'utf-8');

    return {
        statusCode: 200,
        body: JSON.stringify({data: outputFileContents}),
    };
  } catch (error) {
    return { statusCode: 500, body: error.toString() }
  }
}
