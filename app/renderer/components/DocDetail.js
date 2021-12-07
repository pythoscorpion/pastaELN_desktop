/* List of details on the right side
*/
import React, { Component } from 'react';         // eslint-disable-line no-unused-vars
import ReactMarkdown from 'react-markdown';       // eslint-disable-line no-unused-vars
import { Button, Accordion, AccordionSummary, AccordionDetails,  // eslint-disable-line no-unused-vars
  FormControl, Select, MenuItem, IconButton} from '@material-ui/core';// eslint-disable-line no-unused-vars
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';// eslint-disable-line no-unused-vars
import AddCircleIcon from '@material-ui/icons/AddCircle';  // eslint-disable-line no-unused-vars
import Store from '../Store';
import * as Actions from '../Actions';
import dispatcher from '../Dispatcher';
import ModalAddAttachment from './ModalAddAttachment';// eslint-disable-line no-unused-vars
import { accordion, btn } from '../style';
import { executeCmd } from '../localInteraction';
import { orgToMd } from '../miscTools';

export default class DocDetail extends Component {
  //initialize
  constructor() {
    super();
    this.state = {
      doc: Store.getDocumentRaw(),
      extractors: [],
      extractorChoices: [],
      extractorChoice: '',
      docID2names: {},
      dispatcherToken: null,
      displayAttachment: 'none',
      attachmentName: null
    };
  }
  componentDidMount() {
    this.setState({doc:{} });
    Store.on('changeDoc', this.getDoc);
    this.setState({dispatcherToken: dispatcher.register(this.handleActions)});
  }
  componentWillUnmount() {
    Store.removeListener('changeDoc', this.getDoc);
    dispatcher.unregister(this.state.dispatcherToken);
  }


  /** Functions as class properties (immediately bound): react on user interactions **/
  handleActions=(action)=>{
    /* handle actions via Actions->Dispatcher from other pages */
    if (action.type==='RESTART_DOCDETAIL') {
      this.setState({doc:{} });
    }
  }

  getDoc=()=>{
    /* initial function after docID is known */
    const doc = Store.getDocumentRaw();
    const extractors = Store.getExtractors();
    const initialChoice = extractors[doc['-type'].join('/')] ? extractors[doc['-type'].join('/')] : '';
    var url = Store.getURL();
    if ('-attachment' in doc) {
      Object.keys(doc['-attachment']).map(key=>{
        doc['-attachment'][key].map(line=>{
          if (line.docID.length >1)
            //start filling local database of items
            url.url.get(url.path+line.docID).then((res) => {
              var docID2names = this.state.docID2names;
              docID2names[line.docID]=res.data['name'];
              this.setState({docID2names: docID2names});
            }).catch(()=>{
              console.log('DocDetail:getDoc: Error encountered: '+url.path+line.docID);
            });
        });
      });
    } else {
      this.setState({docID2names: {}});
    }
    this.setState({doc: doc,
      extractors: extractors,
      extractorChoices: Object.values(extractors),
      extractorChoice:  initialChoice});
  }

  pressedButton=(task)=>{
    /** any button press on this page
     * sibling for pressedButton in Project.js: change both similarly */
    if (task=='btn_detail_be_redo') {
      Actions.comState('busy');
      executeCmd(task, this.callback, this.state.doc._id, this.state.doc['-type'].join('/') );
    } else if (task=='delete') {
      Store.deleteDoc();
    }
  }
  callback=(content)=>{
    /* callback for all executeCmd functions */
    const contentArray = content.trim().split('\n');
    const lastLine = contentArray[contentArray.length-1].split(' ');
    if( lastLine[0]==='SUCCESS' ){
      Actions.comState('ok');
      Actions.readDoc(this.state.doc._id);            //read change
      Actions.readTable();
      this.getDoc();                                  //get from store
    } else {
      Actions.comState('fail');
    }
  }

