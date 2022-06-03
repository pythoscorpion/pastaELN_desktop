/** React-DOM version that does not interact locally
 *  - this is the sibling of the same file in React-Electron
 *      -> that version has real local interaction
 *  - both should have the same exported functions,...
 *  - these should be the only files that differ in both; AKA they are not hard-linked
 *
 * test if this is really React-Electron
 *      if{window && window.process && window.process.type){
*/
import Store from './Store';
const ELECTRON = true;

function getCredentials(){
  /** get credentials and the entire content from json file
   */
  const fs = window.require('fs');
  const path = process.env.HOME+'/.pastaELN.json';   // eslint-disable-line no-undef
  if (fs.existsSync(path)) {
    var config = JSON.parse( fs.readFileSync(path).toString() );
    const configName = config['default'];
    if (!configName) {
      console.log('default not in configuration. Choose first.');
      configName = Object.keys(config['links'])[0];
    }
    if (!config['links'][configName]) {
      console.log('**ERROR config name not in links');
    }
    var credential = config['links'][configName]['local'];
    if (!credential) {
      console.log('default entry '+configName+' not in links');
      configName = Object.keys(config['links'])[0]['local'];
      credential = config['links'][configName];
    }
    if (!(('path') in credential)){
      console.log('path not in sub-configuration '+configName);
      credential['path']=null;
    }
    console.log('File:',path,'  ConfigName:',configName,' Database and path on harddisk',credential['database'],credential['path']);
    if (!('url' in credential) || (credential['url']===null)){
      credential['url']='http://127.0.0.1:5984';
    }
    if (credential.cred) {
      const child_process = require('child_process');
      const softwareDir = config['softwareDir'];
      var result = child_process.execSync('pastaELN.py up -i '+credential.cred, {cwd:softwareDir});
      result = result.toString().slice(5,-2).split(',')
      result = result.map(i=>{return(i.trim().slice(1,-1).split(':'))});
      [credential['user'], credential['password']] = result.length==1 ? result[0] : result;
    }
    return {credentials:credential, configuration:config};
  } else {
    return {credentials:null, configuration:null};  // error ocurred
  }
}

function getUP(aString){
  const child_process = require('child_process');
  var softwareDir = Store.getConfiguration();
  softwareDir = softwareDir['softwareDir'];
  var result = child_process.execSync('pastaELN.py up -i '+aString, {cwd:softwareDir});
  result = result.toString().slice(5,-2).split(',')
  result = result.map(i=>{return(i.trim().slice(1,-1).split(':'))});
  return result.length==1 ? result[0] : result;
}

function editDefault(value){
  const fs = window.require('fs');
  const path = process.env.HOME+'/.pastaELN.json';   // eslint-disable-line no-undef
  if (fs.existsSync(path)) {
    var config = JSON.parse( fs.readFileSync(path).toString() );
    config['default'] = value;
    fs.writeFileSync(path,  JSON.stringify(config,null,2) );
  }
}

function deleteConfig(name){
  const fs = window.require('fs');
  const path = process.env.HOME+'/.pastaELN.json';   // eslint-disable-line no-undef
  if (fs.existsSync(path)) {
    var config = JSON.parse( fs.readFileSync(path).toString() );
    delete config.links[name];
    if (config['default']==name)
      config['default']=Object.keys(config.links)[0];
    fs.writeFileSync(path,  JSON.stringify(config,null,2) );
  }

}

function saveCredentials(object){
  var name = object.name;
  delete object['name'];
  if (!object.remote.user)
    object.remote = {};
  const fs = window.require('fs');
  const pathJson = process.env.HOME+'/.pastaELN.json';   // eslint-disable-line no-undef
  if (fs.existsSync(pathJson)) {
    var config = JSON.parse( fs.readFileSync(pathJson).toString() );
    config.links[name] = object;
    config['default'] = name;
    fs.writeFileSync(pathJson,  JSON.stringify(config,null,2) );
  }
}

