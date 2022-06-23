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
import { Button, FormControl, MenuItem, Select,                   // eslint-disable-line no-unused-vars
  Accordion, AccordionSummary, AccordionDetails} from '@material-ui/core';// eslint-disable-line no-unused-vars
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';       // eslint-disable-line no-unused-vars
import { Alert } from '@material-ui/lab';                         // eslint-disable-line no-unused-vars
//import { Bar } from 'react-chartjs-2';                            // eslint-disable-line no-unused-vars
import Store from '../Store';
import * as Actions from '../Actions';
import ModalOntology from './ModalOntology';                      // eslint-disable-line no-unused-vars
import ModalConfiguration from './ModalConfiguration';            // eslint-disable-line no-unused-vars
import {getCredentials, editDefault, ELECTRON, executeCmd} from '../localInteraction';
import { area, h1, btn, textFG, flowText, btnStrong } from '../style';
import { logo } from './longStrings';
import { errorCodes } from '../errorCodes';

export default class ConfigPage extends Component {
  constructor() {
    super();
    this.state = {
      ready: true,  //ready is for all task buttons
      showOntology: 'none',
      showConfiguration: 'none',
      configuration: '',
      healthButton: btnStrong,
      healthText: '',
      history: null
    };
  }

  componentDidMount(){
    var config = getCredentials().configuration;
    if (!config)
      return;
    this.setState({configuration: config, intervalId: setInterval(this.timer, 20000)});    // store intervalId for later access
  }

  componentWillUnmount(){
    clearInterval(this.state.intervalId);
  }

  timer = () => {  //execute every 20sec
    this.setState({healthButton: btnStrong});
  }

  /** Functions as class properties (immediately bound): react on user interactions **/
  changeSelector = (event) =>{
    /** change configuration selector */
    editDefault(event.target.value);
    var config = this.state.configuration;
    config['default'] = event.target.value;
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
        if (key=='pma20' || (key=='pma01' && i.includes('https://____')) ) //User can ignore these
          return '';
        var value = errorCodes[key];
        if (value) {
          value += i.includes('|') ? ' : '+i.split('|')[1] : '';
          return '<strong>'+value+'</strong>';
        }
        return 'Unidentified error: '+i;
      });
      errors = errors.filter(i=>{return i!='';});
      this.setState({healthText:errors.join('<br/>'), healthButton:{backgroundColor:'red'}});
    } else {
      this.setState({healthButton:{backgroundColor:'lightgreen', color:'black'}});
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
    }
  }

  toggleOntology=(btnName)=>{
    /** changes in visibility of ontology modals */
    if(this.state.showOntology==='none') {
      this.setState({showOntology: 'block'});
    } else {
      this.setState({showOntology: 'none'});
      if (btnName=='save')
        this.pressedButton('btn_cfg_be_test'); //run backend test to create views
    }
  }

  toggleConfiguration=()=>{
    /** change visibility of configuration modal */
    if(this.state.showConfiguration==='none') {
      this.setState({showConfiguration: 'block'});
    } else {   //after close of configuration editor
      this.setState({showConfiguration: 'none'});
      this.reload('complete');                //reload possibly new configuration
      this.pressedButton('btn_cfg_be_test');  //health-test incl. create views for new ontology?
    }
  }

  /** create html-structure; all should return at least <div></div> **/
  showConfiguration() {
    /* configuration block */
    if (!this.state.configuration || !this.state.configuration['links']) {
      return <div></div>;
    }
    const options = Object.keys(this.state.configuration['links']).map((item)=>{
      return (<MenuItem value={item} key={item}>{item}</MenuItem>);
    });
    return(
      <div style={flowText}>
        <div style={h1}>Configuration</div>
        <div className='row mt-2'>
          <div className='col-sm-6'>
            Information on access (username, password), database configuration and local folders
          </div>
          <FormControl fullWidth className='col-sm-6 px-3'>
            <Select onChange={e=>this.changeSelector(e)}
              value={this.state.configuration['default']}>
              {options}
            </Select>
          </FormControl>
        </div>

        <div className='row mt-2'>
          <div className='col-sm-6'> Edit / Create / Delete configurations  </div>
          <div className='col-sm-6'>
            <Button className='btn-block' variant="contained" onClick={this.toggleConfiguration}
              disabled={!this.state.ready} id='configEditorBtn' style={btn}>
                Configuration-Editor
            </Button>
          </div>
        </div>
        <ModalConfiguration show={this.state.showConfiguration} callback={this.toggleConfiguration}/>

        {ELECTRON &&    // *** React-Electron version TODO pr-1 on Local->Remote button
          <div className='row mt-2'>
            <div className='col-sm-6'>
              Synchronize
            </div>
            <div className='col-sm-6'>
              <Button className='btn-block' variant="contained"
                onClick={()=>this.pressedButton('btn_cfg_be_syncLR')} style={btn}>
                Local &gt; Remote
              </Button>
            </div>
            {/*
            <div className='col-sm-3 pl-1'>
              <Button className='btn-block' variant="contained"
                onClick={()=>this.pressedButton('btn_cfg_be_syncRL')} style={btn}>
                Remote &gt; Local
              </Button>
            </div>
            */}
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
                Questionnaire-Editor
            </Button>
            <ModalOntology show={this.state.showOntology} callback={this.toggleOntology} />
          </div>
        </div>
      </div>
    );
  }


  showTasks(){
    /* show System / Maintenance block */
    return(
      <div style={flowText}>
        <div className='row mb-2'>
          <div className='col-sm-6' style={h1}>System</div>
          <div className='col-sm-6'>
            <Button variant="contained" style={{...btn, ...this.state.healthButton}}
              onClick={() => this.pressedButton('btn_cfg_be_test')} disabled={!this.state.ready}
              className='btn-block'>
              Health check
            </Button>
          </div>
        </div>
        {this.state.healthText.length>2 &&
          <Alert severity="error" key='healthAlert'>
            At least an error occurred: (after repair: "maintance-complete restart")<br />
            <div dangerouslySetInnerHTML={{ __html: this.state.healthText}} />
          </Alert>}
        <Accordion TransitionProps={{ unmountOnExit: true, timeout:0 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon/>} style={btn}>
            Maintenance
          </AccordionSummary>
          <AccordionDetails>
            <div>
              <div className='row mt-2'>
                <div className='col-sm-6'>
                  Restart application:
                </div>
                <div className='col-sm-3 pr-1'>
                  <Button className='btn-block' variant="contained"
                    onClick={()=>this.reload('fast')} style={btn}>
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
                    Reset ontology
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
                    Automatically repair configuration
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
                    Repair database
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
            <img src={logo} alt='logo, changed from free icon of monkik @ flaticon.com'/>
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
      <div className='container px-4 pt-2' style={{height:window.innerHeight-38, overflowY:'scroll'}}>
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
          <p style={flowText}>
            * During initial software development, certain functions (e.g. delete, some functions on
            this page) exist that will be removed once software more stable.</p>
          <p style={flowText}>Version number: 1.0.6</p>
        </div>

      </div>
    );
  }
}

/*
        Sentry warning
        ==============
          <p style={flowText}><strong>Warning:</strong>
          To find the problems that lead to the failure of the code and to easily help, we use
          sentry.io to get information when a crash/error/failure occurs. We only get information on
          which part of the code was responsible and the operating system. We do not get/collect/care
          for any data and metadata that you saved.</p>

          Show history of commits
          =======================
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
