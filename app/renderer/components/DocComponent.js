/* Component that houses the table(left side) and details(right side)
*/
import React, { Component } from 'react';      // eslint-disable-line no-unused-vars
import DocTable from './DocTable';             // eslint-disable-line no-unused-vars
import DocDetail from './DocDetail';           // eslint-disable-line no-unused-vars
import DocEdit from './DocEdit';               // eslint-disable-line no-unused-vars
import DocNew from './DocNew';                 // eslint-disable-line no-unused-vars
import Store from '../Store';                  // eslint-disable-line no-unused-vars

export default class DocComponent extends Component {
  constructor() {
    super();
    this.getState = this.getState.bind(this);
    this.state = {
      rightSideState: 0,
      docType: null
    };
  }
  componentDidMount() {
    Store.on('toggleState', this.getState);
    this.setState({docType: this.props.docType});
  }
  componentWillUnmount() {
    Store.removeListener('toggleState', this.getState);
  }


  //get state (show details, edit details, new entry)
  getState() {
    this.setState({rightSideState: Store.getState()});
  }

  //the render method
  render() {
    var rightSide = <DocDetail docType={this.props.docType}/>; //default
    if (this.state.rightSideState===1) {
      rightSide = <DocEdit docType={this.props.docType}/>;
    }
    if (this.state.rightSideState===2) {
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
