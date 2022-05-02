/* CONFIGURATION-EDITOR
 * Modal that allows the user to add/edit database configurations
*/
import React, { Component } from 'react';                         // eslint-disable-line no-unused-vars
import { Button, Input, InputAdornment, IconButton, TextField,    // eslint-disable-line no-unused-vars
  InputLabel, Select, MenuItem, FormControl, Grid} from '@material-ui/core';// eslint-disable-line no-unused-vars
import { Visibility, VisibilityOff } from '@material-ui/icons';   // eslint-disable-line no-unused-vars
import { Alert } from '@material-ui/lab';                         // eslint-disable-line no-unused-vars
import QRCode from 'qrcode.react';                               // eslint-disable-line no-unused-vars
import axios from 'axios';
import { saveCredentials, getHomeDir, getCredentials, deleteConfig, getUP, testDirectory,
  executeCmd } from '../localInteraction';
import { modal, modalContent, btn, btnStrong, h1, colorBG} from '../style';

export default class ModalConfiguration extends Component {
  constructor() {
    super();
    this.state = {
      showPassword: false,
      config: '--addNew--',
      qrString: '',
      local:  {testServer: '', testLogin: '', testDB: '', testPath: ''},
      remote: {testServer: '', testLogin: '', testDB: ''}
    };
  }
  componentDidMount() {
    this.setState({link: {"local":{"database":"","path":getHomeDir(),"user":"","password": ""},
      "remote": {"url": "", "database": "", "user": "", "password":""}}});
    this.setState({configuration: getCredentials().configuration });
  }


  /** Functions as class properties (immediately bound): react on user interactions **/
  togglePWD = () => {
    this.setState({ showPassword: !this.state.showPassword });
  }

  pressedSaveBtn = () => {
    var link = this.state.link;
    if (this.state.localRemote === 'local')
      delete link['url'];
    else
      delete link['path'];
    if (link.cred && link.user) {
      delete link['user'];
      delete link['password'];
    }
    saveCredentials(link);
    this.props.callback();
  }

  pressedTestBtn = () => {
    var link = {...this.state.link};
    if (link.local.cred)
      delete link.local.cred;
    if (link.remote.cred)
      delete link.remote.cred;

    //local tests -- no creation on QR code
    axios.get('http://127.0.0.1:5984').then((res) => {
      if (res.data.couchdb == 'Welcome') {
        this.setState({local:Object.assign(this.state.local,{testServer:'OK'})});
      }
    }).catch(()=>{
      this.setState({local:Object.assign(this.state.local,
        {testServer:'ERROR', testLogin:'ERROR',testDB:'ERROR'})});
    });
    axios.get('http://127.0.0.1:5984/_all_dbs',
      { auth: { username: link.local.user, password: link.local.password } }).then(() => {
      this.setState({local:Object.assign(this.state.local,{testLogin:'OK'})});
    }).catch(()=>{
      this.setState({local:Object.assign(this.state.local, {testLogin:'ERROR',testDB:'ERROR'})});
    });
    axios.get('http://127.0.0.1:5984/' + link.local.database + '/',
      { auth: { username: link.local.user, password: link.local.password } }).then((res) => {
      if (res.data.db_name == link.local.database) {
        this.setState({local:Object.assign(this.state.local,{testDB:'OK'})});
      } else {
        this.setState({local:Object.assign(this.state.local,{testDB:'ERROR'})});
      }
    }).catch(()=>{
      this.setState({local:Object.assign(this.state.local,{testDB:'ERROR'})});
    });
    if (testDirectory(link.local.path)) {
      this.setState({local:Object.assign(this.state.local,{testPath:'OK'})});
    } else {
      this.setState({local:Object.assign(this.state.local,{testPath:'ERROR'})});
    }

    //remote tests and create QR code
    const server = link.remote.url.indexOf('http') > -1 ? link.remote.url.split(':')[1].slice(2)
      : link.remote.url;
    var url = server.length==0 ? '' : 'http://'+server+':5984';
    axios.get(url).then((res) => {
      if (res.data.couchdb == 'Welcome') {
        this.setState({remote:Object.assign(this.state.remote,{testServer:'OK'})});
      }
    }).catch(()=>{
      this.setState({remote:Object.assign(this.state.remote,
        {testServer:'ERROR',testLogin:'ERROR',testDB:'ERROR'})});
    });
    axios.get(url+'/'+link.remote.database+'/',
      { auth: { username: link.remote.user, password: link.remote.password } }).then((res) => {
      if (res.data.db_name == link.remote.database) {
        this.setState({remote:Object.assign(this.state.remote,{testLogin: 'OK', testDB:'OK'})});
      }
    }).catch(()=>{
      this.setState({remote:Object.assign(this.state.remote,{testLogin:'ERROR', testDB:'ERROR'})});
    });
    const qrString = {server:server, user:link.remote.user, password:link.remote.password,
                      database: link.remote.database};
    this.setState({qrString: JSON.stringify({ [this.state.config]: qrString})});
  }


