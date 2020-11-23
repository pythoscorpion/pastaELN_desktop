/** React-DOM version that does not interact locally
 *  - this is the sibling of the same file in React-Electron
 *      -> that version has real local interaction
 *  - both should have the same exported functions,...
 *  - these should be the only files that differ in both; AKA they are not hard-linked
 *
 * test if this is really React-Electron
 *      if{window && window.process && window.process.type){
*/

const REACT_VERSION = 'Electron';

function getCredentials(){
  /** get credentials from json file
   */
  const fs = window.require('fs');
  const path = process.env.HOME+'/.jamDB.json';   // eslint-disable-line no-undef
  console.log('I have read file: '+path);
  if (fs.existsSync(path)) {
    var config = JSON.parse( fs.readFileSync(path).toString() );
    config = config['local'];  //TODO allow user to change, add
    if (!('url' in config) || (config['url']===null)){
      config['url']='http://127.0.0.1:5984';
    }
    return config;
  } else {
    return null;  // error ocurred
  }
}

function executeCmd(orgin, cmd) {
  /** execute local command
   */
  console.log(orgin);
  console.log(cmd);
  const child_process = require('child_process');
  child_process.exec('ls -la', (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
  });
}

exports.REACT_VERSION = REACT_VERSION;
exports.getCredentials = getCredentials;
exports.executeCmd = executeCmd;