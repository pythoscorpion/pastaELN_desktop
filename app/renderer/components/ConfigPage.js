/* Configuration of the software
  Elements:
  - Database configuration and ontology
  - Tasks:
    Test-Backend: testBackend
    Verify Database integrity: verifyDB
    ...
  - About information
*/
import React, { Component } from 'react';                         // eslint-disable-line no-unused-vars
import { Button, TextField, InputAdornment, IconButton, Input, FormControl, InputLabel } from '@material-ui/core';
import { Visibility, VisibilityOff} from '@material-ui/icons';
import {REACT_VERSION, executeCmd} from '../localInteraction';
import * as Actions from '../Actions';
import ModalOntology from './ModalOntology';

export default class ConfigPage extends Component {
  constructor() {
    super();
    this.state = {
      //Login area details
      credentials:{
        user: '',
        password: '',
        url: '127.0.0.1',
        database: ''
      },
      showPassword: false,
      //other details
      ready: true,  //ready is for all task buttons
      btn_cfg_be_test:'#e0e0e0',
      btn_cfg_be_verifyDB:'#e0e0e0',
      displayOntology: 'none',
      testResult: ''
    };
  }

  /* Functions are class properties: immediately bound: upon changes functions */
  loginChange=(event,task)=>{
    this.setState({
      credentials: Object.assign(this.state.credentials,{[task]:event.target.value})
    });
  }

  // for all buttons
  pressedButton=(task)=>{  //sibling for pressedButton in Project.js: change both similarly
    Actions.comState('busy');
    this.setState({ready: false});
    if (task.indexOf('_be_')>-1) {
      executeCmd(task,this.callback);
    }
    if (task=='btn_cfg_fe_credentials') {
      localStorage.setItem(task,JSON.stringify(this.state.credentials));
      Actions.comState('ok');
    }
  }
  // callback for all executeCmd functions
  callback=(content)=>{
    this.setState({ready: true});
    var contentArray = content.trim().split('\n');
    content = contentArray.slice(0,contentArray.length-1).join('\n').trim();
    const lastLine = contentArray[contentArray.length-1].split(' ');
    if( lastLine[0]==='SUCCESS' ){
      Actions.comState('ok');
      this.setState({[lastLine[1]]: 'green'});
      content += '\nSUCCESS';
    } else {
      Actions.comState('fail');
      this.setState({[lastLine[1]]: 'red'});
      content += '\nFAILURE';
    }
    this.setState({testResult: (this.state.testResult+'\n\n'+content).trim() });
  }

  //changes in visibility
  toggleOntology=()=>{
    if(this.state.displayOntology==='none') {
      this.setState({displayOntology: 'block'});
    } else {
      this.setState({displayOntology: 'none'});
    }
  }
  togglePWD=()=>{
    this.setState({showPassword: !this.state.showPassword});
  }

  /* process data and create html-structure; all should return at least <div></div> */
  showConfiguration() {
    const {credentials, showPassword} = this.state;
    return(
      <div>
        <h1>Configuration</h1>
        <div className='row mt-3'>
          <div className='col-sm-6'>
            Define to which server and which database on that server you want to connect. For local server, leave 127.0.0.1.
          </div>
          <div className='col-sm-6 px-0'>
            <div className="form-popup my-2" >
              <form className="form-container">
                <div className='row ml-0'>
                  <div className='col-sm-8'>
                    <TextField type='text'       label='username' value={credentials.user}
                      onChange={e=>this.loginChange(e,'user')}     required fullWidth/><br/>
                    <FormControl fullWidth>
                      <InputLabel htmlFor="standard-adornment-password">password</InputLabel>
                      <Input fullWidth
                        id="standard-adornment-password"
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
                      onChange={e=>this.loginChange(e,'database')} required fullWidth /><br/>
                    <TextField type='text'       label='server' value={credentials.url}
                      onChange={e=>this.loginChange(e,'url')}      fullWidth />
                  </div>
                  <div className='col-sm-4 row'>
                    <Button type='submit' className='btn-block' variant="contained"
                      onClick={() => this.pressedButton('btn_cfg_fe_credentials')} id='submitBtn'>
                        Login
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className='row mt-3'>
          <div className='col-sm-6'>
            Define what data types (projects, samples, ...) with which meta data (name, comments, ...) you want to store.
          </div>
          <div className='col-sm-6'>
            <Button className='btn-block' variant="contained"
              onClick={this.toggleOntology}
              disabled={!this.state.ready}>
                Edit Ontology
            </Button>
            <ModalOntology display={this.state.displayOntology} callback={this.toggleOntology} />
          </div>
        </div>
      </div>
    );
  }

