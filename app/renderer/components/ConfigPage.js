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
import { Button, TextField, FormControl, MenuItem, Select,
  Accordion, AccordionSummary, AccordionDetails} from '@material-ui/core';// eslint-disable-line no-unused-vars
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';       // eslint-disable-line no-unused-vars
import { Alert } from '@material-ui/lab';                         // eslint-disable-line no-unused-vars
import { Bar } from 'react-chartjs-2';                            // eslint-disable-line no-unused-vars
import Store from '../Store';
import * as Actions from '../Actions';
import ModalOntology from './ModalOntology';                      // eslint-disable-line no-unused-vars
import ModalConfiguration from './ModalConfiguration';            // eslint-disable-line no-unused-vars
import {getCredentials, editDefault, ELECTRON, executeCmd} from '../localInteraction';
import { area, h1, btn, textFG, flowText, accordion } from '../style';
import { errorCodes } from '../errorCodes';

export default class ConfigPage extends Component {
  constructor() {
    super();
    this.state = {
      ready: true,  //ready is for all task buttons
      displayOntology: 'none',
      displayConfiguration: 'none',
      configuration: {'-defaultLocal':'', '-defaultRemote':''},
      logging: '',
      healthButton: btn.backgroundColor,
      healthText: '',
      history: null
    };
  }

  componentDidMount(){
    var config = getCredentials().configuration;
    if (!config)
      return;
    if (!config['-defaultRemote']) {
      config['-defaultRemote'] ='';
    }
    this.setState({configuration: config, logging: Store.getLog() });
  }

  /** Functions as class properties (immediately bound): react on user interactions **/
  changeSelector = (event,item) =>{
    /** if configuration selector */
    var config = this.state.configuration;
    item = '-default' + item.charAt(0).toUpperCase() + item.slice(1);
    config[item] = event.target.value;
    editDefault(item,event.target.value);
    this.setState({configuration: config});
    this.reload('fast');
  }

  reload = (grade='fast') => {
    /** Reload entire app. Fast version of window.location.reload(); */
    if (grade=='fast') {
      Store.initStore();
    } else {
      window.location.reload();
    }
  }

  /*
  clearLogging = () =>{//not called anymore
    /** Clear all logs in Store, ... *./
    this.setState({logging:''});
    Actions.emptyLogging();
  }
  */
  getLoggingFromStore = () => {
    /** Get logging information from Store */
    const text = (this.state.logging.length>1) ? this.state.logging+'\n'+Store.getLog() : Store.getLog();
    this.setState({logging: text });
  }

  pressedButton=(task)=>{
    /**
     * clicked button and execute a command in backend
     * sibling for pressedButton in Project.js: change both similarly
     */
    if (task!='btn_cfg_be_history' || !this.state.history) {
      Actions.comState('busy');
      this.setState({ready: false});
      executeCmd(task,this.callback);
    } else {   //default
      this.setState({history:null });
    }
  }

