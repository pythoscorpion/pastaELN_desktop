import React, { Component } from 'react';                         // eslint-disable-line no-unused-vars
import { Button, Input, InputAdornment, IconButton, TextField,    // eslint-disable-line no-unused-vars
  InputLabel, Select, MenuItem, FormControl} from '@material-ui/core';// eslint-disable-line no-unused-vars
import { Visibility, VisibilityOff} from '@material-ui/icons';   // eslint-disable-line no-unused-vars
import QRCode from 'qrcode.react';                               // eslint-disable-line no-unused-vars
import {saveCredentials, getHomeDir, getCredentials, deleteConfig, getUP} from '../localInteraction';
import { modal, modalContent, btn } from '../style';

export default class ModalConfiguration extends Component {
  constructor() {
    super();
    this.state = {
      localRemote: 'remote',
      showPassword: false,
      disableSubmit: true,
      config: '--addNew--',
      qrString: ''
    };
  }
  componentDidMount() {
    this.setState({ credentials: {user:'',password:'',database:'',url:'', path:getHomeDir(), name:''} });
    this.setState({ configuration: getCredentials().configuration });
  }
  togglePWD=()=>{
    this.setState({showPassword: !this.state.showPassword});
  }
  pressedSaveBtn=()=>{
    var credentials = this.state.credentials;
    if (this.state.localRemote==='local')
      delete credentials['url'];
    else
      delete credentials['path'];
    saveCredentials(credentials);
    this.props.callback();
  }
  pressedQRCodeBtn=()=>{
    var qrcode = Object.assign({}, this.state.credentials);
    if (qrcode.cred)
      delete qrcode.cred;
    const name = qrcode.name;
    delete qrcode.name;
    qrcode = JSON.stringify( Object.assign({[name]:qrcode},{} ) );
    this.setState({qrString: qrcode });
  }
  pressedDeleteBtn=()=>{
    deleteConfig(this.state.config);
    var configuration = this.state.configuration;
    delete configuration[this.state.config];
    this.setState({configuration:configuration, config:'--addNew--'});
    this.setState({ credentials: {user:'',password:'',database:'',url:'', path:getHomeDir(), name:''} });
  }

  /* Functions are class properties: immediately bound: upon changes functions */
  changeConfigSelector = (event) =>{
    this.setState({config: event.target.value, disableSubmit:(event.target.value=='--addNew--')});
    var thisConfig = this.state.configuration[event.target.value];
    if (thisConfig) {
      this.setState({localRemote: thisConfig.url ? 'remote' : 'local'});
      const cred = getUP(thisConfig.cred);
      thisConfig = Object.assign(thisConfig, {name:event.target.value, user:cred[0], password:cred[1]});
      this.setState({credentials: thisConfig});
    } else {
      this.setState({ credentials: {user:'',password:'',database:'',url:'', path:getHomeDir(), name:''},});
    }
  }

  changeType = (event) =>{
    this.setState({localRemote: event.target.value});
  }
  loginChange=(event,task)=>{
    this.setState({
      credentials: Object.assign(this.state.credentials,
        {[task]:(task=='database') ? event.target.value.replace(/[\W\d]+/g,'').toLowerCase()
          : event.target.value}),
      disableSubmit: false
    });
    Object.keys(this.state.credentials).map((item)=>{
      if (this.state.credentials[item].length==0) {
        if ((this.state.localRemote=='local'  && item!='url') ||
            (this.state.localRemote=='remote' && item!='path')) {
          this.setState({disableSubmit: true});
        }
      }
    });
  }


  render(){
    if (this.props.display==='none') {
      return(<div></div>);
    }
    const {credentials, showPassword} = this.state;
    var options = this.state.configuration ?
      Object.keys(this.state.configuration).filter(item=>item[0]!='-') :
      [];
    options = options.map((item)=>{
      return (<MenuItem value={item} key={item}>{item}</MenuItem>);
    });
    options = options.concat(<MenuItem key='--addNew--' value='--addNew--'>{'-- Add new --'}</MenuItem>);
    return (
      <div className="modal" style={Object.assign({display: this.props.display},modal)}>
        <div className="modal-content" style={modalContent}>
          <div  className="col border rounded p-1 p-1">
            {/*=======PAGE HEADING=======*/}
            <div className="col">
              <h1 className='col-sm-7 p-3'>Add / Edit / Show configuration</h1>
              <div className="row">
                <FormControl fullWidth className='col-sm-7 m-2'>
                  <Select onChange={e=>this.changeConfigSelector(e)} value={this.state.config}>
                    {options}
                  </Select>
                </FormControl>
                <Button onClick={() => this.pressedSaveBtn()}
                  variant="contained" disabled={this.state.disableSubmit}
                  className='col-sm-1 m-2' id='confSaveBtn' style={btn}>
                    Save
                </Button>
                <Button onClick={() => this.pressedDeleteBtn()}
                  variant="contained" disabled={this.state.disableSubmit}
                  className='col-sm-1 m-2' id='confSaveBtn' style={btn}>
                    Delete
                </Button>
                <Button onClick={() => this.pressedQRCodeBtn()}
                  variant="contained" disabled={this.state.disableSubmit}
                  className='col-sm-1 m-2' id='confSaveBtn' style={btn}>
                    QR code
                </Button>
                <Button onClick={() => this.props.callback()}
                  variant="contained" className='col-sm-1 m-2' id='closeBtn' style={btn}>
                    Cancel
                </Button>
              </div>
            </div>
            <div className='row'>
              <div className='col-sm-7'>
                {/*=======CONTENT LEFT=======*/}
                <div className="form-popup m-2" >
                  <form className="form-container">
                    <TextField type='text'       label='configuration name' value={credentials.name}
                      onChange={e=>this.loginChange(e,'name')} required fullWidth id='confName'/><br/>
                    <TextField type='text'       label='username' value={credentials.user}
                      onChange={e=>this.loginChange(e,'user')} required fullWidth  id='confUser'/><br/>
                    <FormControl fullWidth>
                      <InputLabel htmlFor="standard-adornment-password">password</InputLabel>
                      <Input fullWidth
                        id="standard-adornment-password" required
                        type={showPassword ? 'text' : 'password'}
                        value={credentials.password}
                        onChange={e=>this.loginChange(e,'password')}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton aria-label="toggle password visibility" onClick={this.togglePWD}>
                              {showPassword ? <Visibility /> : <VisibilityOff />}
                            </IconButton>
                          </InputAdornment>}
                      />
                    </FormControl>
                    <TextField type='text'       label='database'  value={credentials.database}
                      onChange={e=>this.loginChange(e,'database')} required fullWidth  id='confDatabase'/>
                    <br/>
                    <FormControl fullWidth className='col-sm-12 mt-2'>
                      <Select onChange={e=>this.changeType(e)} value={this.state.localRemote}>
                        <MenuItem value='local' key='local'>Local configuration</MenuItem>
                        <MenuItem value='remote' key='remote'>Remote configuration</MenuItem>
                      </Select><br />
                    </FormControl>
                    {this.state.localRemote==='remote' &&
                      <TextField type='text'       label='server' value={credentials.url}
                        onChange={e=>this.loginChange(e,'url')} required fullWidth  id='confUrl'/>
                    }
                    {this.state.localRemote==='local' &&
                      <TextField type='text'       label='path' value={credentials.path}
                        onChange={e=>this.loginChange(e,'path')} required fullWidth />
                    }
                  </form>
                </div>
              </div>
              <div className='col-sm-5 p-4 pl-5'>
                <QRCode value={this.state.qrString} size={256}/>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
