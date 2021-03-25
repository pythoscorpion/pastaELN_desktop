import React, { Component } from 'react';                         // eslint-disable-line no-unused-vars
import { Button, Input, InputAdornment, IconButton, TextField, InputLabel, Select, MenuItem, FormControl} from '@material-ui/core';// eslint-disable-line no-unused-vars
import { Visibility, VisibilityOff} from '@material-ui/icons';   // eslint-disable-line no-unused-vars
import {saveCredentials} from '../localInteraction';

export default class ModalConfiguration extends Component {
  constructor() {
    super();
    this.state = {
      credentials: {user:'',
                    password:'',
                    database:'',
                    url:'',
                    path:process.env.HOME+'/',
                    name:''},
      localRemote: 'remote',
      showPassword: false,
      disableSubmit: true
    };
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
    window.location.reload();  //reload since configuration file changed
  }

  /* Functions are class properties: immediately bound: upon changes functions */
  changeType = (event) =>{
    this.setState({localRemote: event.target.value});
  }
  loginChange=(event,task)=>{
    this.setState({
      credentials: Object.assign(this.state.credentials,{[task]:event.target.value}),
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
    return (
      <div className="modal" style={{display: this.props.display}}>
        <div className="modal-content">
          <div  className="col border rounded p-1 p-1">
            {/*=======PAGE HEADING=======*/}
            <div className="col">
              <div className="row">
                <h1 className='col-sm-7 p-3'>Add configuration</h1>
                <Button onClick={() => this.pressedSaveBtn()}
                  variant="contained" size="large" disabled={this.state.disableSubmit}
                  className='col-sm-1 m-3' id='confSaveBtn'>
                    Save
                </Button>
                <Button onClick={() => this.props.callback()}
                  variant="contained" size="large"
                  className='col-sm-1 float-right m-3'
                  id='closeBtn'>
                    Cancel
                </Button>
              </div>
            </div>
            {/*=======CONTENT=======*/}
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
                  onChange={e=>this.loginChange(e,'database')} required fullWidth  id='confDatabase'/><br/>
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
        </div>
      </div>
    );
  }
}