  callback=(content)=>{
    /** callback for all executeCmd functions */
    this.setState({ready: true});
    //parse information: success/failure
    var contentArray = content.trim().split('\n');
    content = contentArray.slice(0,contentArray.length-1).join('\n').trim();//clean version
    const lastLine = contentArray[contentArray.length-1].split(' ');
    if( lastLine[1]=='btn_cfg_be_extractorScan') {
      Actions.updateExtractors();
      content = 'Extractor scan: success';
    } else if ( lastLine[1]=='btn_cfg_be_testDev') {
      this.reload();
    }
    if( lastLine[0]==='SUCCESS' ){
      Actions.comState('ok');
      content += '\nSUCCESS';
    } else if( lastLine[0]==='success' ){
      content += '\nsuccess';
    } else {
      Actions.comState('fail');
      content += '\nFAILURE';
    }

    contentArray.pop();
    var errors = contentArray.filter(i=>{
      return i.match(/\*\*ERROR [\w]{3}[\d]{2}\w*:/i);});
    if (errors.length>0) {
      console.log('Errors',errors);
      errors = errors.map(i=>{
        const key = i.substring(8,13);
        if (key=='pma20')
          return '';
        var value = errorCodes[key];
        if (value) {
          value += i.includes('|') ? ' : '+i.split('|')[1] : '';
          return '<strong>'+value+'</strong>';
        }
        return 'Unidentified error: '+i;
      });
      errors = errors.filter(i=>{return i!='';});
      this.setState({healthText:errors.join('<br/>'), healthButton:'red'});
    } else {
      this.setState({healthButton:'green'});
    }

    // get history data
    if (content[0]=='{' && content.indexOf('-bins-')>0 && content.indexOf('-score-')>0) {
      var history = content.substring(0, content.length-8).replace(/'/g,'"');
      history     = history.replace(/array\(\[/g,'[').replace(/\]\),\s/g,'],');
      history = JSON.parse(history);
      const keys = Object.keys(history).filter((i)=>{return i[0]!='-';});
      const colors = ['#00F','#0F0','#F00','#000','#0FF','#F0F','#FF0'];
      const datasets = keys.map((key,idx)=>{
        const score = history['-score-'][key];
        return {label: key+' '+score.toFixed(2), data:history[key], backgroundColor:colors[idx]};
      });
      const labels = history['-bins-'].map((i)=>{
        return i.split('T')[0];
      });
      var data = {labels: labels,  datasets:datasets, };
      this.setState({history: data});
    } else {
    // all other cases than history
      this.setState({logging: (this.state.logging+'\n\n'+content).trim()});
    }
  }

  toggleOntology=(btnName)=>{
    /** changes in visibility of ontology modals */
    if(this.state.displayOntology==='none') {
      this.setState({displayOntology: 'block'});
    } else {
      this.setState({displayOntology: 'none'});
      if (btnName=='save')
        this.pressedButton('btn_cfg_be_test'); //run backend test to create views
    }
  }

  toggleConfiguration=()=>{
    /** change visibility of configuration modal */
    if(this.state.displayConfiguration==='none') {
      this.setState({displayConfiguration: 'block'});
    } else {
      this.setState({displayConfiguration: 'none'});
      this.reload('complete');
    }
  }

  /** create html-structure; all should return at least <div></div> **/
  showConfiguration() {
    /* configuration block */
    var optionsLocal  = [];  //default
    var optionsRemote = [];
    if (this.state.configuration) {
      var configsLocal = Object.keys(this.state.configuration).filter((item)=>{
        return item[0]!='-' && this.state.configuration[item] && this.state.configuration[item]['path'];
      });
      var configsRemote = Object.keys(this.state.configuration).filter((item)=>{
        return item[0]!='-' && this.state.configuration[item] && !this.state.configuration[item]['path'];
      });
      optionsLocal = configsLocal.map((item)=>{
        return (<MenuItem value={item} key={item}>{item}</MenuItem>);
      });
      optionsRemote = configsRemote.map((item)=>{
        return (<MenuItem value={item} key={item}>{item}</MenuItem>);
      });
    }
    return(
      <div style={flowText}>
        <div>
          <span style={h1}>Configuration</span> &nbsp; information on access (username, password), database configuration and local folders
        </div>
        <div className='row'>
          {ELECTRON &&    // *** React-Electron version
            <div className='col-sm-6 row'>
              <div className='col-sm-4 pt-2'>
                Local:
              </div>
              <FormControl fullWidth className='col-sm-8'>
                <Select onChange={e=>this.changeSelector(e,'local')}
                  value={this.state.configuration['-defaultLocal']}>
                  {optionsLocal}
                </Select>
              </FormControl>
            </div>
          }
          <div className='col-sm-2 ml-4 pt-2'>
            Remote:
          </div>
          <FormControl fullWidth className='col-sm-4 pr-2'>
            <Select onChange={e=>this.changeSelector(e,'remote')}
              value={this.state.configuration['-defaultRemote']}>
              {optionsRemote}
            </Select>
          </FormControl>
        </div>

        <div className='row mt-2'>
          <div className='col-sm-6'> Edit / Create / Delete configurations  </div>
          <div className='col-sm-6'>
            <Button className='btn-block' variant="contained" onClick={this.toggleConfiguration}
              disabled={!this.state.ready} id='configEditorBtn' style={btn}>
                Editor
            </Button>
            <ModalOntology display={this.state.displayOntology} callback={this.toggleOntology} />
          </div>
        </div>
        <ModalConfiguration display={this.state.displayConfiguration} callback={this.toggleConfiguration}/>

        {ELECTRON &&    // *** React-Electron version
          <div className='row mt-2'>
            <div className='col-sm-6'>
              Synchronize
            </div>
            <div className='col-sm-3 pr-1'>
              <Button className='btn-block' variant="contained"
                onClick={()=>this.pressedButton('btn_cfg_be_syncLR')} style={btn}>
                Local &gt; Remote
              </Button>
            </div>
            <div className='col-sm-3 pl-1'>
              <Button className='btn-block' variant="contained"
                onClick={()=>this.pressedButton('btn_cfg_be_syncRL')} style={btn}>
                Remote &gt; Local
              </Button>
            </div>
          </div>
        }

        <div className='row mt-4'>
          <div className='col-sm-6'>
            Ontology: Define what data types (samples, measurements, ...)
            with which metadata (name, comments, ...) you want to store.
          </div>
          <div className='col-sm-6'>
            <Button className='btn-block' variant="contained" onClick={this.toggleOntology}
              disabled={!this.state.ready} id='ontologyBtn' style={btn}>
                Edit questionnaire forms
            </Button>
            <ModalOntology display={this.state.displayOntology} callback={this.toggleOntology} />
          </div>
        </div>
      </div>
    );
  }


  showTasks(){
    /* show System / Maintenance block */
    return(
      <div style={flowText}>
        <div className='mb-2'>
          <span style={h1}>System</span> &nbsp;
          <Button variant="contained" style={{backgroundColor:this.state.healthButton}}
            onClick={() => this.pressedButton('btn_cfg_be_test')}>
            Health check
          </Button>
        </div>
        {this.state.healthText.length>2 &&
          <Alert severity="error" key='healthAlert'>
            At least an error occurred: (after repair: "maintance-complete restart")<br />
            <div dangerouslySetInnerHTML={{ __html: this.state.healthText}} />
          </Alert>}
        <Accordion TransitionProps={{ unmountOnExit: true, timeout:0 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon style={accordion} />} style={accordion}>
            Maintenance
          </AccordionSummary>
          <AccordionDetails>
            <div>
              <div className='row mt-2'>
                <div className='col-sm-6'>
                  Restart application:
                </div>
                <div className='col-sm-3 pr-1'>
                  <Button className='btn-block' variant="contained" onClick={()=>this.reload('fast')} style={btn}>
                      fast restart
                  </Button>
                </div>
                <div className='col-sm-3 pl-1'>
                  <Button className='btn-block' variant="contained" onClick={()=>this.reload('complete')}
                    style={btn}>
                      complete restart
                  </Button>
                </div>
              </div>

              <div className='row mt-2'>
                <div className='col-sm-6'>
                  Reset ontology / delete all previously entered questions.
                </div>
                <div className='col-sm-6'>
                  <Button onClick={() => this.pressedButton('btn_cfg_be_testDev')} className='btn-block'
                    variant="contained" disabled={!this.state.ready} style={btn}>
                    Reset ontology *
                  </Button>
                </div>
              </div>

              <div className='row mt-2'>
                <div className='col-sm-6'>
                  Re-check and get all extractors
                </div>
                <div className='col-sm-6'>
                  <Button onClick={() => this.pressedButton('btn_cfg_be_extractorScan')} className='btn-block'
                    variant="contained" disabled={!this.state.ready} style={btn}>
                    Scan extractors
                  </Button>
                </div>
              </div>

              <div className='row mt-2'>
                <div className='col-sm-6'>
                  Configuration file in home directory
                </div>
                <div className='col-sm-6'>
                  <Button onClick={() => this.pressedButton('btn_cfg_be_verifyConfigurationDev')}
                    className='btn-block' variant="contained" disabled={!this.state.ready} style={btn}>
                    Automatically repair configuration *
                  </Button>
                </div>
              </div>

              <div className='row mt-2'>
                <div className='col-sm-6'>
                  Test / Repair database logic: e.g. revisions make sense, QR codes exist for samples,...
                </div>
                <div className='col-sm-3 pr-1'>
                  <Button onClick={() => this.pressedButton('btn_cfg_be_verifyDB')} className='btn-block'
                    variant="contained" disabled={!this.state.ready} style={btn}>
                    Test database integrity
                  </Button>
                </div>
                <div className='col-sm-3 pl-1'>
                  <Button onClick={() => this.pressedButton('btn_cfg_be_verifyDBdev')} className='btn-block'
                    variant="contained" disabled={!this.state.ready} style={btn}>
                    Repair database *
                  </Button>
                </div>
              </div>

              <div className='row'>
                <div className='col-sm-6'>
                  Backup files are zip-files which include all the meta data. Unzip and open the resulting
                  json-files with web-browser.
                </div>
                <div className='col-sm-3 pr-1'>
                  <Button onClick={() => this.pressedButton('btn_cfg_be_saveBackup')} className='btn-block'
                    variant="contained" disabled={!this.state.ready} style={btn}>
                    Save backup
                  </Button>
                </div>
                <div className='col-sm-3 pl-1'>
                  <Button onClick={() => this.pressedButton('btn_cfg_be_loadBackup')} className='btn-block'
                    variant="contained" disabled={!this.state.ready} style={btn}>
                    Load backup
                  </Button>
                </div>
              </div>
              <div className='row'>
                <div className='col-sm-6'>
                  Download update to backend and frontend from jugit.fz-juelich.de server. After update,
                  reload app by pressing button.
                </div>
                <div className='col-sm-6'>
                  <Button
                    onClick={() => this.pressedButton('btn_cfg_be_updatePASTA')} className='btn-block'
                    variant="contained" disabled={!this.state.ready} style={btn}>
                    Update software
                  </Button>
                </div>
              </div>
              <div className='mt-3'>
                Log of issues and activity
                <Button className='mx-3' onClick={()=>{this.getLoggingFromStore();}}
                  variant="contained" style={btn}>
                  Inquire all information
                </Button>
                <div className='col-sm-12 mt-2 px-0'>
                  <TextField multiline rows={8} fullWidth value={this.state.logging} variant="outlined"
                    InputProps={{readOnly: true}}/>
                </div>
              </div>

            </div>
          </AccordionDetails>
        </Accordion>
      </div>
    );
  }

  showAbout() {
    /* show about block */
    return(
      <div style={flowText} >
        <div className='row'>
          <div className='mx-3'>
            <img src={this.logo} alt='logo, changed from free icon of monkik @ flaticon.com'/>
          </div>
          <div>
            <h1 style={h1} className='ml-3'>PASTA (adaPtive mAterials Science meTa dAta) database</h1>
          </div>
        </div>
        <p className="m-2">
          <strong>Links to help / more information</strong><br />
          <a target="_blank"  href='https://jugit.fz-juelich.de/pasta/main/-/wikis/troubleshooting'
            style={{color:textFG}}>
            &gt; What if problems occur...
          </a><br/>
          <a target="_blank"  style={{color:textFG}}
            href='https://jugit.fz-juelich.de/pasta/main/-/wikis/home#concepts-of-pasta-database'>
            &gt; Concept of PASTA ...
          </a><br/>
          <a target="_blank"  href='https://youtu.be/9nVMqMs1Wvw' style={{color:textFG}}>
            &gt; A teaser youtube video...(it uses the old name: jamDB)</a> <br />
        </p>
      </div>
    );
  }


  /** the render method **/
  render(){
    return (
      <div className='container px-4 pt-2' style={{height:window.innerHeight-60, overflowY:'scroll'}}>

        <div className='p-3' style={area}>
          {this.showConfiguration()}
        </div>

        { ELECTRON &&    // *** React-Electron version
          <div className='my-3 p-3' style={area}>
            {this.showTasks()}
          </div>
        }

        <div className='p-3' style={area}>
          {this.showAbout()}
        </div>

        <div className='mb-3 p-3' style={area}>
          <p style={flowText}><strong>Warning:</strong>
          To find the problems that lead to the failure of the code and to easily help, we use
          sentry.io to get information when a crash/error/failure occurs. We only get information on
          which part of the code was responsible and the operating system. We do not get/collect/care
          for any data and metadata that you saved.</p>
          <p style={flowText}>
            * During initial software development, certain functions (e.g. delete document) exist
            that will be removed once software more stable.</p>
        </div>

      </div>
    );
  }

  logo = 'data:image/png;base64,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';  //eslint-disable-line
}

/*
        <div className='row mt-2'>
          <div className='col-sm-6'>
            Show history of modifications to this database
          </div>
          <div className='col-sm-6'>
            <Button onClick={() => this.pressedButton('btn_cfg_be_history')} className='btn-block'
              variant="contained" disabled={!this.state.ready} style={btn}>
              {!this.state.history && 'Show history'}
              { this.state.history && 'Hide history'}
            </Button>
          </div>
        </div>
        {this.state.history &&
        <Bar className='my-2' data={this.state.history} />
        }
*/