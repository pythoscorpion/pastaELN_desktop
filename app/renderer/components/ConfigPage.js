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
import { Button, TextField, FormControl, MenuItem, Select} from '@material-ui/core';
import {REACT_VERSION, executeCmd} from '../localInteraction';
import * as Actions from '../Actions';
import ModalOntology from './ModalOntology';
import ModalConfiguration from './ModalConfiguration';
import {getCredentials, editDefault} from '../localInteraction';

export default class ConfigPage extends Component {
  constructor() {
    super();
    this.state = {
      ready: true,  //ready is for all task buttons
      btn_cfg_be_test:'#e0e0e0',
      btn_cfg_be_verifyDB:'#e0e0e0',
      displayOntology: 'none',
      displayConfiguration: 'none',
      testResult: ''
    };
  }
  componentDidMount(){
    this.setState({configuration: getCredentials().configuration });
  }

  /* Functions are class properties: immediately bound: upon changes functions */
  // for all buttons
  changeSelector = (event,item) =>{
    if (event.target.value==='--addNew--'){
      this.setState({displayConfiguration: 'block'});
    } else {
      var config = this.state.configuration;
      item = '-default' + item.charAt(0).toUpperCase() + item.slice(1);
      config[item] = event.target.value;
      editDefault(item,event.target.value);
      this.setState({configuration: config});
    }
  }
  reload = () => {
    console.log("reload clicked");
    window.location.reload();
  }

  pressedButton=(task)=>{  //sibling for pressedButton in Project.js: change both similarly
    Actions.comState('busy');
    this.setState({ready: false});
    executeCmd(task,this.callback);
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

  //changes in visibility of two possible modals
  toggleOntology=()=>{
    if(this.state.displayOntology==='none') {
      this.setState({displayOntology: 'block'});
    } else {
      this.setState({displayOntology: 'none'});
    }
  }
  toggleConfiguration=()=>{
    if(this.state.displayConfiguration==='none') {
      this.setState({displayConfiguration: 'block'});
    } else {
      this.setState({displayConfiguration: 'none'});
    }
  }


  /* process data and create html-structure; all should return at least <div></div> */
  showConfiguration() {  //CONFIGURATION BLOCK
    if (! this.state.configuration) {
      return (<div></div>);
    }
    var configsLocal = Object.keys(this.state.configuration).filter((item)=>{
      return (item[0]!='-' && this.state.configuration[item]['path']);
    });
    var configsRemote = Object.keys(this.state.configuration).filter((item)=>{
      return (item[0]!='-' && !this.state.configuration[item]['path']);
    });
    var optionsLocal = configsLocal.map((item)=>{
      return (<MenuItem value={item} key={item}>{item}</MenuItem>);
    });
    optionsLocal = optionsLocal.concat(<MenuItem key='--addNew--' value='--addNew--'>{'-- Add new --'}</MenuItem>);
    var optionsRemote = configsRemote.map((item)=>{
      return (<MenuItem value={item} key={item}>{item}</MenuItem>);
    });
    optionsRemote = optionsRemote.concat(<MenuItem key='--addNew--' value='--addNew--'>{'-- Add new --'}</MenuItem>);
    return(
      <div>
        <h1>Configuration</h1>
        <div className='row mt-3'>
        <div className='col-sm-2'>
            Local configuration:
          </div>
          <FormControl fullWidth className='col-sm-4'>
            <Select onChange={e=>this.changeSelector(e,'local')} value={this.state.configuration['-defaultLocal']}>
              {optionsLocal}
            </Select>
          </FormControl>
          <div className='col-sm-2'>
            Remote configuration:
          </div>
          <FormControl fullWidth className='col-sm-4'>
            <Select onChange={e=>this.changeSelector(e,'remote')} value={this.state.configuration['-defaultRemote']}>
              {optionsRemote}
            </Select>
          </FormControl>
        </div>
        <ModalConfiguration display={this.state.displayConfiguration} callback={this.toggleConfiguration} />

        <div className='row mt-3'>
          <div className='col-sm-6'>
            After configuration change, reload application.
          </div>
          <div className='col-sm-6'>
            <Button className='btn-block' variant="contained" onClick={()=>this.reload()}>
                Reload app
            </Button>
          </div>
        </div>

        <div className='row mt-3'>
          <div className='col-sm-6'>
            Synchronize
          </div>
          <div className='col-sm-3'>
            <Button className='btn-block' variant="contained" onClick={()=>this.pressedButton('btn_cfg_be_syncLR')}>
                Local-&gt;Remote
            </Button>
          </div>
          <div className='col-sm-3'>
            <Button className='btn-block' variant="contained" onClick={()=>this.pressedButton('btn_cfg_be_syncRL')}>
                Remote-&gt;Local
            </Button>
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


  showTasks(){  //TASK BLOCK
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

  showAbout() {  //ABOUT BLOCK
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
        <div className='border my-2 p-3'>
          {this.showConfiguration()}
        </div>

        { (REACT_VERSION==='Electron') &&    // *** React-Electron version
          <div className='border my-4 p-3'>
            {this.showTasks()}
          </div>
        }

        <div className='border my-2 p-3'>
          {this.showAbout()}
        </div>
      </div>
    );
  }
}
