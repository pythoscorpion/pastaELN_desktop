/* Component that houses the table(left side) and details(right side)
*/
import React, { Component } from 'react';      // eslint-disable-line no-unused-vars
import dispatcher from '../Dispatcher';
import Project from './Project';               // eslint-disable-line no-unused-vars
import DocTable from './DocTable';             // eslint-disable-line no-unused-vars
import Store from '../Store';                  // eslint-disable-line no-unused-vars

export default class ProjectComponent extends Component {
  constructor() {
    super();
    this.toggleTable = this.toggleTable.bind(this);
    this.state = {
      projectTable: true,
      docType: null
    };
    var dispatcherToken;                      // eslint-disable-line no-unused-vars
  }
  componentDidMount() {
    this.dispatcherToken = dispatcher.register(this.handleActions.bind(this));
    Store.on('changeDoc',   this.toggleTable);
    this.setState({docType: this.props.docType});
  }
  componentWillUnmount() {
    dispatcher.unregister(this.dispatcherToken);
    Store.removeListener('changeDoc',   this.toggleTable);
  }
  handleActions(action) {
    if (action.type==='RESTART_DOC_TYPE'){
      this.setState({projectTable: true});
    }
  }

  //get state (show details, edit details, new entry)
  toggleTable(){
    this.setState({projectTable: false});
  }

  showProject() {
    if (this.state.projectTable) {
      return <DocTable docType='Projects' />;
    } else {
      return <Project docType={this.props.docType}/>;
    }
  }

  //the render method
  render() {
    return (
      <div className='container-fluid px-0 pt-1'>
        <div className='row px-0'>
          {this.showProject()}
        </div>
      </div>
    );
  }
}

