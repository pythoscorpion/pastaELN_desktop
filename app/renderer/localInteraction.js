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
  /** get credentials from json file
   */
  const fs = window.require('fs');
  const path = process.env.HOME+'/.pasta.json';   // eslint-disable-line no-undef
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
    if (credential.cred) {
      const child_process = require('child_process');
      var result = child_process.execSync('pastaDB.py up -i '+credential.cred);
      [credential['user'], credential['password']] = result.toString().slice(4,-1).split(':');
    }
    return {credentials:credential, tableFormat:config['-tableFormat-'], configuration:config};
  } else {
    return {credentials:null, tableFormat:null};  // error ocurred
  }
}

function editDefault(site,value){
  console.log(site,value);
  const fs = window.require('fs');
  const path = process.env.HOME+'/.pasta.json';   // eslint-disable-line no-undef
  if (fs.existsSync(path)) {
    var config = JSON.parse( fs.readFileSync(path).toString() );
    config[site] = value;
    fs.writeFileSync(path,  JSON.stringify(config,null,2) );
  }
}

function saveCredentials(object){
  var name = object.name;
  delete object['name']
  const fs = window.require('fs');
  const pathJson = process.env.HOME+'/.pasta.json';   // eslint-disable-line no-undef
  if (fs.existsSync(pathJson)) {
    var config = JSON.parse( fs.readFileSync(pathJson).toString() );
    config[name] = object;
    fs.writeFileSync(pathJson,  JSON.stringify(config,null,2) );
  }
  if (object.path) {
    fs.mkdir(object.path, function(err) {
      if (err) {
        console.log("Directory likely existed",err);
      } else {
        console.log("New directory created: "+object.path);
      };
    });
  }
  const url = Store.getURL();
  console.log("Create database "+object.database);
  url.url.put(object.database).then((res) => {
    const thePath = '/'+object.database+'/';
    const doc     = {"_id": "-ontology-","-hierarchy-": ["project","step","task"]};
    url.url.post(thePath,doc).then(() => {
      console.log('Creation of ontology successful');
    }).catch((err)=>{
      console.log('Ontology likely existed',err);
    });
  }).catch((err)=>{
    console.log('Database likely existed (if code=412)',err);
  });
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
  //- "test" connection to backend->database->local file storage
  //- "verifyDB" integrity, logic tests
  //- "loadBackup", "saveBackup"
  //- "sync" = replicate
  //- "scan" + docID : scan that project for new content: new measurements
  //- "saveHierarchy" + docID + content: save project structure (substeps, subtasks) to harddisk and database
  //- "createDoc" ( + docID ) + content: create a new measurement, project, procedure by interactive with harddisk and database
  //- "redo" + docID + content: redo measurement with docID and content=doc.type.join('/')
  if (taskArray[3]==='saveHierarchy'){
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
  var cmd = 'pastaDB.py '+taskArray[3]
  if (docID)
    cmd +=  ' --docID '+docID;
  if (content)
    cmd += ' --content "'+content+'"';
  console.log("executeCMD",cmd);  //for debugging backend: just run this
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
        callback(stdout+'\nsuccess '+task);
      }
    });
  }
  if (task==='btn_cfg_be_updatePASTA'){
    //update reactElectron
    child_process.exec('git pull', (error, stdout) => {
      if (error) {
        callback(error.message+' Frontend\nFAILURE '+task);
      } else {
        callback(stdout.trim()+' Frontend\nsuccess '+task);
      }
    });
  }
}

function getHomeDir() {
  if (process.platform=='win32')
    return process.env.HOME+'\\My Documents\\';
  return process.env.HOME+'/';
}

exports.ELECTRON = ELECTRON;
exports.getCredentials = getCredentials;
exports.editDefault = editDefault;
exports.saveCredentials = saveCredentials;
exports.executeCmd = executeCmd;
exports.getHomeDir = getHomeDir;