  pressedDeleteBtn = () => {
    deleteConfig(this.state.config);
    var configuration = this.state.configuration;
    delete configuration[this.state.config];
    this.setState({configuration:configuration,config:'--addNew--'});
    this.setState({link:{user:'',password:'',database:'',url:'',path:getHomeDir(),name:''}});
  }


  createDB = () =>{
    /** Create database on local server */
    var conf = this.state.link;
    var url = axios.create({baseURL: 'http://127.0.0.1:5984',
      auth: {username: conf.user.trim(), password: conf.password.trim()}
    });
    url.put(conf.database).then((res)=>{
      if (res.data.ok == true) {
        console.log('Success creating database. Ontology will be created during health test.');
        this.setState({testDB:'OK'});
      } else {
        this.setState({testDB:'ERROR'});
      }
    }).catch(()=>{
      this.setState({testDB:'ERROR'});
    });
  }

  changeConfigSelector = (event) => {
    this.setState({ config: event.target.value, testServer: '', testLogin:'', testPath:'' });
    var thisConfig = this.state.configuration.links[event.target.value];
    if (thisConfig) {
      const credLocal  = thisConfig.local ? getUP(thisConfig.local.cred) : {} ;
      const credRemote = thisConfig.remote ? getUP(thisConfig.remote.cred): {};
      thisConfig.local['user'] = credLocal[0];
      thisConfig.local['password'] = credLocal[1];
      thisConfig.remote['user'] = credRemote[0];
      thisConfig.remote['password'] = credRemote[1];
      this.setState({ link: thisConfig });
    } else {
      this.setState({link: {"local":{"database":"","path":getHomeDir(),"user":"","password": ""},
        "remote": {"url": "", "database": "", "user": "", "password":""}}});
    }
  }


  changeType = (event) => {
    this.setState({ localRemote: event.target.value });
    if (event.target.value=='remote'){
      var link = this.state.link;
      delete link['path'];
      this.setState({link: link});
    }
  }

  loginChange = (event, task, site) => {
    var link = this.state.link;
    link[site][task] = (task=='database') ? event.target.value.replace(/^[^a-z]|[\W]/g,'').toLowerCase()
      : event.target.value;
    this.setState({link:link});
  }

  //File handling: what to do with content
  onChangeFile(event) {
    event.stopPropagation();
    event.preventDefault();
    const reader = new FileReader();
    reader.onload = async (event) => {
      executeCmd('btn_modCfg_be_decipher', this.callback, null, (event.target.result));
    };
    reader.readAsBinaryString(event.target.files[0]);
  }
  callback=(content)=>{
    const inData = JSON.parse(content.split('\n')[0]);
    const link =  {user: inData['user-name'], password: inData['password'],
      database: inData['database'], url: inData['Server'], name: inData['configuration name']};
    this.setState({localRemote: 'remote', link:link});
  }

