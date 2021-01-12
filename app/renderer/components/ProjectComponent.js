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
    this.state = {
      showTable: true,
      dispatcherToken: null
    };
  }
  componentDidMount() {
    Store.on('changeDoc',   this.toggleTable);
    this.setState({showTable: true,
                   dispatcherToken: dispatcher.register(this.handleActions)});
  }
  componentWillUnmount() {
    dispatcher.unregister(this.state.dispatcherToken);
    Store.removeListener('changeDoc',   this.toggleTable);
  }


  /* Functions are class properties: immediately bound */
  handleActions=(action)=>{
    if (action.type==='RESTART_DOC_TYPE'){
      this.setState({showTable: true});
    }
  }
  toggleTable=()=>{
    this.setState({showTable: false});
  }


  /* process data and create html-structure; all should return at least <div></div> */
  //the render method
  render() {
    return (
      <div className='container px-2 pt-1'>
        <div className='row px-0'>
          {this.state.showTable ? <DocTable docLabel='Projects' /> : <Project/>}
        </div>
      </div>
    );
  }
}
