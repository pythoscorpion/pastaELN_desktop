/* List of details on the right side
*/
import React, { Component } from 'react';         // eslint-disable-line no-unused-vars
import ReactMarkdown from 'react-markdown';       // eslint-disable-line no-unused-vars
import { Button, Accordion, AccordionSummary, AccordionDetails } from '@material-ui/core';// eslint-disable-line no-unused-vars
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';// eslint-disable-line no-unused-vars
import Store from '../Store';
import * as Actions from '../Actions';

export default class DocDetail extends Component {
  //initialize
  constructor() {
    super();
    this.state = {
      doc: Store.getDocumentRaw()
    };
  }
  componentDidMount() {
    Store.on('changeDoc', this.getDoc);
  }
  componentWillUnmount() {
    Store.removeListener('changeDoc', this.getDoc);
  }
  getDoc=()=>{
    this.setState({doc: Store.getDocumentRaw()});
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
          return (<Accordion>
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
    */
    const itemDB = ['_id','_rev','user','type','shasum','nextRevision','client','qrCode','curate'];
    const itemSkip = ['metaUser','metaVendor','image','content','branch'];
    const { doc } = this.state;
    const docItems = Object.keys(doc).map( (item,idx) => {
      if (itemSkip.indexOf(item)>-1) {
        return <div key={'B'+idx.toString()}></div>;
      }
      if (showDB && itemDB.indexOf(item)>-1)
        return <div key={'B'+idx.toString()}>{item}: <strong>{doc[item]}</strong></div>;
      if (!showDB && itemDB.indexOf(item)==-1)
        return <div key={'B'+idx.toString()}>{item}: <strong>{doc[item]}</strong></div>;
      return <div key={'B'+idx.toString()}></div>;
    });
    var heading = 'Metadata';
    if (showDB)
      heading = 'Database details';
    return (<Accordion>
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
          <img src={'data:image/svg+xml;base64,'+base64data} width='100%' alt='svg-format'></img>
        </div>);
    } else {
      return (
        <div className='d-flex justify-content-center'>
          <img src={image} width='100%' alt='base64-format'></img>
        </div>);
    }
  }


  //the render method
  render() {
    return (
      <div className='col border rounded p-1 mt-2'>
        {this.showImage()}
        {this.showSpecial('content',null)}
        {this.show(false)}
        {this.showSpecial('metaUser','PASTA metadata')}
        {this.showSpecial('metaVendor','Vendor metadata')}
        {this.show()}
        {this.state.doc && <Button onClick={()=>Actions.showForm('edit')} variant='contained' className='m-2' id='editDataBtn'>Edit data</Button>}
      </div>
    );
  }
}