  toggleAddAttachment=(name)=>{
    /** change visibility of configuration modal */
    if(this.state.displayAttachment==='none') {
      this.setState({displayAttachment: 'block', attachmentName:name});
    } else {
      this.setState({displayAttachment: 'none'});
    }
  }


  followLink=(docID)=>{
    /* follow link to another document possibly of another type */
    Actions.readDoc(docID);
  }

  changeSelector=(event)=>{
    /* chose an element from the drop-down menu*/
    this.setState({extractorChoice: event.target.value});
    var key = Object.values(this.state.extractors).indexOf(event.target.value);
    key = Object.keys(this.state.extractors)[key];
    Actions.updateDoc({'-type':key}, this.state.doc);  //change docType in document
    this.pressedButton('btn_detail_be_redo');       //create new image
  }

  /** create html-structure; all should return at least <div></div> **/
  showSpecial(key,heading) {
    /* Show content (of procedure), user metadata, vendor metadata, attachment */
    const {doc} = this.state;
    if (doc[key] && heading==null) {                //content
      return <ReactMarkdown source={orgToMd(doc[key])} />;
    } else {                            //attachment and user metadata and vendor metadata
      var docItems = null;
      if (doc[key] && (key=='metaUser' || key=='metaVendor'))
        docItems = Object.keys(doc[key]).map( item =>{
          return <div key={key+'_'+item}>{item}: <strong>{doc[key][item]}</strong></div>;
        });
      if (key=='-attachment') {
        /*TODO remove | only look at ontology for layout
        if (doc[key])
          docItems = Object.keys(doc[key]).map( item =>{
            return <div key={key+'_'+item}>
              <strong>{item}:</strong>
              <IconButton onClick={() => this.toggleAddAttachment(item)} className='ml-2' size='small'>
                <AddCircleIcon fontSize='small'/>
              </IconButton>
              <br/>
              {this.renderAttachment(doc[key][item])}
            </div>;
          });
        else {
          */
        const attachments = Store.getOntologyNode().filter(i=>{return i.attachment;});
        if (attachments.length>0)
          docItems = attachments.map(item =>{
            var attachment = item.attachment;
            return <div key={key+'_'+attachment}>
              <strong>{attachment}:</strong>
              <IconButton onClick={() => this.toggleAddAttachment(attachment)}
                className='ml-2' size='small'>
                <AddCircleIcon fontSize='small'/>
              </IconButton>
              <br/>
              {doc[key] && doc[key][item.attachment] && this.renderAttachment(doc[key][item.attachment])}
            </div>;
          });
        /* } */
      }
      if (Object.keys(doc).length>0 && docItems && docItems.length>0)
        return (<Accordion TransitionProps={{ unmountOnExit: true, timeout:0 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon style={accordion} />} style={accordion}>
            {heading}
          </AccordionSummary>
          <AccordionDetails><div>{docItems}</div></AccordionDetails>
        </Accordion>);
      else
        return <div></div>;
    }
  }



  renderAttachment(attachment) {
    /* render list of attachment changes into div*/
    const lines = attachment.map( item=>{
      return <div key={'attachment'+item.date}>
        {item.date}: {item.remark} <br/> &nbsp;&nbsp;
        {(item.docID in this.state.docID2names) ? this.state.docID2names[item.docID] : item.docID}
        {item.docID=='' && '-detached-'}
        &nbsp;by {item.user}
      </div>;
    });
    return <div>{lines}</div>;
  }


  show(showDB=true) {
    /* show either database details (true) or all other information (the main) (false)
       SAME AS IN Project:showMisc()    */
    const { doc } = this.state;
    if (!doc._id)
      return(<div></div>);
    const docItems = Object.keys(doc).map( (item,idx) => {
      if (Store.itemSkip.indexOf(item)>-1) {
        return <div key={'B'+idx.toString()}></div>;
      }
      const label=item.charAt(0).toUpperCase() + item.slice(1);
      if (showDB && Store.itemDB.indexOf(item)>-1) {
        if(typeof doc[item]=='string')
          return <div key={'B'+idx.toString()}>{label}: <strong>{doc[item]}</strong></div>;
        else
          return <div key={'B'+idx.toString()}>
            {label}: <strong>{JSON.stringify(doc[item])}</strong>
          </div>;
      }
      if (!showDB && Store.itemDB.indexOf(item)==-1) {
        if (/^[a-wyz]-[\w\d]{32}$/.test(doc[item]))  //if link to other dataset
          return (
            <div key={'B'+idx.toString()}> {label}:
              <strong onClick={()=>this.followLink(doc[item])} style={{cursor: 'pointer'}}> Link</strong>
            </div>);
        else {
          if (typeof doc[item]=='string')
            return <div key={'B'+idx.toString()}>{label}: <strong>{doc[item]}</strong></div>;
          const value = doc[item].length>0 ? doc[item].join(', ') : '';
          return <div key={'B'+idx.toString()}>{label}: <strong>{value}</strong></div>;
        }
      }
      return <div key={'B'+idx.toString()}></div>;
    });
    var heading = showDB ? 'Database details' : 'Metadata';
    return (<Accordion TransitionProps={{ unmountOnExit: true, timeout:0 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon style={accordion} />} style={accordion}>
        {heading}
      </AccordionSummary>
      <AccordionDetails><div>{docItems}</div></AccordionDetails>
    </Accordion>);
  }

  showImage() {
    /* show image stored in document*/
    const {image} = this.state.doc;
    if (!image) { return <div></div>; }
    var fullImage = image;
    var alt       = 'base64-format';
    if (image.substring(0,4)==='<?xm') {
      const base64data = btoa(unescape(encodeURIComponent(image)));
      fullImage  = 'data:image/svg+xml;base64,'+base64data;
      alt        = 'svg-format';
    }
    return (
      <div className='d-flex justify-content-center'>
        <div>
          <img src={fullImage} width='100%' alt={alt}></img>
          <FormControl fullWidth className='col-sm-12 pl-3 pr-1'>
            <Select onChange={e=>this.changeSelector(e)} value={this.state.extractorChoice}>
              {this.state.extractorChoices.map((item)=>{
                return (<MenuItem value={item} key={item}>{item}</MenuItem>);
              })}
            </Select>
          </FormControl>
        </div>
      </div>);
  }


  /** the render method **/
  render() {
    if (this.state.doc._id==='-ontology-')  //if no document is opened, because none is present, skip
      return(<div></div>);
    return (
      <div className='col px-1' style={{height:window.innerHeight-60, overflowY:'scroll'}}>
        {this.showImage()}
        {this.showSpecial('content'    ,null)}
        {this.show(false)}
        {this.showSpecial('metaUser'   ,'User metadata')}
        {this.showSpecial('metaVendor' ,'Vendor metadata')}
        {this.showSpecial('-attachment','Attachments')}
        {this.show()}
        {this.state.doc && this.state.doc._id && <Button onClick={()=>Actions.showForm('edit',null,null)}
          className='mt-2' id='editDataBtn' variant="contained" style={btn}>
            Edit data
        </Button>}
        {/* TODO makes more cluttered
          this.state.doc && this.state.doc.image && ELECTRON &&
          <Button onClick={()=>this.pressedButton('btn_detail_be_redo')}
            className='mt-2 ml-2' id='RedoBtn' variant="contained" style={btn}>
            Redo image
          </Button>*/}
        {this.state.doc && this.state.doc._id && <Button onClick={()=>this.pressedButton('delete')}
          className='mt-2 ml-2' id='DeleteBtn' variant="contained" style={btn}>
          Delete document*
        </Button>}
        <ModalAddAttachment display={this.state.displayAttachment} callback={this.toggleAddAttachment}
          name={this.state.attachmentName} docType={this.state.doc['-type']} />
      </div>
    );
  }
}
