function getCredentials(){
  /** get credentials from json file, or hard coded one from here
   */
  try {                 // *** React-Electron version: has fs ***
    const fs = window.require('fs');
    const path = process.env.HOME+'/.jamDB.json';
    console.log('I have read file: '+path);
    if (fs.existsSync(path)) {
      var config = JSON.parse( fs.readFileSync(path).toString() );
      config = config['local'];  //TODO allow user to change, add
      if (!("url" in config) || (config['url']===null)){
        config['url']='http://127.0.0.1:5984';
      }
      return config;
    } else {
      return null;  // error ocurred
    }
  } catch(err) {    // *** React-DOM version: fails at fs ***
    return null;    // the local url is produced by the proxy setting in package.json
  }
}

exports.getCredentials = getCredentials;
