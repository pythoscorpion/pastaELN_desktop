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
  if (fs.existsSync(path)) {
    var config = JSON.parse( fs.readFileSync(path).toString() );
    const configName = config['-defaultLocal'];
    config = config[configName];  //TODO Steffen read from config supersedes this allow user to change, add; or/and allow user to select config
    if (!('path') in config){
      config['path']=null;
    }
    console.log('File:',path,'  ConfigName:',configName,' Database and path on harddisk',config['database'],config['path'])
    if (!('url' in config) || (config['url']===null)){
      config['url']='http://127.0.0.1:5984';
    }
    return config;
  } else {
    return null;  // error ocurred
  }
}

function executeCmd(task,content,callback) {
  /** execute local command
   */
  const child_process = require('child_process');
  if (task==='testConnection')
    child_process.exec('jamDB.py test', (error, stdout) => {
      if (error)
        console.log(`Test FAILED with output:\n ${error.message}`);
      callback(stdout);
    });
  if (task==='scanHarddrive')
    child_process.exec('jamDB.py scan --docID '+content, (error, stdout) => {
      if (error)
        console.log(`Scan of project FAILED with output:\n ${error.message} ${stdout}`);
      else
        console.log(`Scan successful with output:\n${stdout}`);  //TODO temporary, delete later
      callback();
    });
  if (task==='saveToDB') {
    var orgModeString = content[1].split('\n');
    orgModeString = orgModeString.filter(function(item){  //TODO Steffen filter out only projects/steps/tasks
      return item.indexOf('||t-')>-1;
    });
    orgModeString = orgModeString.join('\n');
    child_process.exec('jamDB.py save --docID '+content[0]+' --content "'+orgModeString+' "', (error, stdout) => {
      if (error)
        console.log(`Save to DB FAILED with output:\n ${error.message} ${stdout}`);
        else
        console.log(`Save successful with output:\n${stdout}`);  //TODO temporary, delete later
      callback();
    });
  }
}

exports.REACT_VERSION = REACT_VERSION;
exports.getCredentials = getCredentials;
exports.executeCmd = executeCmd;