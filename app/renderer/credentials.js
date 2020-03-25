const fs = window.require('fs');

function getCredentials(){
  const config = JSON.parse( fs.readFileSync(process.env.HOME+'/'+'.agileScience.json').toString() );
  if (config['use']==='local') {
    const local = {user: config.user, password: config.password, 
      url: "http://127.0.0.1:5984",   database: config.database};
    return local;
  }
  return config['remote'];
}

exports.getCredentials = getCredentials;
