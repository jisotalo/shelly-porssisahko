/**
 * shelly-porssisahko
 * 
 * (c) Jussi isotalo - http://jisotalo.fi
 * https://github.com/jisotalo/shelly-porssisahko
 * 
 * License: GNU Affero General Public License v3.0
 * 
 * This file is used for the build/minify process only.
 * NOTE: work-in-progress
 * 
 * Usage:
 *  npm run build : builds and creates files to ./dist
 *  npm start     : runs build and then uploads codes to shelly
 *  npm serve     : serves static file from ./src/statics at local http server port 3000
 *  npm debug     : starts listening to UDP data at port 8001 
 */
const fs = require('fs').promises;
const path = require('path');
const UglifyJS = require("uglify-js");
const minify = require('html-minifier').minify;
const zlib = require('node:zlib');
const { promisify } = require('node:util');
const dgram = require('node:dgram');

//Settings
const BASE_URL = `http://192.168.68.105`;
const RPC_URL = `${BASE_URL}/rpc`;
const MAX_CODE_CHUNK_SIZE = 1024;
const GZIP = true;
const UDP_DEBUG_PORT = 8001;
const MAX_STATIC_FILE_SIZE = 3000; //Max file size served with shelly HTTP in bytes
const MAX_SCRIPT_SIZE = 15000; //Max script size allowed in bytes

const log = (...args) => {
  let time = new Date().toISOString();
  time = time.substring(time.indexOf("T") + 1);

  console.log(`${time}:`, ...args);
}

/**
 * Returns all available scripts
 * @returns 
 */
const getScripts = async () => {
  log(`getScripts(): Reading all scripts from shelly...`);
  const res = await fetch(`${RPC_URL}/Script.List`);

  if (res.status !== 200) {
    throw new Error(`getScripts(): Failed to read all scripts: ${JSON.stringify(await res.json())}`)
  }

  const scripts = (await res.json()).scripts;
  log(`getScripts(): Scripts read - found ${scripts.length} scripts`);

  return scripts;
}

/**
 * Returns script id by given script name
 * 
 * If not found -> throws an error!
 * @param {*} name 
 * @returns
 */
const getScriptId = async (name) => {
  log(`getScriptId(): Reading scripts to find script named "${name}"...`);
  const scripts = await getScripts();

  const found = scripts.find(s => s.name.toLowerCase() === name.toLowerCase());

  if (found) {
    log(`getScriptId(): Found script "${found.name}" (id: ${found.id})`);
    return Number(found.id);
  }

  log(`getScriptId(): Script "${name}" was not found`);
  throw new Error(`getScriptId(): Script "${name}" was not found`);
}

/**
 * Creates a new script with given name
 * @param {*} name 
 */
const createScript = async (name) => {
  log(`createScript(): Creating script with name ${name}`);

  const res = await fetch(`${RPC_URL}/Script.Create?name="${encodeURI(name)}"`);

  if (res.status !== 200) {
    throw new Error(`createScript(): Failed to create script "${name}": ${JSON.stringify(await res.json())}`)
  }

  log(`createScript(): Script "${name}" created: ${JSON.stringify(await res.json())}`);
}

/**
 * Deletes script by given script name or id
 * @param {*} name name or id
 */
const deleteScript = async (nameOrId, throwIfNotFound = false) => {
  if (typeof nameOrId === 'string') {
    try {
      nameOrId = await getScriptId(nameOrId);
    } catch (err) {
      if (throwIfNotFound) {
        throw err;
      }

      return;
    }
  }

  log(`deleteScript(): Deleting script with id ${nameOrId}`);
  const res = await fetch(`${RPC_URL}/Script.Delete?id=${nameOrId}`);

  if (res.status !== 200) {
    throw new Error(`deleteScript(): Failed to delete script with id ${nameOrId}: ${JSON.stringify(await res.json())}`)
  }

  log(`deleteScript(): Script with id ${nameOrId} deleted: ${JSON.stringify(await res.json())}`);
}

