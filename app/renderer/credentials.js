function getCredentials(){
  try {                 // *** React-Electron version: has fs ***
    const fs = window.require('fs');
    const path = process.env.HOME+'/.agileScience.json';
    console.log('Read file: '+path);
    if (fs.existsSync(path)) {
      const config = JSON.parse( fs.readFileSync(path).toString() );
      if (config['use']==='local') {
        const local = {user: config.user, password: config.password, 
          url: "http://127.0.0.1:5984",   database: config.database};
        return local;
      }
      return config['remote'];
    } else {
      const remote = {
        user: "6312f45e-b47e-43fb-b2c8-fd3ba43ea76d-bluemix",
        password: "b0296a60a0f8879c09a3ceff62b67c175db9f8354fb84cfb44d7c2b3c961e86f",
        url: "https://6312f45e-b47e-43fb-b2c8-fd3ba43ea76d-bluemix.cloudantnosqldb.appdomain.cloud",
        database: "agile_science"
        }
      return remote;
    }
  } catch(err) {    // *** React-DOM version: fails at fs ***
    const local = {user: 'admin', password: 'agile', 
                  url: "",   database: 'agile_science'}; //local url is produced via proxy in package.json
    return local;
  }
}

exports.getCredentials = getCredentials;