  /** the render method **/
  render() {
    const { link, showPassword } = this.state;
    if (this.props.show=='none' || !link) {
      return (<div></div>);
    }
    var options = this.state.configuration ? Object.keys(this.state.configuration.links) : [];
    options = options.map((item) => {
      return (<MenuItem value={item} key={item}>{item}</MenuItem>);
    });
    options = options.concat(<MenuItem key='--addNew--' value='--addNew--'>{'-- Add new --'}</MenuItem>);
    const enabled = this.state.local.testLogin=='OK' && this.state.local.testPath=='OK' &&
                    this.state.local.testDB=='OK'    && this.state.remote.testLogin=='OK' &&
                    this.state.remote.testDB=='OK'   ;
    return (
      <div className="modal" style={{...modal, ...{ display: this.props.show }}}>
        <div className="modal-content" style={modalContent}>
          <div className="col p-0">
            <div className="px-3 py-4" style={{...h1, ...btnStrong}}>
              {/*=======PAGE HEADING=======*/}
              Add / Edit / Show configuration
            </div>
            <div className='row p-4'>
              <div className='col-sm-6 pt-3'>
                <Select onChange={e => this.changeConfigSelector(e)} value={this.state.config} fullWidth>
                  {options}
                </Select>
              </div>
              <div className='col-sm-6'>
              <TextField type='text' label='configuration name' onChange={e => this.loginChange(e, 'name')}
                value={this.state.config=='--addNew--' ? '': this.state.config} required fullWidth
                id='confName'/>
              </div>
            </div>
            <div className='row p-3'>
              {/*=======CONTENT LEFT=======*/}
              <div className='col-sm-4'>
                <div className='p-2'>
                  <strong>Local server</strong>
                </div>
                <div className="form-popup m-2" >
                  <form className="form-container">
                    <TextField type='text' label='username' value={link.local.user}
                      onChange={e => this.loginChange(e, 'user','local')} required fullWidth id='confUser' /><br />
                    <FormControl fullWidth>
                      <InputLabel htmlFor="standard-adornment-password">password</InputLabel>
                      <Input fullWidth
                        id="standard-adornment-password" required
                        type={showPassword ? 'text' : 'password'}
                        value={link.local.password}
                        onChange={e => this.loginChange(e, 'password','local')}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton aria-label="toggle password visibility" onClick={this.togglePWD}>
                              {showPassword ? <Visibility /> : <VisibilityOff />}
                            </IconButton>
                          </InputAdornment>}
                      />
                    </FormControl>
                    <TextField type='text' label='database' value={link.local.database}
                      onChange={e => this.loginChange(e, 'database','local')} required fullWidth id='confDatabase' />
                    <br />
                    <TextField type='text' label='path' value={link.local.path}
                        onChange={e => this.loginChange(e, 'path','local')} required fullWidth />
                  </form>
                </div>
              </div>
              {/*=======CONTENT RIGHT=======*/}
              <div className='col-sm-8'>
                <div className='p-2'>
                 <strong>Remote server</strong>
                </div>
                <div className='row p-0'>
                  <div className='col-sm-6'>
                    <div className="form-popup m-2" >
                      <form className="form-container">
                        <TextField type='text' label='username' value={link.remote.user}
                          onChange={e => this.loginChange(e, 'user','remote')} required fullWidth id='confUser' /><br />
                        <FormControl fullWidth>
                          <InputLabel htmlFor="standard-adornment-password">password</InputLabel>
                          <Input fullWidth
                            id="standard-adornment-password" required
                            type={showPassword ? 'text' : 'password'}
                            value={link.remote.password}
                            onChange={e => this.loginChange(e, 'password','remote')}
                            endAdornment={
                              <InputAdornment position="end">
                                <IconButton aria-label="toggle password visibility" onClick={this.togglePWD}>
                                  {showPassword ? <Visibility /> : <VisibilityOff />}
                                </IconButton>
                              </InputAdornment>}
                          />
                        </FormControl>
                        <TextField type='text' label='database' value={link.remote.database}
                          onChange={e => this.loginChange(e, 'database','remote')} required fullWidth id='confDatabase' />
                        <br />
                        <TextField type='text' label='server' value={link.remote.url}
                          onChange={e => this.loginChange(e, 'url','remote')} required fullWidth id='confUrl' />
                      </form>
                      </div>
                    </div>
                    <div className='col-sm-6 py-0 px-3'>
                      {this.state.qrString!='' && <QRCode value={this.state.qrString} size={280} />}
                    </div>
                  </div>
              </div>
            </div>

            {this.state.local.testServer=='ERROR' &&
              <Alert severity="error">Local couch-DB installation incorrect. Please check it!</Alert>}
            {this.state.remote.testServer=='ERROR' &&
              <Alert severity="error">Remote server IP incorrect or non-reachable. Please check it!</Alert>}
            {this.state.local.testServer=='OK' && this.state.local.testLogin=='ERROR' &&
              <Alert severity="error" >Local couch-DB user name and password incorrect.
              </Alert>}
            {this.state.local.testServer=='OK' && this.state.local.testLogin=='OK' &&
              this.state.local.testDB=='ERROR' &&
              <Alert severity="error" >Local couch-DB database does not exist.
                <Button onClick={()=>this.createDB()} fullWidth variant="contained" id='createBtn' style={btn}>
                Create now!
                </Button>
              </Alert>}
            {this.state.remote.testServer=='OK' && this.state.remote.testLogin=='ERROR' &&
              <Alert severity="error" >
                Remote server: Remote couch-DB user name, password or database on server incorrect.
              </Alert>}
            {this.state.local.testPath=='ERROR' &&
              <Alert severity="error" >Path does not exist. Please create it manually!</Alert>}
            {enabled &&
              <Alert><strong>Test was successful!</strong></Alert>}

            <div className='col-sm-12 p-3'>
              <Grid container spacing={4}>
                <Grid item xs>
                  <Button onClick={() => {this.upload.click();}} fullWidth label="Open File" primary="false"
                    variant="contained" id='loadBtn' style={btn}>
                    Load from file
                  </Button>
                  <input id="myInput" type="file" ref={(ref) => this.upload = ref} style={{display: 'none'}}
                    onChange={this.onChangeFile.bind(this)}/>
                </Grid>
                <Grid item xs>
                  <Button onClick={() => this.pressedTestBtn()} fullWidth
                    variant="contained" id='confQRBtn' style={btnStrong}>
                    Test {!this.state.link.path && '& generate QR'}
                  </Button>
                </Grid>
                <Grid item xs>
                  <Button onClick={() => this.pressedDeleteBtn()} fullWidth variant="contained"
                    disabled={!enabled} id='confDeleteBtn'
                    style={!enabled ? {...btn, backgroundColor:colorBG} : btn}>
                    Delete
                  </Button>
                </Grid>
                <Grid item xs>
                  <Button onClick={() => this.pressedSaveBtn()} fullWidth variant="contained"
                    style={!enabled ? {...btnStrong, backgroundColor:colorBG} : btnStrong}
                    disabled={!enabled} id='confSaveBtn'>
                    Save
                  </Button>
                </Grid>
                <Grid item xs>
                  <Button onClick={() => this.props.callback()} fullWidth
                    variant="contained" id='closeBtn' style={btn}>
                    Cancel
                  </Button>
                </Grid>
              </Grid>
            </div>
          </div>
        </div>

      </div>
    );
  }
}
