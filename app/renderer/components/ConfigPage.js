/* Configuration of the software
  Elements:
  - Login area
  - Tasks:
    Test-Backend: testBackend
    Edit Configuration: DBConfig
    Verify Database integrity: verifyDB
  - About information
*/
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import React, { Component } from 'react';                         // eslint-disable-line no-unused-vars
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // eslint-disable-line no-unused-vars
import JSONInput from 'react-json-editor-ajrm';                   // eslint-disable-line no-unused-vars
import locale    from 'react-json-editor-ajrm/locale/en';
import { Button } from '@material-ui/core';                       // eslint-disable-line no-unused-vars
import {REACT_VERSION, executeCmd} from '../localInteraction';
import Store from '../Store';
import * as Actions from '../Actions';

export default class ConfigPage extends Component {
  constructor() {
    super();
    this.state = {
      //Login area details
      credentials:{
        user: '',
        password: '',
        url: '',
        database: ''
      },
      pwdBoxType: 'password',
      eyeType: faEye,
      //other details
      ready: true,  //ready is for all task buttons
      btn_cfg_be_test:'#e0e0e0',
      btn_cfg_be_verifyDB:'#e0e0e0',
      displayDBConfig: 'none',
      ontologyObj: {},
      testResult: ''
    };
  }

  /* Functions are class properties: immediately bound: upon changes functions */
  loginChange=(event,task)=>{
    this.setState({
      credentials: Object.assign(this.state.credentials,{[task]:event.target.value})
    });
  }
  dbConfigChange=(event)=>{
    if (event && 'error' in event && event.error===false) {
      this.setState({ontologyObj:event.jsObject});
    }
  }

