/* MAIN Component of React-Framework
   Routes for different pages are defined here
*/
import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

export default class App extends Component {
  constructor(){
    super();
    this.state = {
      targets: ["One","Two","Three"]
    }
  }
  
  render() {
    const routeItems = this.state.targets.map(
      (item,idx)=>  <Route exact path={'/'+item} render={props => (
                      <React.Fragment> <DocComponent docType={item} /> </React.Fragment>
                    )} key={idx}/>
    )
    return (
      <Router>
        <div className="App">
          <div className="container-fluid">
            <h1>Test</h1>
            {routeItems}
          </div>
        </div>
      </Router>
    );
  }
}
