/* Component that houses the table OR the tree view of project
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
      showTable: true
    };
    var dispatcherToken;                      // eslint-disable-line no-unused-vars
  }
  componentDidMount() {
    this.dispatcherToken = dispatcher.register(this.handleActions.bind(this));
    Store.on('changeDoc',   this.toggleTable);
    Store.initStore('Projects');
    this.setState({showTable: true});
  }
  componentWillUnmount() {
    dispatcher.unregister(this.dispatcherToken);
    Store.removeListener('changeDoc',   this.toggleTable);
  }

  handleActions(action) {
    if (action.type==='RESTART_DOC_TYPE'){
      this.setState({showTable: true});
    }
  }

  toggleTable(){
    this.setState({showTable: false});
  }

  showProject() {
    if (this.state.showTable) {
      return <DocTable docLabel='Projects' />;
    } else {
      return <Project/>;
    }
  }

  //the render method
  render() {
    return (
      <div className='container px-2 pt-1'>
        <div className='row px-0'>
          {this.showProject()}
        </div>
      </div>
    );
  }
}
