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
      testResult: 'The interaction has not been tested.',
      displayModal: 'none',
      testBtnBackground: 'red'
    };
    this.submit = this.submit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.pressedButton= this.pressedButton.bind(this);
    this.callback     = this.callback.bind(this);
    this.togglePWD = this.togglePWD.bind(this);
    this.contentChange = this.contentChange.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.testBtnScript = this.testBtnScript.bind(this);
  }

  handleInputChange(event,task) {
    if(task==='user'){
      this.setState({
        credentials: {
          user: event.target.value,
          password: this.state.credentials.password,
          url: this.state.credentials.url,
          database: this.state.credentials.database
        }
      });
    } else if(task==='password'){
      this.setState({
        credentials: {
          user: this.state.credentials.user,
          password: event.target.value,
          url: this.state.credentials.url,
          database: this.state.credentials.database
        }
      });
    } else if(task==='url'){
      this.setState({
        credentials: {
          user: this.state.credentials.user,
          password: this.state.credentials.password,
          url: event.target.value,
          database: this.state.credentials.database
        }
      });
    } else if(task==='database'){
      this.setState({
        credentials: {
          user: this.state.credentials.user,
          password: this.state.credentials.password,
          url: this.state.credentials.url,
          database: event.target.value
        }
      });
    }
  }

  pressedButton(event,task) {  //sibling for pressedButton in Project.js: change both similarly
    if (task=='testConnection') {
      this.setState({ready: false});
      this.setState({testBtnBackground: 'grey'})
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
    var endOfString = content.substring(content.length-8);
    if(endOfString==='SUCCESS\n'){
      this.setState({testBtnBackground: 'green'});
    } else {
      this.setState({testBtnBackground: 'red'});
    }
    this.setState({testResult: content});
  }
  contentChange(e){
    if (e && 'error' in e && e.error===false) {
      this.setState({dataDictionaryObj:e.jsObject});
    }
  }

  toggleModal(){
    if(this.state.displayModal==='none') {
      this.setState({
        displayModal: 'block'
      })
    } else {
      this.setState({
        displayModal: 'none'
      })
    }
  }

  togglePWD(){
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

  testBtnScript(){
    if(!this.state.ready){
      this.setState({
        testBtnBackground:'grey'
      })
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
          <div  className='col-sm-5 border mx-4'>  {/* nested div required to enforce  col-sm-8 */}
            {this.about()}
          </div>
          <div className='col-sm-6 border mr-4'>
            {this.login()}
            {this.popOutDBConf()}
            <div>
              <h1 className='mt-4'>Database integrity</h1>
              <button className='btn btn-secondary' >
                Check integrity</button>
            </div>
            {this.testBackend()}
          </div>
        </div>
      </div>
    );  //TODO check integrity button
  }

  /**************************************
  * process data and create html-structure
  * all should return at least <div></div>
  **************************************/
  login() {
    var title = <h1>Login</h1>;
    if (REACT_VERSION==="Electron")
      title = <h1>Remote server details</h1>;
    return(
      <div className="form-popup m-2" >
        <form className="form-container">
          {title}
          <input type='text' placeholder='Username' style={{visibility: this.state.credVisibility}} value={this.state.credentials.user} onChange={e => this.handleInputChange(e,'user')} required size="50" /><br/>
          <input type={this.state.pwdBoxType} placeholder='Password' style={{visibility: this.state.credVisibility}}  value={this.state.credentials.password} onChange={e => this.handleInputChange(e,'password')} id='pwdBox' required  size="50" />
          <button type='button' id='toggleButton' style={{visibility: this.state.credVisibility}} onClick={this.togglePWD} tabIndex='-1'>
            <FontAwesomeIcon icon={this.state.eyeType}/>
          </button><br/>
          <input type='text' placeholder='database' value={this.state.credentials.database} onChange={e => this.handleInputChange(e,'database')} required size="50" /><br/>
          <input type='text' placeholder='127.0.0.1' value={this.state.credentials.url} onChange={e => this.handleInputChange(e,'url')} size="50" /><br/>
          <button type='submit' className='btn btn-secondary m-2' onClick={this.submit} id='submitBtn'>Login</button>
        </form>
      </div>
    );
  }

  popOutDBConf() {
    return(
      <div>
        <h1>Database configuration</h1>
        <button className='btn btn-secondary' onClick={this.toggleModal}>Edit configuration</button>
        <div className="modal" style={{display: this.state.displayModal}}>
          <div className="modal-content">
            <span className="close" id='closeBtn' onClick={this.toggleModal}>&times;</span>
            {this.dbCofiguration()}
          </div>
        </div>
      </div>)
  }

  testBackend(){
    //TODODieser Button könnte seine Farbe anpassen (gruen/rot), wenn Test erfolgreich oder nicht war
    // Wenn der Text auf "SUCCESS" ended, dann erfolgreich, sonst nicht
    if (REACT_VERSION==='Electron'){   // *** React-Electron version
      return(
        <div className='mt-4'>
          <h1>Backend interaction</h1>
          <textarea rows="8" cols="50" value={this.state.testResult} readOnly className='align-top mb-2'></textarea>
          <button style={{backgroundColor:this.state.testBtnBackground}}
                  onClick={e => this.pressedButton(e,'testConnection')}
                  className='btn btn-secondary m-2 align-top'
                  active={this.state.ready.toString()}>
            Test
          </button>
        </div>
      );
    } else {
      return (<div></div>);
    }
  }


  dbCofiguration(){
    return (
      <div>
        <JSONInput
          id          = 'jsonEditor'
          placeholder = { this.state.dataDictionaryObj }
          onChange    = {e=> this.contentChange(e)}
          theme       = "light_mitsuketa_tribute"
          width       = "800"
          locale      = { locale }
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