  // for all buttons
  pressedButton=(task)=>{  //sibling for pressedButton in Project.js: change both similarly
    Actions.comState('busy');
    this.setState({ready: false});
    if (task.indexOf('_be_')>-1) {
      executeCmd(task,this.callback);
    }
    if (task=='loadJSON') {
      this.setState({ontologyObj: Store.getOntology()});
      Actions.comState('ok');
    }
    if (task=='saveJSON') {
      Store.updateDocument(this.state.ontologyObj,false);
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
  toggleDBConfig=()=>{
    if(this.state.displayDBConfig==='none') {
      this.setState({displayDBConfig: 'block'});
    } else {
      this.setState({displayDBConfig: 'none'});
    }
  }
  togglePWD=()=>{
    if(this.state.pwdBoxType==='password'){
      this.setState({pwdBoxType: 'text', eyeType: faEyeSlash});
    } else {
      this.setState({pwdBoxType: 'password', eyeType: faEye});
    }
  }

  /* process data and create html-structure; all should return at least <div></div> */
  showLogin() {
    const {credentials, credVisibility, eyeType, pwdBoxType} = this.state;
    return(
      <div className="form-popup my-2" >
        <form className="form-container">
          <div className='row ml-1'>
            <div>
              <input type='text'       placeholder='Username' style={{visibility: credVisibility}} value={credentials.user}     onChange={e => this.loginChange(e,'user')} required size="30" /><br/>
              <input type={pwdBoxType} placeholder='Password' style={{visibility: credVisibility}} value={credentials.password} onChange={e => this.loginChange(e,'password')} id='pwdBox' required  size="30" />
              <button type='button'    id='toggleButton'      style={{visibility: credVisibility}} onClick={this.togglePWD}     tabIndex='-1'>
                <FontAwesomeIcon       icon={eyeType}/>
              </button><br/>
              <input type='text'       placeholder='database'  value={credentials.database} onChange={e => this.loginChange(e,'database')} required size="30" /><br/>
              <input type='text'       placeholder='127.0.0.1' value={credentials.url}      onChange={e => this.loginChange(e,'url')}      size="30" />
            </div>
            <div>
              <Button type='submit' className='ml-2' variant="contained" onClick={() => this.pressedButton('btn_cfg_fe_credentials')} id='submitBtn'>Login</Button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  showDBConfig() {
    return(
      <div>
        <Button className='btn-block' variant="contained"
          onClick={this.toggleDBConfig}
          disabled={!this.state.ready}>
            Edit Database configuration
        </Button>
        <div className="modal" style={{display: this.state.displayDBConfig}}>
          <div className="modal-content">
            <div>
              Remark: This will become easier and prettier.
              <JSONInput
                id          = 'jsonEditor'
                placeholder = { this.state.ontologyObj }
                onChange    = {e=> this.dbConfigChange(e)}
                theme       = "light_mitsuketa_tribute"
                width       = "800"
                locale      = { locale }
                style       = {{body:{fontSize:16}}}
                colors      = {{keys:'#1E1E1E', colon:'#1E1E1E', default:'#386FA4'}}
              />
              <button onClick={() => this.pressedButton('loadJSON')} className='btn btn-secondary m-2' active={this.state.ready.toString()}>Load</button>
              <button onClick={() => this.pressedButton('saveJSON')} className='btn btn-secondary m-2' active={this.state.ready.toString()}>Save</button>
              <button onClick={() => this.toggleDBConfig()} className='close btn btn-secondary m-2' id='closeBtn'>Close</button>
            </div>
          </div>
        </div>
      </div>);
  }

  showTasks(){
    return(
      <div>
        <h1>Tasks</h1>
        <div style={{width:350}}>
          <Button style={{backgroundColor:this.state.btn_cfg_be_test}}
            onClick={() => this.pressedButton('btn_cfg_be_test')}
            className='btn-block' variant="contained"
            disabled={!this.state.ready}>
            Test backend / Create views
          </Button>

          <Button style={{backgroundColor:this.state.btn_cfg_be_verifyDB}}
            onClick={() => this.pressedButton('btn_cfg_be_verifyDB')}
            className='my-3 btn-block' variant="contained"
            disabled={!this.state.ready}>
            Verify database integrity
          </Button>

          <div className='row p-0'>
            <div className='col-sm-6'>
              <Button onClick={() => this.pressedButton('btn_cfg_be_saveBackup')}
                className='btn-block' variant="contained"
                disabled={!this.state.ready}>
                Save backup
              </Button>
            </div>
            <div className='col-sm-6'>
              <Button onClick={() => this.pressedButton('btn_cfg_be_loadBackup')}
                className='btn-block' variant="contained"
                disabled={!this.state.ready}>
                Load backup
              </Button>
            </div>
          </div>

          <Button
            onClick={() => this.pressedButton('btn_cfg_be_updateJamDB')}
            className='mt-3 btn-block' variant="contained"
            disabled={!this.state.ready}>
            Update software
          </Button>
        </div>
      </div>
    );
  }

  showAbout() {
    return(
      <div>
        <h1>jamDB: DataBase for Agile Material-science</h1>
        <h5>Version: 18. January 2021: Play with it, install it, add data, test it.</h5>
        I know that the following things need to change, in that order:
        <ul>
          <li>Some buttons do not work. That should not be the case, please tell me. The next step in the development is automatic testing to ensure that buttons work.</li>
          <li>Currently you cannot share data, since a central server is missing. This is the second priority.</li>
          <li>Some parts are ugly and difficult: I will make it more beautiful.</li>
          <li>Currently only nanoindenter and Zeiss-Tifs are automatically added. In the future there will be more: e.g. EBSD. I will ask what data you would like to add.</li>
        </ul>
          I would appreciate if you fill out the <a target="_blank" href="https://docs.google.com/forms/d/e/1FAIpQLSfnJ02KzUSW0NMkhwXqQbqPDX4VS357zoWM-TvSQ_IC5d4YgA/viewform?usp=sf_link">feedback form</a> with (7 questions) so I can improve.
        <br />
          If you have problems, there is a <a target="_blank"  href='https://jugit.fz-juelich.de/s.brinckmann/jamdb-python/-/wikis/notesUser'>FAQ page</a> with some common problems. Please read it first before contacting me.<br />
        <a target="_blank" href='https://youtu.be/9nVMqMs1Wvw'>A teaser youtube video...</a> <br />
        <a target="_blank" href='https://jugit.fz-juelich.de/s.brinckmann/jamdb-python/-/wikis/home'>For more information...</a>
      </div>
    );
  /*  <strong>About: </strong>According to wikipedia "jam" refers to "a type of fruit preserve" or "improvised music". In both cases, different content
    flows together to generate something novel. One could even say that in "improvised music" the performers are agile and
    adoptive to each other. The user has full flexibility to decide how the data is structured.

    Other databases require the user to upload the new data; download it for analysis; upload the new data. JamDB uses a local-first approach:
    store all data and meta-data locally (always accessible to user) and synchronize with a server upon user request. This approach is used by
    git for software development.  */
  }


  //the render method
  render(){
    return (
      <div className='container px-4 pt-2'>
        <div className='border my-4 p-3'>
          {this.showAbout()}
        </div>
        <div className='border my-4 p-3'>
          <h1>{REACT_VERSION==='Electron' ? 'Remote server details' : 'Login'} </h1>
          {this.showLogin()}
        </div>
        {this.showDBConfig()}

        { (REACT_VERSION==='Electron') &&    // *** React-Electron version
          <div className='border my-4 p-3'>
            {this.showTasks()}
          </div>
        }

        <div className='border my-4 p-3'>
          <h1>Log</h1>
          <div style={{width:350}}>
            <Button onClick={() => {this.setState({testResult:''});}} className='my-2 btn-block' variant="contained">
              Clean log
            </Button>
            <textarea rows="8" cols="50" value={this.state.testResult} readOnly className='my-2'></textarea>
          </div>
        </div>
      </div>
    );
  }
}
