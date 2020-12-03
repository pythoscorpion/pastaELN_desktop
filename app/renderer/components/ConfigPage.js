/* Information on the software
*/
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import React, { Component } from 'react';                         // eslint-disable-line no-unused-vars
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // eslint-disable-line no-unused-vars
import JSONInput from 'react-json-editor-ajrm';
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
      testResult: 'This will be the output of the test. Until then check console.'
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
      this.setState({dataDictionaryObj: Store.getDataDictionary()})
    }
    if (task=='saveJSON') {
      Store.updateDocument(this.state.dataDictionaryObj,false);
    }
  }
  callback() {
    this.setState({ready: true});
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

  render(){
    return (
      <div className='container-fluid px-0 pt-1'>
        <div className='row px-0'>
          <div  className='col-sm-5 border mx-5'>  {/* nested div required to enforce  col-sm-8 */}
            {this.about()}
          </div>
          <div className='col-sm-5 border mx-5'>
            {this.config()}
            {this.testBackend()}
            {this.dbCofiguration()}
          </div>
        </div>
      </div>
    );
  }

  config() {
    return(
      <div className="form-popup" >
        <form className="form-container">
          <h1>Login</h1>
          <input type='text' placeholder='Username' style={{visibility: this.state.credVisibility}} value={this.state.credentials.user} onChange={this.handleInputChangeUSR} required/><br/>
          <input type={this.state.pwdBoxType} placeholder='Password' style={{visibility: this.state.credVisibility}}  value={this.state.credentials.password} onChange={this.handleInputChangePW} id='pwdBox' required/>
          <button type='button' id='toggleButton' style={{visibility: this.state.credVisibility}} onClick={this.toggle} tabIndex='-1'>
            <FontAwesomeIcon icon={this.state.eyeType}/>
          </button><br/>
          <input type='text' placeholder='database' value={this.state.credentials.database} onChange={this.handleInputChangeDB} required/><br/>
          <input type='text' placeholder='127.0.0.1' value={this.state.credentials.url} onChange={this.handleInputChangeURL}/><br/>
          <button type="submit" className="btn" onClick={this.submit} id='submitBtn'>Login</button>
        </form>
      </div>
    );
  }
  testBackend(){
    //TODO waere schoen wenn der Test button aus Projecs->click nach hier verschoben wird. Dieser Button könnte seine Farbe anpassen (gruen/rot), wenn Test erfolgreich oder nicht war
    // Ein textfeld daneben könnte die Message zeigen
    // Wenn der Text auf "SUCCESS" ended, dann erfolgreich, sonst nicht
    if (REACT_VERSION==='Electron'){   // *** React-Electron version
      return(
        <div>
          <h1>Backend interaction</h1>
          <button onClick={e => this.pressedButton(e,'testConnection')} className='btn btn-secondary ml-3' active={this.state.ready.toString()}>Test</button>
          <textarea rows="7" value={this.state.testResult} readOnly></textarea>
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
          height      = '500px'
          width       = '800px'
          style       = {{body:{fontSize:20}}}
          colors      = {{keys:"#1E1E1E", colon:"#1E1E1E", default:"#386FA4"}}
          />
          <button onClick={e => this.pressedButton(e,'loadJSON')} className='btn btn-secondary ml-3' active={this.state.ready.toString()}>Load</button>
          <button onClick={e => this.pressedButton(e,'saveJSON')} className='btn btn-secondary ml-3' active={this.state.ready.toString()}>Save</button>
      </div>
    );
  }
//   <Editor
//   value={yourJson}
//   onChange={this.handleChange}
// />

  about() {
    return(
      <div>
        <h3>About jamDB</h3>
        <h5>Towards a database for experimental materials science </h5>
        <p>
        According to wikipedia "jam" refers to "a type of fruit preserve" or "improvise music". In both cases different content flows together to generate something new and improved. In "improvised music" the performers are agile and adoptive.
        </p>

        <h5>Goal of software</h5>
        <ul>
          <li>Data has two origins:
            <ul>
              <li> local directory structure where data can be dumped into (freedom to research) </li>
              <li> links to stored data in data-base </li>
            </ul>
          </li>
          <li>follow scum, agile software structure, which is used in IT-projects</li>
          <li>hierarchical structure for projects (project, sprint, task)</li>
          <li>since local folders and projects are structured
            <ul>
              <li>programs can efficiently process it</li>
              <li>other people/supervisor can collaborate</li>
              <li>do not only exchange pptx presentations but data, meta-data and information</li>
            </ul>
          </li>
        </ul>
      </div>
    );
  }
}
