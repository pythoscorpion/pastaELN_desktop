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
    var credential = config[configName];
    if (!(('path') in credential)){
      credential['path']=null;
    }
    console.log('File:',path,'  ConfigName:',configName,' Database and path on harddisk',credential['database'],credential['path']);
    if (!('url' in credential) || (credential['url']===null)){
      credential['url']='http://127.0.0.1:5984';
    }
    return {credentials:credential, tableFormat:config['-tableFormat-']};
  } else {
    return {credentials:null, tableFormat:null};  // error ocurred
  }
}


function executeCmd(task,callback,docID=null,content=null) {
  /** execute local command using child-processes
   */
  console.log("Start executeCmd");
  console.log(task,docID,content);
  const child_process = require('child_process');
  const taskArray = task.split('_');
  if (taskArray[2]!='be') {
    console.log('executeCmd got no backend',task);
    return;
  }

  //all backend tasks:
  //- "test" connection to backend->database->local file storage
  //- "verifyDB" integrity, logic tests
  //- "loadBackup", "saveBackup"
  //- "sync" = replicate
  //- "scan" + docID : scan that project for new content: new measurements
  //- "saveHierarchy" + docID + content: save project structure (substeps, subtasks) to harddisk and database
  //- "createDoc" ( + docID ) + content: create a new measurement, project, procedure by interactive with harddisk and database
  if (taskArray[3]==='saveHierarchy'){
    //TODO SB P3 filter out only projects/steps/tasks survive in orgMode string
    //  other documents are not supported by backend yet
    content = content.split('\n').filter(function(item){
      return item.indexOf('||t-')>-1;
    });
    content = content.join('\n');
    //end of temporary filtering until backend is adopted
    content = content.replace(/\n/g,'\\n');
    if (content[0]===' ')
      content=content.slice(1);
  }
  if (taskArray[3]==='createDoc') {
    if (content['docType']==='project')
      docID = null;
    content = String(JSON.stringify(content));
    content = content.replace(/"/g,'\'');
  }
  //create command
  var cmd = 'jamDB.py '+taskArray[3]
  if (docID)
    cmd +=  ' --docID '+docID;
  if (content)
    cmd += ' --content "'+content+'"';
  console.log("executeCMD",cmd);
  child_process.exec(cmd, (error, stdout) => {
    if (error) {
      callback(error.message+' '+task);
    } else {
      callback(stdout.trim()+' '+task);
    }
  });
  if (task==='btn_cfg_be_test'){
    child_process.exec('git show -s --format=%ci', (error, stdout) => {
      if (error) {
        callback(error.message+' Frontend\nFAILURE '+task);
      } else {
        stdout = 'Frontend software version: '+stdout.trim().split(' ').slice(0,2).join(' ');
        callback(stdout+'\nSUCCESS '+task);
      }
    });
  }
  if (task==='btn_cfg_be_updateJamDB'){
    //update reactElectron
    child_process.exec('git pull', (error, stdout) => {
      if (error) {
        callback(error.message+' Frontend\nFAILURE '+task);
      } else {
        callback(stdout.trim()+' Frontend\nSUCCESS '+task);
      }
    });
    child_process.exec('npm install', (error, stdout) => {
      if (error) {
        callback(error.message+' npm install\nFAILURE '+task);
      } else {
        callback(stdout.trim()+' npm install\nSUCCESS '+task);
      }
    });
  }

}

exports.REACT_VERSION = REACT_VERSION;
exports.getCredentials = getCredentials;
exports.executeCmd = executeCmd;