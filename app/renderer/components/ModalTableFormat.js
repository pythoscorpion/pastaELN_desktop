import React, { Component } from 'react';                         // eslint-disable-line no-unused-vars
import { Button, Input, InputAdornment, IconButton, TextField, InputLabel, Select, MenuItem, FormControl} from '@material-ui/core';// eslint-disable-line no-unused-vars
import {saveCredentials, getHomeDir, getCredentials, deleteConfig, getUP} from '../localInteraction';

export default class ModalTableFormat extends Component {
  constructor() {
    super();
    this.state = {
    };
  }
  componentDidMount() {
  }

  render(){
    if (this.props.display==='none') {
      return(<div></div>);
    }
    return (
      <div className="modal" style={{display: this.props.display}}>
        <div className="modal-content">
          <div  className="col border rounded p-1 p-1">
            {/*=======PAGE HEADING=======*/}
            <div className="col">
              <h1 className='col-sm-7 p-3'>Edit table columns</h1>
              <div className="row">
                <Button onClick={() => this.pressedSaveBtn()}
                  variant="contained" disabled={this.state.disableSubmit}
                  className='col-sm-1 m-2' id='confSaveBtn'>
                    Save
                </Button>
                <Button onClick={() => this.pressedDeleteBtn()}
                  variant="contained" disabled={this.state.disableSubmit}
                  className='col-sm-1 m-2' id='confSaveBtn'>
                    Delete
                </Button>
                <Button onClick={() => this.props.callback()}
                  variant="contained" className='col-sm-1 m-2' id='closeBtn'>
                    Cancel
                </Button>
              </div>
            </div>
            <div>
              Future: format table information
            </div>
          </div>
        </div>
      </div>
    );
  }
}
