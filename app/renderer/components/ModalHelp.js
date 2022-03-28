/* eslint max-len: 0 */
/* Modal that shows help information for changing the ontology */
import React, { Component } from 'react';                         // eslint-disable-line no-unused-vars
import { Button} from '@material-ui/core';                        // eslint-disable-line no-unused-vars
import dispatcher from '../Dispatcher';
import { modal, modalContent, btnStrong, flowText, h1 } from '../style';
import { ontologyHelp } from './longStrings';

export default class ModalHelp extends Component {
  constructor() {
    super();
    this.state = {
      //modal items
      dispatcherToken: null,
      show: 'none',
      help: null,
    };
  }
  //component mounted immediately, even if Modal not shown
  componentDidMount() {
    this.setState({dispatcherToken: dispatcher.register(this.handleActions)});
  }
  componentWillUnmount() {
    dispatcher.unregister(this.state.dispatcherToken);
  }


  /** Functions as class properties (immediately bound): react on user interactions **/
  cancel = () => {
    this.setState({show:'none'});
  }

  handleActions=(action)=>{     //Modal show; first function
    if (action.type==='SHOW_HELP') {
      this.setState({show:'block', help:action.help});
    }
  }

  /** the render method **/
  render(){
    return (
      <div className="modal" style={{...modal, display:this.state.show }}>
        <div className="modal-content" style={modalContent}>
          <div className="col p-0">
            <div className="px-3 py-4" style={{...h1, ...btnStrong}}>
              Help | Ontology and Questionare Structure
            </div>
            <div className='p-3' style={flowText}>
              {ontologyHelp()}
            </div>
            <Button onClick={()=>this.setState({show:'none'})}
              variant="contained" className='float-right m-3' id='closeBtn' style={btnStrong}>
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

}