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
      testBackendBtn: 'grey',
      displayDBConfig: 'none',
      dataDictionaryObj: {},
      verifyDBBtn: 'grey',
      testResult: ''
    };
    this.loginChange = this.loginChange.bind(this);
    this.pressedAnyButton= this.pressedAnyButton.bind(this);
    this.callback     = this.callback.bind(this);
    this.togglePWD = this.togglePWD.bind(this);
    this.dbConfigChange = this.dbConfigChange.bind(this);
    this.toggleDBConfig = this.toggleDBConfig.bind(this);
  }

  // upon changes functions
  loginChange(event,task) {
    this.setState({
      credentials: Object.assign(this.state.credentials,{[task]:event.target.value})
    });
  }

  dbConfigChange(e){
    if (e && 'error' in e && e.error===false) {
      this.setState({dataDictionaryObj:e.jsObject});
    }
  }

  // for all buttons
  pressedAnyButton(event,task) {  //sibling for pressedButton in Project.js: change both similarly
    Actions.comState('busy');
    this.setState({ready: false});
    if (task=='testConnection' || task=='verifyDB' || task=='backupSave' || task=='backupLoad') {
      executeCmd(task,'',this.callback);
    }
    if (task=='loadJSON') {
      this.setState({dataDictionaryObj: Store.getDataDictionary()});
      Actions.comState('ok');
    }
    if (task=='saveJSON') {
      Store.updateDocument(this.state.dataDictionaryObj,false);
    }
    if (task=='credentials') {
      localStorage.setItem(task,JSON.stringify(this.state.credentials));
      Actions.comState('ok');
    }
  }
  // callback for all executeCmd functions
  callback(content) {
    this.setState({ready: true});
    var contentArray = content.trim().split('\n');
    if( contentArray[contentArray.length-1].indexOf('SUCCESS testConnection')>-1 ){
      this.setState({testBackendBtn: 'green'});
      Actions.comState('ok');
    } else if(contentArray[contentArray.length-1].indexOf('testConnection')>-1) {
      this.setState({testBackendBtn: 'red'});
      Actions.comState('fail');
    }
    if( contentArray[contentArray.length-1].indexOf('SUCCESS verifyDB')>-1 ){
      this.setState({verifyDBBtn: 'green'});
      Actions.comState('ok');
    }
    if( content.indexOf('**ERROR')>-1){
      this.setState({verifyDBBtn: 'red'});
      Actions.comState('fail');
    }
    this.setState({testResult: (this.state.testResult+'\n\n'+content).trim() });
  }


  //changes in visibility
  toggleDBConfig(){
    if(this.state.displayDBConfig==='none') {
      this.setState({displayDBConfig: 'block'});
    } else {
      this.setState({displayDBConfig: 'none'});
    }
  }

  togglePWD(){
    if(this.state.pwdBoxType==='password'){
      this.setState({pwdBoxType: 'text', eyeType: faEyeSlash});
    } else {
      this.setState({pwdBoxType: 'password', eyeType: faEye});
    }
  }

  //the render method
  //TODO DESIGN improve design with frames, ..
  render(){
    return (
      <div className='container px-4 pt-2'>
        <h1 className='ml-2 mt-4'>{REACT_VERSION==='Electron' ? 'Remote server details' : 'Login'} </h1>
        {this.showLogin()}
        <h1 className='ml-2 mt-4'>Tasks</h1>
        <div style={{width:350}}>
          {this.showTestBackend()}
          {this.showDBVerify()}
          {this.showDBConfig()}
          {this.showBackup()}
        </div>
        <h1 className='ml-2 mt-4'>Log</h1>
        <div style={{width:350}}>
          {this.showLog()}
        </div>
        <h1 className='ml-2 mt-4'>About jamDB</h1>
        <div>
          {this.showAbout()}
          </div>
      </div>
    );
  }

  /**************************************
  * process data and create html-structure
  * all should return at least <div></div>
  **************************************/
  showLogin() {
    const {credentials, credVisibility, eyeType, pwdBoxType} = this.state;
    return(
      <div className="form-popup m-2" >
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
              <button type='submit' className='btn btn-secondary ml-2' onClick={e => this.pressedAnyButton(e,'credentials')} id='submitBtn'>Login</button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  showDBConfig() {
    return(
      <div>
        <button className='btn btn-secondary ml-2 btn-block'
          onClick={this.toggleDBConfig}
          style={{backgroundColor:'grey'}}
          disabled={!this.state.ready}>
            Edit Database configuration
        </button>
        <div className="modal" style={{display: this.state.displayDBConfig}}>
          <div className="modal-content">
            <div>
              Remark: This will become easier and prettier.
              <JSONInput
                id          = 'jsonEditor'
                placeholder = { this.state.dataDictionaryObj }
                onChange    = {e=> this.dbConfigChange(e)}
                theme       = "light_mitsuketa_tribute"
                width       = "800"
                locale      = { locale }
                style       = {{body:{fontSize:16}}}
                colors      = {{keys:'#1E1E1E', colon:'#1E1E1E', default:'#386FA4'}}
              />
              <button onClick={e => this.pressedAnyButton(e,'loadJSON')} className='btn btn-secondary m-2' active={this.state.ready.toString()}>Load</button>
              <button onClick={e => this.pressedAnyButton(e,'saveJSON')} className='btn btn-secondary m-2' active={this.state.ready.toString()}>Save</button>
              <button onClick={() => this.toggleDBConfig()} className='close btn btn-secondary m-2' id='closeBtn'>Close</button>
            </div>
          </div>
        </div>
      </div>);
  }


  showTestBackend(){
    if (REACT_VERSION==='Electron'){   // *** React-Electron version
      return(
        <button style={{backgroundColor:this.state.testBackendBtn}}
          onClick={e => this.pressedAnyButton(e,'testConnection')}
          className='btn btn-secondary ml-2 mb-2 btn-block'
          disabled={!this.state.ready}>
          Test backend / Create views
        </button>
      );
    } else {
      return (<div></div>);
    }
  }


  showBackup(){
    if (REACT_VERSION==='Electron'){   // *** React-Electron version
      return(
        <div className='container-fluid px-0 pt-1 m-2'>
        <div className='row p-0'>
          <div className='col-sm-6'>
          <button onClick={e => this.pressedAnyButton(e,'backupSave')}
            className='btn btn-secondary btn-block'
            disabled={!this.state.ready}>
            Save backup
          </button>
          </div>
          <div className='col-sm-6'>
          <button onClick={e => this.pressedAnyButton(e,'backupLoad')}
            className='btn btn-secondary btn-block'
            disabled={!this.state.ready}>
            Load backup
          </button>
          </div>
          </div>
        </div>
      );
    } else {
      return (<div></div>);
    }
  }

  showDBVerify(){
    if (REACT_VERSION==='Electron'){   // *** React-Electron version
      return(
        <button style={{backgroundColor:this.state.verifyDBBtn}}
          onClick={e => this.pressedAnyButton(e,'verifyDB')}
          className='btn btn-secondary m-2 btn-block'
          disabled={!this.state.ready}>
          Verify database integrity
        </button>
      );
    } else {
      return (<div></div>);
    }
  }


  showLog(){
    return(
      <div>
        <button onClick={() => {this.setState({testResult:''});}} className='btn btn-secondary m-2 btn-block'>
          Clean log
        </button>
        <textarea rows="8" cols="50" value={this.state.testResult} readOnly className='m-2'></textarea>
      </div>
    );
  }


  showAbout() {
    return(
      <div className='p-2'>
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
          <a target="_blank"  href='https://jugit.fz-juelich.de/s.brinckmann/jamdb-python/-/wikis/home'>For more information...</a>
        </p>
      </div>
    );
  }
}
