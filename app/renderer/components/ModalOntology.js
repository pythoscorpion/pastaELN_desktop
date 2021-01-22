import React, { Component } from 'react';                         // eslint-disable-line no-unused-vars
import JSONInput from 'react-json-editor-ajrm';                   // eslint-disable-line no-unused-vars
import locale    from 'react-json-editor-ajrm/locale/en';
import { Button } from '@material-ui/core';
import Store from '../Store';

export default class ModalOntology extends Component {
  constructor() {
    super();
    this.state = {
      ontologyObj: {}
     };
  }

  dbConfigChange=(event)=>{
    if (event && 'error' in event && event.error===false) {
      this.setState({ontologyObj:event.jsObject});
    }
  }

  pressedLoadBtn=()=>{
    this.setState({ontologyObj: Store.getOntology()});
  }
  pressedSaveBtn=()=>{
    Store.updateDocument(this.state.ontologyObj,false);
    this.props.callback();
  }

  render(){
    if (this.props.display==='none') {
      return(<div></div>);
    }
    return (
      <div className="modal" style={{display: this.props.display}}>
        <div className="modal-content">
          <div  className="col border rounded p-1 p-1">
            <h1>Remark: This will become easier and prettier.</h1>
            <div>
              <JSONInput
                id          = 'jsonEditor'
                placeholder = { this.state.ontologyObj }
                onChange    = {e=> this.dbConfigChange(e)}
                theme       = "light_mitsuketa_tribute"
                width       = "800"
                locale      = { locale }
                style       = {{body:{fontSize:16}}}
                colors      = {{keys:'#1E1E1E', colon:'#1E1E1E', default:'#386FA4'}}
              />
              <Button onClick={() => this.pressedLoadBtn()}
                variant="contained" size="large"
                className='m-3'>
                  Load
              </Button>
              <Button onClick={() => this.pressedSaveBtn()}
                variant="contained" size="large"
                className='m-3'>
                  Save
              </Button>
              <Button onClick={() => this.props.callback()}
                variant="contained" size="large"
                className='float-right m-3'
                id='closeBtn'>
                  Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
