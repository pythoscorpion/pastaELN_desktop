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
      localRemote: 'local',
      showPassword: false,
      config: '--addNew--',
      qrString: '',
      testServer: '',
      testLogin: '',
      testDB: '',
      testPath: ''
    };
  }
  componentDidMount() {
    this.setState({credentials:{user:'',password:'',database:'',url:'',path:getHomeDir(),name:''}});
    this.setState({configuration: getCredentials().configuration });
  }


  /** Functions as class properties (immediately bound): react on user interactions **/
  togglePWD = () => {
    this.setState({ showPassword: !this.state.showPassword });
  }

  pressedSaveBtn = () => {
    var credentials = this.state.credentials;
    if (this.state.localRemote === 'local')
      delete credentials['url'];
    else
      delete credentials['path'];
    if (credentials.cred && credentials.user) {
      delete credentials['user'];
      delete credentials['password'];
    }
    saveCredentials(credentials);
    this.props.callback();
  }

  pressedTestBtn = () => {
    var qrcode = {...this.state.credentials};
    if (qrcode.cred)
      delete qrcode.cred;
    if (qrcode.path){
      //local tests -- no creation on QR code
      axios.get('http://127.0.0.1:5984').then((res) => {
        if (res.data.couchdb == 'Welcome') {
          this.setState({testServer:'OK'});
        }
      }).catch(()=>{
        this.setState({testServer:'ERROR', testLogin:'ERROR',testDB:'ERROR'});
      });
      axios.get('http://127.0.0.1:5984/_all_dbs',
        { auth: { username: qrcode.user, password: qrcode.password } }).then(() => {
        this.setState({testLogin:'OK'});
      }).catch(()=>{
        this.setState({testLogin:'ERROR',testDB:'ERROR'});
      });
      axios.get('http://127.0.0.1:5984/' + qrcode.database + '/',
        { auth: { username: qrcode.user, password: qrcode.password } }).then((res) => {
        if (res.data.db_name == qrcode.database) {
          this.setState({testDB:'OK'});
        } else {
          this.setState({testDB:'ERROR'});
        }
      }).catch(()=>{
        this.setState({testDB:'ERROR'});
      });
      if (testDirectory(qrcode.path)) {
        this.setState({testPath:'OK'});
      } else {
        this.setState({testPath:'ERROR'});
      }
    } else {
      //remote tests and create QR code
      qrcode.server = qrcode.url.indexOf('http') > -1 ? qrcode.url.split(':')[1].slice(2) : qrcode.url;
      var url = qrcode.server.length==0 ? '' : 'http://'+qrcode.server+':5984';
      delete qrcode.url;
      const name = qrcode.name;
      delete qrcode.name;
      axios.get(url).then((res) => {
        if (res.data.couchdb == 'Welcome') {
          this.setState({testServer:'REMOTE OK'});
        }
      }).catch(()=>{
        this.setState({testServer:'REMOTE ERROR',testLogin:'REMOTE ERROR'});
      });
      axios.get(url+'/'+qrcode.database+'/',
        { auth: { username: qrcode.user, password: qrcode.password } }).then((res) => {
        if (res.data.db_name == qrcode.database) {
          this.setState({testLogin: 'REMOTE OK', testDB:'REMOTE OK'});
        }
      }).catch(()=>{
        this.setState({testLogin:'REMOTE ERROR', testDB:'REMOTE ERROR'});
      });
      const qrString = JSON.stringify({ [name]: qrcode});
      this.setState({ qrString: qrString, testPath:'OK' });
    }
  }


  pressedDeleteBtn = () => {
    deleteConfig(this.state.config);
    var configuration = this.state.configuration;
    delete configuration[this.state.config];
    this.setState({configuration:configuration,config:'--addNew--'});
    this.setState({credentials:{user:'',password:'',database:'',url:'',path:getHomeDir(),name:''}});
  }


  createDB = () =>{
    /** Create database on local server */
    var conf = this.state.credentials;
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
    var thisConfig = this.state.configuration[event.target.value];
    if (thisConfig) {
      this.setState({ localRemote: thisConfig.path ? 'local' : 'remote' });
      const cred = getUP(thisConfig.cred);
      thisConfig = Object.assign(thisConfig, { name: event.target.value, user: cred[0], password: cred[1] });
      this.setState({ credentials: thisConfig });
    } else {
      this.setState({credentials:{user:'',password:'',database:'',url:'',path:getHomeDir(),name:''},});
    }
  }

  changeType = (event) => {
    this.setState({ localRemote: event.target.value });
    if (event.target.value=='remote'){
      var credentials = this.state.credentials;
      delete credentials['path'];
      this.setState({credentials: credentials});
    }
  }

  loginChange = (event, task) => {
    this.setState({
      credentials: Object.assign(this.state.credentials, {
        [task]: (task == 'database') ? event.target.value.replace(/^[^a-z]|[\W]/g,'').toLowerCase()
          : event.target.value
      }),
      testServer:'', testPath:''
    });
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
    const credentials =  {user: inData['user-name'], password: inData['password'],
      database: inData['database'], url: inData['Server'], name: inData['configuration name']};
    this.setState({localRemote: 'remote', credentials:credentials});
  }

  /** the render method **/
  render() {
    const { credentials, showPassword } = this.state;
    if (this.props.show=='none' || !credentials) {
      return (<div></div>);
    }
    var options = this.state.configuration ?
      Object.keys(this.state.configuration).filter(item => item[0] != '-') :
      [];
    options = options.map((item) => {
      return (<MenuItem value={item} key={item}>{item}</MenuItem>);
    });
    options = options.concat(<MenuItem key='--addNew--' value='--addNew--'>{'-- Add new --'}</MenuItem>);
    const disabled = !this.state.testLogin.includes('OK') || !this.state.testPath.includes('OK') ||
                     !this.state.testDB.includes('OK');
    return (
      <div className="modal" style={{...modal, ...{ display: this.props.show }}}>
        <div className="modal-content" style={modalContent}>
          <div className="col p-0">
            <div className="px-3 py-4" style={{...h1, ...btnStrong}}>
              {/*=======PAGE HEADING=======*/}
              Add / Edit / Show configuration
            </div>
            <div className='row p-3'>
              <div className='col-sm-9'>
                {/*=======CONTENT LEFT=======*/}
                <div className="form-popup m-2" >
                  <form className="form-container">
                    <Select onChange={e => this.changeConfigSelector(e)} value={this.state.config} fullWidth>
                      {options}
                    </Select>
                    <TextField type='text' label='configuration name' value={credentials.name}
                      onChange={e => this.loginChange(e, 'name')} required fullWidth id='confName' /><br />
                    <TextField type='text' label='username' value={credentials.user}
                      onChange={e => this.loginChange(e, 'user')} required fullWidth id='confUser' /><br />
                    <FormControl fullWidth>
                      <InputLabel htmlFor="standard-adornment-password">password</InputLabel>
                      <Input fullWidth
                        id="standard-adornment-password" required
                        type={showPassword ? 'text' : 'password'}
                        value={credentials.password}
                        onChange={e => this.loginChange(e, 'password')}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton aria-label="toggle password visibility" onClick={this.togglePWD}>
                              {showPassword ? <Visibility /> : <VisibilityOff />}
                            </IconButton>
                          </InputAdornment>}
                      />
                    </FormControl>
                    <TextField type='text' label='database' value={credentials.database}
                      onChange={e => this.loginChange(e, 'database')} required fullWidth id='confDatabase' />
                    <br />
                    <FormControl fullWidth className='col-sm-12 mt-2'>
                      <Select onChange={e => this.changeType(e)} value={this.state.localRemote}>
                        <MenuItem value='local' key='local'>Local configuration</MenuItem>
                        <MenuItem value='remote' key='remote'>Remote configuration</MenuItem>
                      </Select><br />
                    </FormControl>
                    {this.state.localRemote === 'remote' &&
                      <TextField type='text' label='server' value={credentials.url}
                        onChange={e => this.loginChange(e, 'url')} required fullWidth id='confUrl' />
                    }
                    {this.state.localRemote === 'local' &&
                      <TextField type='text' label='path' value={credentials.path}
                        onChange={e => this.loginChange(e, 'path')} required fullWidth />
                    }
                  </form>
                </div>
              </div>
              <div className='col-sm-3 p-4 pl-5'>
                {this.state.qrString!='' && <QRCode value={this.state.qrString} size={320} />}
              </div>
            </div>

            {this.state.testServer=='ERROR' &&
              <Alert severity="error">Couch-DB installation incorrect. Please check it!</Alert>}
            {this.state.testServer=='REMOTE ERROR' &&
              <Alert severity="error">Server IP incorrect or non-reachable. Please check it!
                {this.state.testServer}, {this.state.testLogin} </Alert>}
            {this.state.testServer=='OK' && this.state.testLogin=='ERROR' &&
              <Alert severity="error" >Couch-DB user name and password incorrect. Please check them!
              </Alert>}
            {this.state.testServer=='OK' && this.state.testLogin=='OK' && this.state.testDB=='ERROR' &&
              <Alert severity="error" >Couch-DB database does not exist.
                <Button onClick={()=>this.createDB()} fullWidth variant="contained" id='createBtn' style={btn}>
                Create now!
                </Button>
              </Alert>}
            {this.state.testServer=='REMOTE OK' && this.state.testLogin=='REMOTE ERROR' &&
              <Alert severity="error" >
                Couch-DB user name, password or database on server incorrect. Please check them!
              </Alert>}
            {this.state.testPath=='ERROR' &&
              <Alert severity="error" >Path does not exist. Please create it manually!</Alert>}
            {!disabled &&
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
                    Test {!this.state.credentials.path && '& generate QR'}
                  </Button>
                </Grid>
                <Grid item xs>
                  <Button onClick={() => this.pressedDeleteBtn()} fullWidth variant="contained"
                    disabled={disabled} id='confDeleteBtn'
                    style={disabled ? {...btn, backgroundColor:colorBG} : btn}>
                    Delete
                  </Button>
                </Grid>
                <Grid item xs>
                  <Button onClick={() => this.pressedSaveBtn()} fullWidth variant="contained"
                    style={disabled ? {...btnStrong, backgroundColor:colorBG} : btnStrong}
                    disabled={disabled} id='confSaveBtn'>
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