/**
 * Starts script by given script name or id
 * @param {*} name name or id
 */
const startScript = async (nameOrId) => {
  if (typeof nameOrId === 'string') {
    nameOrId = await getScriptId(nameOrId);
  }

  log(`startScript(): Starting script with id ${nameOrId}`);
  const res = await fetch(`${RPC_URL}/Script.Start?id=${nameOrId}`);

  if (res.status !== 200) {
    throw new Error(`startScript(): Failed to start script with id ${nameOrId}: ${JSON.stringify(await res.json())}`)
  }

  log(`startScript(): Script with id ${nameOrId} started: ${JSON.stringify(await res.json())}`);
}

/**
 * Sets script enable to false/true
 * @param {*} name 
 */
const setScriptEnable = async (nameOrId, enable) => {
  if (typeof nameOrId === 'string') {
    nameOrId = await getScriptId(nameOrId);
  }

  log(`setScriptEnable(): Setting script with id ${nameOrId} to enable: ${enable}`);
  const res = await fetch(`${RPC_URL}/Script.SetConfig?id=${nameOrId}&config={"enable":${enable}}`);

  if (res.status !== 200) {
    throw new Error(`setScriptEnable(): Failed to set script with id ${nameOrId} enable to ${enable}: ${JSON.stringify(await res.json())}`)
  }

  log(`setScriptEnable(): Script with id ${nameOrId} enable set to ${enable}: ${JSON.stringify(await res.json())}`);
}

/**
 * Uploads file contents to a script with given name
 * @param {*} name 
 * @param {*} filePath 
 */
const uploadScript = async (name, id, filePath) => {
  log(`uploadScript(): Starting upload of script "${name}" with id ${id} from file "${filePath}"`);
  const data = await fs.readFile(filePath);

  let pos = 0;
  let firstTime = true;
  while (pos < data.byteLength) {
    const codeChunk = data.subarray(pos, pos + MAX_CODE_CHUNK_SIZE);

    //log(`uploadScript(): Uploading script "${name}" ${pos}...${pos + codeChunk.byteLength}/${data.byteLength}... (${RPC_URL}/Script.PutCode?id=${id}&code="${encodeURIComponent(codeChunk.toString())}"&append=${!firstTime})`);
    log(`uploadScript(): Uploading script "${name}" ${pos}...${pos + codeChunk.byteLength}/${data.byteLength}...`);
    const res = await fetch(`${RPC_URL}/Script.PutCode?id=${id}&code="${encodeURIComponent(codeChunk.toString())}"&append=${!firstTime}`);

    if (res.status !== 200) {
      throw new Error(`uploadScript(): Failed to upload script chunk ${pos}...${pos + codeChunk.byteLength}/${data.byteLength}: ${JSON.stringify(await res.text())}`)
    }

    log(`uploadScript(): Uploading script "${name}" ${pos}...${pos + codeChunk.byteLength}/${data.byteLength} successful: ${JSON.stringify(await res.json())}"`);

    pos += codeChunk.byteLength;
    firstTime = false;
  }
  log(`uploadScript(): Upload of script "${name}" with id ${id} from file "${filePath} done!"`);
}


/**
 * Minifies the script file and writes to ./dist directory
 * @param {*} filePath 
 * @param {*} distPath 
 */
