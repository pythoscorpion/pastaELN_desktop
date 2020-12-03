/* Component that houses the table(left side) and details(right side)
*/
import React, { Component } from 'react';      // eslint-disable-line no-unused-vars
import dispatcher from '../Dispatcher';
import Project from './Project';               // eslint-disable-line no-unused-vars
import DocTable from './DocTable';             // eslint-disable-line no-unused-vars
import DocNew from './DocNew';                 // eslint-disable-line no-unused-vars
import Store from '../Store';                  // eslint-disable-line no-unused-vars

export default class ProjectComponent extends Component {
  constructor() {
    super();
    this.toggleTable = this.toggleTable.bind(this);
    this.state = {
      show: 'table'
    };
    var dispatcherToken;                      // eslint-disable-line no-unused-vars
  }
  componentDidMount() {
    this.dispatcherToken = dispatcher.register(this.handleActions.bind(this));
    Store.on('changeDoc',   this.toggleTable);
    Store.initStore('Projects');
    this.setState({show: 'table'});
  }
  componentWillUnmount() {
    dispatcher.unregister(this.dispatcherToken);
    Store.removeListener('changeDoc',   this.toggleTable);
  }
  handleActions(action) {
    if (action.type==='RESTART_DOC_TYPE'){
      this.setState({show: 'table'});
    }
    if (action.type==='TOGGLE_RIGHT_PANE'){
      if (action.pane==='new') {
        this.setState({show: 'new'});
      }
    }
  }

  //get state (show details, edit details, new entry)
  toggleTable(){
    this.setState({show: 'tree'});
  }

  showProject() {
    if (this.state.show==='table') {
      return <DocTable docType='Projects' />;
    } else if(this.state.show==='tree'){
      return <Project/>;
    } else if(this.state.show==='new'){
      return <DocNew docType='Projects'/>;
    } else {
      return <div>I DID NOT UNDERSTAND YOU</div>;
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

