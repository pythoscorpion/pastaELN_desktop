/* Information on the software
*/
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import React, { Component } from 'react';                         // eslint-disable-line no-unused-vars
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // eslint-disable-line no-unused-vars
import JSONInput from 'react-json-editor-ajrm';                   // eslint-disable-line no-unused-vars
import locale    from 'react-json-editor-ajrm/locale/en';
import {REACT_VERSION, executeCmd} from '../localInteraction';
import Store from '../Store';

export default class ConfigPage extends Component {
  constructor() {
    super();
    this.state = {
      credentials:{
        user: '',
        password: '',
        url: '',
        database: ''
      },
      pwdBoxType: 'password',
      eyeType: faEye,
      ready: true,
      dataDictionaryObj: {},
      testResult: 'The interaction has not been tested.'
    };
    this.submit = this.submit.bind(this);
    this.handleInputChangeUSR = this.handleInputChangeUSR.bind(this);
    this.handleInputChangePW = this.handleInputChangePW.bind(this);
    this.handleInputChangeURL = this.handleInputChangeURL.bind(this);
    this.handleInputChangeDB = this.handleInputChangeDB.bind(this);
    this.pressedButton= this.pressedButton.bind(this);
    this.callback     = this.callback.bind(this);
    this.toggle = this.toggle.bind(this);
    this.contentChange = this.contentChange.bind(this);
  }

  handleInputChangeUSR(event) {
    this.setState({
      credentials: {
        user: event.target.value,
        password: this.state.credentials.password,
        url: this.state.credentials.url,
        database: this.state.credentials.database
      }
    });
  }
  handleInputChangePW(event) {
    this.setState({
      credentials: {
        user: this.state.credentials.user,
        password: event.target.value,
        url: this.state.credentials.url,
        database: this.state.credentials.database
      }
    });
  }
  handleInputChangeURL(event) {
    this.setState({
      credentials: {
        user: this.state.credentials.user,
        password: this.state.credentials.password,
        url: event.target.value,
        database: this.state.credentials.database
      }
    });
  }
  handleInputChangeDB(event) {
    this.setState({
      credentials: {
        user: this.state.credentials.user,
        password: this.state.credentials.password,
        url: this.state.credentials.url,
        database: event.target.value
      }
    });
  }

  pressedButton(event,task) {  //sibling for pressedButton in Project.js: change both similarly
    if (task=='testConnection') {
      this.setState({ready: false});
      executeCmd(task,'',this.callback);
    }
    if (task=='loadJSON') {
      this.setState({dataDictionaryObj: Store.getDataDictionary()});
    }
    if (task=='saveJSON') {
      Store.updateDocument(this.state.dataDictionaryObj,false);
    }
  }
  callback(content) {
    this.setState({ready: true});
    this.setState({testResult: content});
  }
  contentChange(e){
    if (e && 'error' in e && e.error===false) {
      this.setState({dataDictionaryObj:e.jsObject});
    }
  }


  toggle() {
    if(this.state.pwdBoxType==='password'){
      this.setState({
        pwdBoxType: 'text',
        eyeType: faEyeSlash
      });
    } else if(this.state.pwdBoxType==='text'){
      this.setState({
        pwdBoxType: 'password',
        eyeType: faEye
      });
    }
  }

  submit(){
    try {
      //try successful, use string; json-object can be ignored
      localStorage.setItem('credentials',JSON.stringify(this.state.credentials));
    }
    finally{
      console.log('credentials submitted');
    }
  }

  //the render method
  render(){
    return (
      <div className='container-fluid px-0 pt-1'>
        <div className='row px-0'>
          <div  className='col-sm-4 border mx-4'>  {/* nested div required to enforce  col-sm-8 */}
            {this.about()}
            {this.config()}
            {this.testBackend()}
          </div>
          <div className='col-sm-6 border mr-4'>
            {this.dbCofiguration()}
          </div>
        </div>
      </div>
    );
  }

  /**************************************
  * process data and create html-structure
  * all should return at least <div></div>
  **************************************/
  config() {
    return(
      <div className="form-popup" >
        <form className="form-container">
          <h1>Login</h1>
          <input type='text' placeholder='Username' style={{visibility: this.state.credVisibility}} value={this.state.credentials.user} onChange={this.handleInputChangeUSR} required size="50" /><br/>
          <input type={this.state.pwdBoxType} placeholder='Password' style={{visibility: this.state.credVisibility}}  value={this.state.credentials.password} onChange={this.handleInputChangePW} id='pwdBox' required  size="50" />
          <button type='button' id='toggleButton' style={{visibility: this.state.credVisibility}} onClick={this.toggle} tabIndex='-1'>
            <FontAwesomeIcon icon={this.state.eyeType}/>
          </button><br/>
          <input type='text' placeholder='database' value={this.state.credentials.database} onChange={this.handleInputChangeDB} required size="50" /><br/>
          <input type='text' placeholder='127.0.0.1' value={this.state.credentials.url} onChange={this.handleInputChangeURL} size="50" />
          <button type="submit" className="btn btn-secondary ml-2" onClick={this.submit} id='submitBtn'>Login</button>
        </form>
      </div>
    );
  }

  testBackend(){
    //TODODieser Button könnte seine Farbe anpassen (gruen/rot), wenn Test erfolgreich oder nicht war
    // Wenn der Text auf "SUCCESS" ended, dann erfolgreich, sonst nicht
    if (REACT_VERSION==='Electron'){   // *** React-Electron version
      return(
        <div className='mt-4'>
          <h1>Backend interaction</h1>
          <textarea rows="8" cols="50" value={this.state.testResult} readOnly className='align-top'></textarea>
          <button onClick={e => this.pressedButton(e,'testConnection')} className='btn btn-secondary ml-2 align-top' active={this.state.ready.toString()}>Test</button>
        </div>
      );
    } else {
      return (<div></div>);
    }
  }


  dbCofiguration(){
    return (
      <div>
        <h1>Database configuration</h1>
        <JSONInput
          id          = 'jsonEditor'
          placeholder = { this.state.dataDictionaryObj }
          onChange    = {e=> this.contentChange(e)}
          theme       = "light_mitsuketa_tribute"
          locale      = { locale }
          height      = '850px'
          width       = '900px'
          style       = {{body:{fontSize:16}}}
          colors      = {{keys:'#1E1E1E', colon:'#1E1E1E', default:'#386FA4'}}
        />
        <button onClick={e => this.pressedButton(e,'loadJSON')} className='btn btn-secondary m-2' active={this.state.ready.toString()}>Load</button>
        <button onClick={e => this.pressedButton(e,'saveJSON')} className='btn btn-secondary m-2' active={this.state.ready.toString()}>Save</button>
      </div>
    );
  }


  about() {
    return(
      <div>
        <h3>DataBase for Agile Material-science: jamDB</h3>
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
