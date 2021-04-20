/* List of details on the right side
*/
import React, { Component } from 'react';         // eslint-disable-line no-unused-vars
import ReactMarkdown from 'react-markdown';       // eslint-disable-line no-unused-vars
import { Button, Accordion, AccordionSummary, AccordionDetails, FormControl, Select, MenuItem} from '@material-ui/core';// eslint-disable-line no-unused-vars
import EditIcon from '@material-ui/icons/Edit';   // eslint-disable-line no-unused-vars
import RedoIcon from '@material-ui/icons/Redo';   // eslint-disable-line no-unused-vars
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';// eslint-disable-line no-unused-vars
import Store from '../Store';
import * as Actions from '../Actions';
import dispatcher from '../Dispatcher';
import {ELECTRON, executeCmd} from '../localInteraction';

export default class DocDetail extends Component {
  //initialize
  constructor() {
    super();
    this.state = {
      doc: Store.getDocumentRaw(),
      extractors: [],
      extractorChoices: [],
      extractorChoice: '',
      dispatcherToken: null
    };
  }
  componentDidMount() {
    Store.on('changeDoc', this.getDoc);
    this.setState({dispatcherToken: dispatcher.register(this.handleActions)});
  }
  componentWillUnmount() {
    Store.removeListener('changeDoc', this.getDoc);
    dispatcher.unregister(this.state.dispatcherToken);
  }
  handleActions=(action)=>{
    if (action.type==='RESTART_DOCDETAIL') {
      this.setState({doc:{} });
    }
  }

  getDoc=()=>{ //initial function after docID is clear
    this.setState({doc: Store.getDocumentRaw()});
    const extractors = Store.getExtractors();
    this.setState({extractors: extractors});
    this.setState({extractorChoices: Object.values(extractors)});
    this.setState({extractorChoice:  extractors[this.state.doc.type.join('/')]});
  }

  pressedButton=(task)=>{  //sibling for pressedButton in Project.js: change both similarly
    Actions.comState('busy');
    executeCmd(task,this.callback,this.state.doc._id, this.state.doc.type.join('/') );
  }
  // callback for all executeCmd functions
  callback=(content)=>{
    const contentArray = content.trim().split('\n');
    const lastLine = contentArray[contentArray.length-1].split(' ');
    if( lastLine[0]==='SUCCESS' ){
      Actions.comState('ok');
      Actions.readDoc(this.state.doc._id);            //read change
      this.getDoc();                                  //get from store
      } else {
      Actions.comState('fail');
    }
  }
  followLink=(docID)=>{
    console.log('Follow link',docID);
    Actions.readDoc(docID);
  }


  changeSelector=(event)=>{
    this.setState({extractorChoice: event.target.value});
    var key = Object.values(this.state.extractors).indexOf(event.target.value);
    key = Object.keys(this.state.extractors)[key];
    Actions.updateDoc({type:key}, this.state.doc);  //change docType in document
    this.pressedButton('btn_detail_be_redo');       //create new image
  }

  /**************************************
   * process data and create html-structure
   * all should return at least <div></div>
   **************************************/
  showSpecial(key,heading) {
    /* Show content (of procedure), user metadata, vendor metadata
    */
    const {doc} = this.state;
    if (doc[key]) {
      if (heading==null) {
        return <ReactMarkdown source={doc[key]} />;
      } else {
        const docItems = Object.keys(doc[key]).map( item =>{
          return <div key={key+'_'+item}>{item}: <strong>{doc[key][item]}</strong></div>;
        });
        if (docItems.length>0)
          return (<Accordion TransitionProps={{ unmountOnExit: true, timeout:0 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon style={{color:'white'}} />} style={{backgroundColor:'#8e8c84', color:'white'}}>
              {heading}
            </AccordionSummary>
            <AccordionDetails><div>{docItems}</div></AccordionDetails>
          </Accordion>);
        else
          return <div></div>;
      }
    }
    else {
      return <div></div>;
    }
  }


  show(showDB=true) {
    /* show either database details or all other information
       SAME AS IN Project:showMisc()
    */
    const { doc } = this.state;
    if (!doc._id)
      return(<div></div>);
    const docItems = Object.keys(doc).map( (item,idx) => {
      if (Store.itemSkip.indexOf(item)>-1) {
        return <div key={'B'+idx.toString()}></div>;
      }
      const label=item.charAt(0).toUpperCase() + item.slice(1);
      if (showDB && Store.itemDB.indexOf(item)>-1)
        return <div key={'B'+idx.toString()}>{label}: <strong>{doc[item]}</strong></div>;
      if (!showDB && Store.itemDB.indexOf(item)==-1) {
        if (/^[a-wyz]-[\w\d]{32}$/.test(doc[item]))
          return <div key={'B'+idx.toString()}>{label}: <strong onClick={()=>this.followLink(doc[item])}>Link</strong></div>;  //TODO LINK
        else
          return <div key={'B'+idx.toString()}>{label}: <strong>{doc[item]}</strong></div>;
      }
      return <div key={'B'+idx.toString()}></div>;
    });
    var heading = showDB ? 'Database details' : 'Metadata';
    return (<Accordion TransitionProps={{ unmountOnExit: true, timeout:0 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon style={{color:'white'}} />} style={{backgroundColor:'#8e8c84', color:'white'}}>
        {heading}
      </AccordionSummary>
      <AccordionDetails><div>{docItems}</div></AccordionDetails>
    </Accordion>);
  }


  showImage() {
    const {image} = this.state.doc;
    if (!image) { return <div></div>; }
    if (image.substring(0,4)==='<?xm') {
      const base64data = btoa(unescape(encodeURIComponent(image)));
      return (
        <div className='d-flex justify-content-center'>
          <div>
            <img src={'data:image/svg+xml;base64,'+base64data} width='100%' alt='svg-format'></img>
            <FormControl fullWidth className='col-sm-12'>
              <Select onChange={e=>this.changeSelector(e)} value={this.state.extractorChoice}>
                {this.state.extractorChoices.map((item)=>{
                    return (<MenuItem value={item} key={item}>{item}</MenuItem>);
                  })}
              </Select>
            </FormControl>
          </div>
        </div>);
    } else {
      return (
        <div className='d-flex justify-content-center'>
          <div>
            <img src={image} width='100%' alt='base64-format'></img>
            <FormControl fullWidth className='col-sm-12'>
              <Select onChange={e=>this.changeSelector(e)} value={this.state.extractorChoice}>
                {this.state.extractorChoices.map((item)=>{
                    return (<MenuItem value={item} key={item}>{item}</MenuItem>);
                  })}
              </Select>
            </FormControl>
          </div>
        </div>);
    }
  }


  //the render method
  render() {
    if (this.state.doc._id==='-ontology-')  //if no document is opened, because none is present, skip
      return(<div></div>);
    return (
      <div className='col p-1' style={{height:window.innerHeight-60}}>
        {this.showImage()}
        {this.showSpecial('content',null)}
        {this.show(false)}
        {this.showSpecial('metaUser','PASTA metadata')}
        {this.showSpecial('metaVendor','Vendor metadata')}
        {this.show()}
        {this.state.doc && this.state.doc._id && <Button onClick={()=>Actions.showForm('edit',null,null)}
          className='m-2' id='editDataBtn' startIcon={<EditIcon />} color='primary'>
            Edit data
        </Button>}
        {this.state.doc && this.state.doc.image && ELECTRON && <Button onClick={()=>this.pressedButton('btn_detail_be_redo')}
          className='m-2' id='RedoBtn' startIcon={<RedoIcon />} color='primary'>
            Redo image
        </Button>}
      </div>
    );
  }
}
