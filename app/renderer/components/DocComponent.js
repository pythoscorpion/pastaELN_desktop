/* Component that houses the table(right side) and details(left side)
*/
import React, { Component } from 'react'

export default class DocComponent extends Component {
  constructor() {
    super();
    this.getState = this.getState.bind(this);
    this.state = {
      rightSideState: 0,
      docType: null
    }
  }
  componentDidMount() {
    Store.on("toggleState", this.getState);
    this.setState({docType: this.props.docType});
  }
  componentWillUnmount() {
    Store.removeListener("toggleState", this.getState);
  }


  //get information from store
  getState() {
    this.setState({rightSideState: Store.getState()});
  }


  //the render method
  render() {
    return (
      <div className="container-fluid px-0 pt-1">
        <div className="row px-0"> 
          <div  className="col-sm-8 px-0">  {/* nested div required to enforce  col-sm-8 */}
            <h1>Title</h1>
          </div>
          <div className="col-sm-4 pl-0">
           <h1>Right side</h1>
          </div>
        </div>
      </div>
    )
  }
}