const createDistFile = async (filePath, distPath, isShellyScript) => {
  log(`createDistFile(): Minifying script "${filePath}"...`);
  let data = (await fs.readFile(filePath)).toString();

  //TODO: Move this after minify()?
  if (isShellyScript) {
    let staticFileMatches = data.matchAll(/\#\[(.*)\]/gm);
    for (const staticFileMatch of staticFileMatches) {
      data = data.replace(staticFileMatch[0], ((await fs.readFile(path.join('./dist/statics', staticFileMatch[1]))).toString()));
    }
  }

  let outputBuffer = Buffer.alloc(0);
  let gzippedBuffer = Buffer.alloc(0);

  if (filePath.endsWith(".js")) {
    const minified = UglifyJS.minify(data, {
      toplevel: true,
      mangle: {
        reserved: [
          //Some issues atm. with global constants -> setting so that names will not be mangled
          "C_LOG",
          "C_HIST",
          "C_ERRC",
          "C_ERRD",
          "C_DEF"
        ]
      },
      compress: {
        pure_funcs: [
          'DBG'
        ]
      },
    });

    if (minified.error) {
      log(`createDistFile(): Minifying script "${filePath}" failed: ${minified.error}`);
      throw new Error(`createDistFile(): Minifying script "${filePath}" failed: ${minified.error}`);
    }

    outputBuffer = minified.code;

    if (GZIP && !isShellyScript) {
      const gzip = promisify(zlib.gzip);
      const zippedData = await gzip(outputBuffer);
      gzippedBuffer = Buffer.from(zippedData.toString('base64'), 'utf8');
    }

    log(`createDistFile(): Minifying script "${filePath}" done - size is now ${(100.0 - (minified.code.length / data.length * 100.0)).toFixed(0)}% smaller`);

  } else if (filePath.endsWith(".html") || filePath.endsWith(".css")) {
    const minified = minify(data, {
      removeAttributeQuotes: true,
      preserveLineBreaks: false,
      removeTagWhitespace: true,
      collapseWhitespace: true,
      removeComments: true,
      removeOptionalTags: true,
      removeScriptTypeAttributes: true,
      useShortDoctype: true,
      minifyCSS: true,
      minifyJS: true,
      removeRedundantAttributes: true,
      html5: true,
    });

    let trimmedData = minified.replace(/[\n\r]/g, '');
    trimmedData = trimmedData.replace(/\s+/g, " ");
/*
    if (filePath.endsWith(".css")) {
      trimmedData = trimmedData.replaceAll("{ ", "{");
      trimmedData = trimmedData.replaceAll(" {", "{");
      trimmedData = trimmedData.replaceAll(" }", "}");
      trimmedData = trimmedData.replaceAll("} ", "}");
      trimmedData = trimmedData.replaceAll(": ", ":");
      trimmedData = trimmedData.replaceAll("; ", ";");
    }
*/
    outputBuffer = Buffer.from(trimmedData, 'utf8');

    if (GZIP) {
      const gzip = promisify(zlib.gzip);
      const zippedData = await gzip(outputBuffer);
      gzippedBuffer = Buffer.from(zippedData.toString('base64'), 'utf8');
    }

  } else {
    outputBuffer = Buffer.from(data, 'utf8');
  }
  //log(data);
  //log(minified.code);

  log(`createDistFile(): Creating dist file for "${filePath}" done`);
  await fs.writeFile(distPath, GZIP && !isShellyScript ? gzippedBuffer : outputBuffer);

  if (GZIP && !isShellyScript) {
    const fileExt = path.extname(distPath);

    await fs.writeFile(distPath.replace(fileExt, `.nozip${fileExt}`), outputBuffer);
  }
}

/**
 * Uploads all script files from ./src to the Shelly
 * Orders by name
 */
const uploadAll = async () => {
  let files = await fs.readdir('./dist', { recursive: false });

  for (let file of files.sort()) {
    const distPath = path.join('./dist', file);
    const fileInfo = await fs.stat(distPath);

    if (!fileInfo.isFile()) {
      continue;
    }
    await deleteScript(file);
    await createScript(file);
    const id = await getScriptId(file);
    await uploadScript(file, id, distPath);
    await setScriptEnable(id, true);
    await startScript(id);
  }

  log(`All files uploaded!`);
  printStats();
}

/**
 * Builds and creates ./dist files
 */
const buildAll = async () => {
  await fs.rm('./dist', { recursive: true, force: true });
  await fs.mkdir('./dist');
  await fs.mkdir('./dist/statics');

  let files = await fs.readdir('./src/statics', { recursive: false });

  for (let file of files.sort()) {
    const filePath = path.join('./src/statics', file);
    const distPath = path.join('./dist/statics', file);

    const fileInfo = await fs.stat(filePath);

    if (!fileInfo.isFile()) {
      continue;
    }
    await createDistFile(filePath, distPath, false);
  }


  files = await fs.readdir('./src', { recursive: false });

  for (let file of files.sort()) {
    const filePath = path.join('./src', file);
    const distPath = path.join('./dist', file);

    const fileInfo = await fs.stat(filePath);

    if (!fileInfo.isFile()) {
      continue;
    }

    await createDistFile(filePath, distPath, true);
  }
  log(`All files built!`);
  printStats();
}

const printStats = async () => {

  log('--------------------------------------------------');
  log('Static files:');
  log('');
  let statics = await fs.readdir('./dist/statics', { recursive: false });
  for (let file of statics.sort()) {

    if (file.includes(".nozip.")) {
      continue;
    }

    const distPath = path.join('./dist/statics', file);
    const fileInfo = await fs.stat(distPath);

    if (!fileInfo.isFile()) {
      continue;
    }

    log(`  ${file}`);
    if (MAX_STATIC_FILE_SIZE - fileInfo.size < 100) {
      log(`    ${(fileInfo.size / 1024.0).toFixed(1)} KB\t${(MAX_STATIC_FILE_SIZE - fileInfo.size)} bytes left (used ${(fileInfo.size / MAX_STATIC_FILE_SIZE * 100.0).toFixed(0)} %) <---- WARNING!!!`);
    } else {
      log(`    ${(fileInfo.size / 1024.0).toFixed(1)} KB\t${(MAX_STATIC_FILE_SIZE - fileInfo.size)} bytes left (used ${(fileInfo.size / MAX_STATIC_FILE_SIZE * 100.0).toFixed(0)} %)`);
    }
  }

  log('--------------------------------------------------');
  let files = await fs.readdir('./dist', { recursive: false });

  log('File stats:');
  log('');

  let count = 0;
  for (let file of files.sort()) {
    const distPath = path.join('./dist', file);
    const fileInfo = await fs.stat(distPath);

    if (!fileInfo.isFile()) {
      continue;
    }

    log(`  ${file}`);
    log(`    ${(fileInfo.size / 1024.0).toFixed(1)} KB\t${(MAX_SCRIPT_SIZE - fileInfo.size)} bytes left (used ${(fileInfo.size / MAX_SCRIPT_SIZE * 100.0).toFixed(0)} %)`);
    count++;
  }
  log('');
  log(`Scripts in use ${count}/3`);

  log('--------------------------------------------------');
}

const uploadAndBuildAll = async () => {
  await buildAll();
  await uploadAll();
}

const listenUdp = async () => {
  fs.unlink("./log.txt").catch();

  const socket = dgram.createSocket('udp4');

  socket.addListener('message', (msg, rinfo) => {
    let str = msg.toString('utf-8');
    str = str.substring(str.indexOf("|") + 1);
    str = str.substring(str.indexOf(" ") + 1);
    str = str.trim();

    if (str.includes("1 clears ")) {
      return;
    }

    log(str);

    let time = new Date().toISOString();
    time = time.substring(time.indexOf("T") + 1);
    fs.appendFile("./log.txt", `${time}: ${str} \n`).catch();
  });

  socket.bind(UDP_DEBUG_PORT, () => {
    log(`Listening to UDP port ${UDP_DEBUG_PORT}`);
  });
}

//Handling command line parameters
const args = process.argv.splice(2);

switch (args[0]) {
  case '--build':
    buildAll();
    break;

  case '--upload':
    uploadAll();
    break;

  case '--debug':
    listenUdp();
    break;

  case undefined:
  default:
    console.log(`Error: Unknown command-line arguments: ${args}`);
}

//