/* MAIN Component of React-Framework
   Routes for different pages are defined here
*/
import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

export default class App extends Component {
  constructor(){
    super();
    this.state = {
      targets: ["One","Two","Three"]
    }
  }
  
  render() {
    const routeItems = this.state.targets.map(
      (item,idx)=>  <Route exact path={'/'+item} key={idx}>
                      <h2>Component docType={item}</h2>
                    </Route>
    )
    return (
      <Router>
        <h1>Header targets</h1>
        <Switch>
          {routeItems}
        </Switch>
      </Router>
    );
  }
}