  showTasks(){
    return(
      <div>
        <h1>Tasks</h1>
        <div className='row'>
          <div className='col-sm-6'>
            Troubleshooting:<br />
            Test whether python backend is operational and the views (source of tables for projects,...) exist.<br />
            Test database logic: e.g. revisions make sense, QR codes exist for samples,...
          </div>
          <div className='col-sm-6'>
            <Button style={{backgroundColor:this.state.btn_cfg_be_test}}
              onClick={() => this.pressedButton('btn_cfg_be_test')}
              className='btn-block' variant="contained"
              disabled={!this.state.ready}>
              Test backend / Create views
            </Button>
            <Button style={{backgroundColor:this.state.btn_cfg_be_verifyDB}}
              onClick={() => this.pressedButton('btn_cfg_be_verifyDB')}
              className='mt-2 btn-block' variant="contained"
              disabled={!this.state.ready}>
              Verify database integrity
            </Button>
          </div>
        </div>
        <div className='row mt-3'>
          <div className='col-sm-6'>
            Backup files are zip-files which include all the meta data. Unzip and open the resulting json-files with web-browser.
          </div>
          <div className='col-sm-6'>
            <Button onClick={() => this.pressedButton('btn_cfg_be_saveBackup')}
              className='btn-block' variant="contained"
              disabled={!this.state.ready}>
              Save backup
            </Button>
            <Button onClick={() => this.pressedButton('btn_cfg_be_loadBackup')}
              className='mt-2 btn-block' variant="contained"
              disabled={!this.state.ready}>
              Load backup
            </Button>
          </div>
        </div>
        <div className='row mt-3'>
          <div className='col-sm-6'>
            Download update to backend and frontend from jugit.fz-juelich.de server. After update, restart software with Ctrl-R.
          </div>
          <div className='col-sm-6'>
            <Button
              onClick={() => this.pressedButton('btn_cfg_be_updateJamDB')}
              className='btn-block' variant="contained"
              disabled={!this.state.ready}>
              Update software
            </Button>
          </div>
        </div>
        <div className='row mt-3'>
          <div className='col-sm-6'>
            Log of backend activity.<br />
            <Button onClick={() => {this.setState({testResult:''});}} className='mt-2' variant="contained">
              Clear log
            </Button>
          </div>
          <div className='col-sm-6'>
            <TextField multiline rows={8} fullWidth value={this.state.testResult} variant="outlined" InputProps={{readOnly: true}}/>
          </div>
        </div>
      </div>
    );
  }

  showAbout() {
    return(
      <div>
        <h1>About jamDB</h1>
        <h5>DataBase for Agile Material-science: jamDB</h5>
        <p>Version: January 2021</p>
        <p>
          <strong>About: </strong>According to wikipedia "jam" refers to "a type of fruit preserve" or "improvised music". In both cases, different content
          flows together to generate something novel. One could even say that in "improvised music" the performers are agile and
          adoptive to each other. The user has full flexibility to decide how the data is structured.
        </p>
        <p>
          Other databases require the user to upload the new data; download it for analysis; upload the new data. JamDB uses a local-first approach:
          store all data and meta-data locally (always accessible to user) and synchronize with a server upon user request. This approach is used by
          git for software development.
        </p>
        <p>
          <a target="_blank"  href='https://youtu.be/9nVMqMs1Wvw'>A teaser youtube video...</a> <br />
          <a target="_blank"  href='https://jugit.fz-juelich.de/s.brinckmann/jamdb-python/-/wikis/home'>For more information...</a>
        </p>
      </div>
    );
  }

  //the render method
  render(){
    return (
      <div className='container px-4 pt-2'>
        <div className='border my-4 p-3'>
          {this.showConfiguration()}
        </div>

        { (REACT_VERSION==='Electron') &&    // *** React-Electron version
          <div className='border my-4 p-3'>
            {this.showTasks()}
          </div>
        }

        <div className='border my-4 p-3'>
          {this.showAbout()}
        </div>
      </div>
    );
  }
}
