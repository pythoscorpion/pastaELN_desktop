/* List of details on the right side
*/
import React, { Component } from 'react';         // eslint-disable-line no-unused-vars
import ReactMarkdown from 'react-markdown';       // eslint-disable-line no-unused-vars
import { Accordion, AccordionSummary, AccordionDetails,  // eslint-disable-line no-unused-vars
  FormControl, Select, MenuItem, IconButton} from '@material-ui/core';// eslint-disable-line no-unused-vars
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';// eslint-disable-line no-unused-vars
import AddCircleIcon from '@material-ui/icons/AddCircle';  // eslint-disable-line no-unused-vars
import Edit from '@material-ui/icons/Edit';                // eslint-disable-line no-unused-vars
import Delete from '@material-ui/icons/Delete';            // eslint-disable-line no-unused-vars
import Flag from '@material-ui/icons/Flag';       // eslint-disable-line no-unused-vars
import Store from '../Store';
import * as Actions from '../Actions';
import dispatcher from '../Dispatcher';
import ModalAddAttachment from './ModalAddAttachment';// eslint-disable-line no-unused-vars
import { btn, colorStrong, h1 } from '../style';
import { executeCmd } from '../localInteraction';

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
      showAttachment: 'none',
      attachmentName: null,
      imageSize: Store.getGUIConfig('imageSize'),
      ontologyNode: null
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
          if (line.docID && line.docID.length >1)
            //start filling local database of items
            url.url.get(url.path+line.docID).then((res) => {
              var docID2names = this.state.docID2names;
              docID2names[line.docID]=res.data['-name'];
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
      extractorChoice:  initialChoice,
      ontologyNode: Store.getOntologyNode(doc['-type']) });
  }


  pressedButton=(task)=>{
    /** any button press on this page
     * sibling for pressedButton in Project.js: change both similarly */
    if (task=='btn_detail_be_redo') {
      Actions.comState('busy');
      executeCmd(task, this.callback, this.state.doc._id, this.state.doc['-type'].join('/') );
    } else if (task=='delete') {
      Store.deleteDoc();
      this.setState({doc:{} });
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
    if(this.state.showAttachment==='none') {
      this.setState({showAttachment: 'block', attachmentName:name});
    } else {
      this.setState({showAttachment: 'none'});
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
      return <ReactMarkdown className='ml-3' source={doc[key]} />;
    } else {                            //attachment and user metadata and vendor metadata
      var docItems = null;
      if (doc[key] && (key=='metaUser' || key=='metaVendor'))
        docItems = Object.keys(doc[key]).map( item =>{
          const v = (typeof doc[key][item] === 'string' || doc[key][item] instanceof String ||
                     typeof doc[key][item] === 'number' ) ? doc[key][item] : JSON.stringify(doc[key][item]);
          return <div key={key+'_'+item}>{item}: <strong>{v}</strong></div>;
        });
      if (key=='-attachment') {
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
        return (<Accordion TransitionProps={{unmountOnExit: true, timeout:0}} defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon/>} style={btn}>
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
      return <div key={'attachment'+item.date} >
        {new Date(item.date).toLocaleString()}: {item.remark} {item.flag && <Flag style={{color:'red'}}/>}
        <br/> &nbsp;&nbsp;
        {(item.docID in this.state.docID2names) ? this.state.docID2names[item.docID] : item.docID}
        {item.docID=='' && '-detached-'}
        &nbsp;by user: {item.user}
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
        var desc = null;
        var description = this.state.ontologyNode;
        if (this.state.ontologyNode)
          description = description.filter(i=>{return(i.name==item);});
        if (description && description.length>0 && item!='comment')
          description = description[0];
        if (description && 'query' in description)
          desc = description['query'];
        if (/^[a-wyz]-[\w\d]{32}$/.test(doc[item]))  //if link to other dataset
          return (
            <div key={'B'+idx.toString()}> {label}:
              <strong onClick={()=>this.followLink(doc[item])} style={{cursor: 'pointer'}}> Link</strong>
              &nbsp;{desc?'('+desc+')':''}
            </div>);
        else {
          if (item=='-name')   //skip name
            return <div key='B_name'></div>;
          if (typeof doc[item]=='string' && doc[item].indexOf('\n')>0)   //if string with /n
            return <div key={'B'+idx.toString()}>{label}: &nbsp;{desc?'('+desc+')':''}
              <ReactMarkdown source={doc[item]} />
            </div>;
          //TODO_P3 reactMarkdown not rendered correctly
          if (['string','number'].indexOf(typeof doc[item])>-1)                   //if normal string
            return <div key={'B'+idx.toString()}>{label}: <strong>{doc[item]}</strong>
              &nbsp;{desc?'('+desc+')':''}
            </div>;
          const value = doc[item].length>0 ? doc[item].join(', ') : '';
          return <div key={'B'+idx.toString()}>{label}: <strong>{value}</strong>
              &nbsp;{desc?'('+desc+')':''}
          </div>;
        }
      }
      return <div key={'B'+idx.toString()}></div>;
    });
    var heading = showDB ? 'Database details' : 'Metadata';
    return (<Accordion TransitionProps={{ unmountOnExit: true, timeout:0 }}
      defaultExpanded={showDB ? false : true}>
      <AccordionSummary expandIcon={<ExpandMoreIcon/>} style={btn}>
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
          <center>
            <img src={fullImage} width={this.state.imageSize} alt={alt}></img>
          </center>
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
      <div className='col px-1' style={{height:window.innerHeight-38, overflowY:'scroll'}}>
        <div className='row'>
          <div className='m-3 px-3' style={h1}>{this.state.doc['-name']}</div>
          <div className='ml-auto'>
            {this.state.doc && this.state.doc._id &&
            <IconButton onClick={()=>Actions.showForm('edit',null,null)} className='m-0' id='editDataBtn'>
              <Edit fontSize='large' style={{color:colorStrong}} />
            </IconButton>}
            {/*this.state.doc && this.state.doc.image && ELECTRON &&
            <Button onClick={()=>this.pressedButton('btn_detail_be_redo')}
            className='mt-2 ml-2' id='RedoBtn' variant="contained" style={btn}>
            Redo image
          </Button>*/}
            {this.state.doc && this.state.doc._id &&
            <IconButton onClick={()=>this.pressedButton('delete')}  className='m-0 mr-3' id='DeleteBtn'>
              <Delete fontSize='large'/>
            </IconButton>}
            <ModalAddAttachment show={this.state.showAttachment} callback={this.toggleAddAttachment}
              name={this.state.attachmentName} docType={this.state.doc['-type']} />
          </div>
        </div>
        {this.showImage()}
        {this.showSpecial('content'    ,null)}
        {this.show(false)}
        {this.showSpecial('metaUser'   ,'User metadata')}
        {this.showSpecial('metaVendor' ,'Vendor metadata')}
        {this.showSpecial('-attachment','Attachments')}
        {this.show()}
      </div>
    );
  }
}
