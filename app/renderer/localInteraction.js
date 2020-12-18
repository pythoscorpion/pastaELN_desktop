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
    config = config[configName];
    if (!(('path') in config)){
      config['path']=null;
    }
    console.log('File:',path,'  ConfigName:',configName,' Database and path on harddisk',config['database'],config['path']);
    if (!('url' in config) || (config['url']===null)){
      config['url']='http://127.0.0.1:5984';
    }
    return config;
  } else {
    return null;  // error ocurred
  }
}

function executeCmd(task,content,callback) {
  /** execute local command using child-processes
   */
  const child_process = require('child_process');
  if (task==='testConnection') {                                //test connection to backend->database->local file storage
    child_process.exec('jamDB.py test', (error, stdout) => {
      if (error) {
        console.log(`Test FAILED with output:\n ${error.message}`);
        callback(error.message);
      } else {
        callback(stdout.trim()+' '+task);
      }
    });
  }
  if (task==='verifyDB') {                                      //verify DB integrity, logic tests
    child_process.exec('jamDB.py checkDB', (error, stdout) => {
      if (error) {
        console.log(`verifyDB FAILED with output:\n ${error.message}`);
        callback(error.message);
      } else {
        callback(stdout.trim()+' '+task);
      }
    });
  }
  if (task==='scanHarddrive') {                                 //scan harddisk for new content: new measurements
    child_process.exec('jamDB.py scan --docID '+content, (error, stdout) => {
      if (error) {
        console.log(`Scan of project FAILED with output:\n ${error.message} ${stdout}`);
        callback('ERROR scanHarddrive');
      } else {
        console.log(`Scan successful with output:\n${stdout}`);
        callback('SUCCESS scanHarddrive');
      }
    });
  }
  if (task==='saveToDB') {                                      //save project structure (substeps, subtasks) to harddisk and database
    var orgModeString = content[1];
    //TODO SB P3 filter out only projects/steps/tasks survive in orgMode string
    //  other documents are not supported by backend yet
    orgModeString = orgModeString.split('\n').filter(function(item){
      return item.indexOf('||t-')>-1;
    });
    orgModeString = orgModeString.join('\n');
    //end of temporary filtering until backend is adopted
    orgModeString = orgModeString.replace(/\n/g,'\\n');
    if (orgModeString[0]===' ')
      orgModeString=orgModeString.slice(1);
    console.log('Command used:\n'+'jamDB.py save --docID '+content[0]+' --content "'+orgModeString+'"');
    child_process.exec('jamDB.py save --docID '+content[0]+' --content "'+orgModeString+'"', (error, stdout) => {
      if (error) {
        console.log(`Save to DB FAILED with output:\n ${error.message} ${stdout}`);
        callback('ERROR saveToDB');
      } else {
        console.log(`Save successful with output:\n${stdout}`);
        callback('SUCCESS saveToDB');
      }
    });
  }
  if (task==='createDoc') {                                     //create a new measurement, project, procedure by interactive with harddisk and database
    var docID   = content[1];
    var docString = '--docID '+docID;
    if (content[0]['docType']==='project') docString = '';
    var contentString = String(JSON.stringify(content[0]));
    contentString = contentString.replace(/"/g,'\'');
    child_process.exec('jamDB.py addDoc '+docString+' --content "'+contentString+' "', (error, stdout) => {
      if (error) {
        console.log(`addDoc FAILED with output:\n ${error.message} ${stdout}`);
        callback('ERROR createDoc');
      } else {
        console.log(`addDoc successful with output:\n${stdout}`);
        callback('SUCCESS createDoc');
      }
    });
  }
  if (task=='sync'){
    child_process.exec('jamDB.py sync', (error, stdout) => {
      if (error) {
        console.log(`sync FAILED with output:\n ${error.message} ${stdout}`);
        callback('ERROR sync');
      } else {
        console.log(`sync successful with output:\n${stdout}`);
        callback('SUCCESS sync');
      }
    });
  }
}

exports.REACT_VERSION = REACT_VERSION;
exports.getCredentials = getCredentials;
exports.executeCmd = executeCmd;