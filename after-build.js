const fs = require('fs').promises;
const path = require('path');

const SOURCE_PATH = './src/after-build/';
const TARGET_PATH = './dist/';

const run = async () => {
  let filePath = `dist/shelly-porssisahko.js`;
  let mainCode = (await fs.readFile(filePath)).toString();

  //Creating all examples
  let files = await fs.readdir(SOURCE_PATH, { recursive: false });

  for (let file of files) {
    const sourcePath = path.join(SOURCE_PATH, file);
    const destPath = path.join(TARGET_PATH, file);
    let data = (await fs.readFile(sourcePath)).toString();

    //Replacing the main script placeholder with actualy code
    data = data.replace('//__REPLACED_WITH_MAIN_CODE__', mainCode);
    
    console.log("After build file:", path.join(TARGET_PATH, file));

    await fs.writeFile(path.join(TARGET_PATH, file), Buffer.from(data, 'utf8'));
  }
}

run();