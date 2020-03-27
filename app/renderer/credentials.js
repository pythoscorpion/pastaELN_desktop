function getCredentials(){
  try {                 // *** React-Electron version: has fs ***
    const fs = window.require('fs');
    const config = JSON.parse( fs.readFileSync(process.env.HOME+'/.agileScience.json').toString() );
    if (config['use']==='local') {
      const local = {user: config.user, password: config.password, 
        url: "http://127.0.0.1:5984",   database: config.database};
      return local;
    }
    return config['remote'];
    } catch(err) {    // *** React-DOM version: fails at fs ***
    const local = {user: 'admin', password: 'agile', 
                  url: "",   database: 'agile_science'}; //local url is produced via proxy in package.json
    return local;
  }
}

exports.getCredentials = getCredentials;
