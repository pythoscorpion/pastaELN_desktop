/* Component that houses the table(left side) and details(right side)
*/
import React, { Component } from 'react';      // eslint-disable-line no-unused-vars
import DocTable from './DocTable';             // eslint-disable-line no-unused-vars
import DocDetail from './DocDetail';           // eslint-disable-line no-unused-vars
import DocEdit from './DocEdit';               // eslint-disable-line no-unused-vars
import DocNew from './DocNew';                 // eslint-disable-line no-unused-vars
import Store from '../Store';                  // eslint-disable-line no-unused-vars
import dispatcher from '../Dispatcher';

export default class DocComponent extends Component {
  constructor() {
    super();
    this.state = {
      rightPane: 'detail',
      dispatchID: null,
      docType: null
    };
  }
  componentDidMount() {
    this.setState({docType: this.props.docType});
    const dispatchID = dispatcher.register(this.handleActions.bind(this));
    this.setState({dispatchID: dispatchID});
    Store.initStore(this.props.docType);
  }
  componentWillUnmount(){
    dispatcher.unregister(this.state.dispatchID);
  }

  handleActions(action) {
    switch(action.type) {
    case 'TOGGLE_RIGHT_PANE': {
      this.setState({rightPane:action.pane});
      break;
    }
    }
  }

  //the render method
  render() {
    var rightSide = <DocDetail docType={this.props.docType}/>; //default
    if (this.state.rightPane==='edit') {
      rightSide = <DocEdit docType={this.props.docType}/>;
    }
    if (this.state.rightPane==='new') {
      rightSide = <DocNew docType={this.props.docType}/>;
    }
    return (
      <div className='container-fluid px-0 pt-1'>
        <div className='row px-0'>
          <div  className='col-sm-6 px-0'>  {/* nested div required to enforce  col-sm-8 */}
            <DocTable docType={this.props.docType} />
          </div>
          <div className='col-sm-6 pl-0'>
            {rightSide}
          </div>
        </div>
      </div>
    );
  }
}