function saveTableFormat(docType,colWidth){
  const fs = window.require('fs');
  const path = process.env.HOME+'/.pastaELN.json';   // eslint-disable-line no-undef
  if (fs.existsSync(path)) {
    var config = JSON.parse( fs.readFileSync(path).toString() );
    if (config['tableFormat'][docType]) {
      config['tableFormat'][docType]['-default-'] = colWidth;
    } else {
      config['tableFormat'][docType] = {'-default-':colWidth};
    }
    fs.writeFileSync(path,  JSON.stringify(config,null,2) );
  }
}

function saveTableLabel(labels){
  const fs = window.require('fs');
  const path = process.env.HOME+'/.pastaELN.json';   // eslint-disable-line no-undef
  if (fs.existsSync(path)) {
    var config = JSON.parse( fs.readFileSync(path).toString() );
    Object.keys(labels).map(docType=>{
      if (docType in config['-tableFormat-'])
        config['-tableFormat-'][docType]['-label-'] = labels[docType];
      else
        config['-tableFormat-'][docType] = {'-label-':labels[docType]};
    });
    fs.writeFileSync(path,  JSON.stringify(config,null,2) );
  }
}

function executeCmd(task,callback,docID=null,content=null) {
  /** execute local command using child-processes
   */
  const child_process = require('child_process');
  const taskArray = task.split('_');
  if (taskArray[2]!='be') {
    console.log('executeCmd got no backend',task);
    return;
  }

  //all backend tasks:
  //- "test" = "Health check", connection to backend->database->local file storage
  //- "verifyDB" integrity, logic tests
  //- "loadBackup", "saveBackup"
  //- "sync" = replicate
  //- "scan" + docID : scan that project for new content: new measurements
  //- "saveHierarchy" + docID + content: save project structure (substeps, subtasks) to harddisk and database
  //- "createDoc" ( + docID ) + content: create a new measurement, project, procedure by interactive with harddisk and database
  //- "redo" + docID + content: redo measurement with docID and content=doc['-type'].join('/')
  if (taskArray[3]==='saveHierarchy'){
    content = content.replace(/\n/g,'\\n');
    if (content[0]===' ')
      content=content.slice(1);
  }
  if (taskArray[3]==='createDoc') {
    if (content['docType']==='x0')
      docID = null;
    content = String(JSON.stringify(content));
    // content = content.replace(/"/g,'\'');
  }
  //possible issue encodeURI(content) decode in python
  //create command
  var cmd = 'pastaELN.py '+taskArray[3];
  if (docID)
    cmd +=  ' --docID '+docID;
  if (content)
    cmd += " --content '"+content+"'";
  const softwareDir = Store.getConfiguration()['softwareDir'];
  console.log('executeCMD',cmd, softwareDir );  //for debugging backend: just run this
  child_process.exec(cmd, {cwd:softwareDir} , (error, stdout) => {
    console.log(cmd+'\n'+stdout);
    if (error) {
      callback(error.message+' '+task);
      throw(error);
    } else {
      callback(stdout.trim()+' '+task);
    }
  });
  if (task==='btn_cfg_be_test'){
    child_process.exec('git show -s --format=%ci', (error, stdout) => {
      if (error) {
        callback(error.message+' Frontend\nFAILURE '+task);
        throw(error);
      } else {
        stdout = 'Frontend software version: '+stdout.trim().split(' ').slice(0,2).join(' ');
        callback(stdout+'\nsuccess '+task);
      }
    });
  }
}

function getHomeDir() {
  if (process.platform=='win32')
    return process.env.HOME+'\\My Documents\\';
  return process.env.HOME+'/';
}

function testDirectory(path){
  const fs = window.require('fs');
  if (fs.existsSync(path)) {
    return true;
  }
  return false;
}

exports.ELECTRON = ELECTRON;
exports.getCredentials = getCredentials;
exports.editDefault = editDefault;
exports.saveCredentials = saveCredentials;
exports.saveTableFormat = saveTableFormat;
exports.saveTableLabel = saveTableLabel;
exports.executeCmd = executeCmd;
exports.getHomeDir = getHomeDir;
exports.testDirectory = testDirectory;
exports.getUP = getUP;
exports.deleteConfig= deleteConfig;