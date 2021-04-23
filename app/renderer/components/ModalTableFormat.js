import React, { Component } from 'react';                         // eslint-disable-line no-unused-vars
import { Button} from '@material-ui/core';// eslint-disable-line no-unused-vars
import { modal, modalContent, btn } from '../style';

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
      <div className="modal" style={Object.assign({display: this.props.display},modal)}>
        <div className="modal-content" style={modalContent}>
          <div  className="col border rounded p-1 p-1">
            {/*=======PAGE HEADING=======*/}
            <div className="col">
              <h1 className='col-sm-7 p-3'>Edit table columns</h1>
              <div className="row">
                <Button onClick={() => this.pressedSaveBtn()}
                  variant="contained" disabled={this.state.disableSubmit}
                  className='col-sm-1 m-2' id='confSaveBtn' style={btn}>
                    Save
                </Button>
                <Button onClick={() => this.pressedDeleteBtn()}
                  variant="contained" disabled={this.state.disableSubmit}
                  className='col-sm-1 m-2' id='confSaveBtn' style={btn}>
                    Delete
                </Button>
                <Button onClick={() => this.props.callback()}
                  variant="contained" className='col-sm-1 m-2' id='closeBtn' style={btn}>
                    Cancel
                </Button>
              </div>
            </div>
            <div>
              <h1 className='m-5'>Implement in the future !</h1>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
