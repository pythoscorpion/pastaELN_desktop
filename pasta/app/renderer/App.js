/* MAIN Component of React-Framework
   Routes for different pages are defined here
   Initiation of Store
*/
import React, { Component } from 'react';                                       // eslint-disable-line no-unused-vars
import { HashRouter as Router, Route, Switch } from 'react-router-dom';         // eslint-disable-line no-unused-vars
import { createTheme, ThemeProvider } from '@material-ui/core/styles';// eslint-disable-line no-unused-vars
import DocComponent from './components/DocComponent';                           // eslint-disable-line no-unused-vars
import ProjectComponent from './components/ProjectComponent';                   // eslint-disable-line no-unused-vars
import Header from './components/Header';                                       // eslint-disable-line no-unused-vars
import ConfigPage from './components/ConfigPage';                               // eslint-disable-line no-unused-vars
import Store from './Store';                                                    // eslint-disable-line no-unused-vars
import { pastaTheme, paper } from './style';

const theme = createTheme(pastaTheme);

export default class App extends Component {
  constructor(){
    super();
    this.state = {
      targets: []
    };
  }
  componentDidMount(){
    Store.on('initStore', this.getTargets);
    Store.initStore();

  }
  componentWillUnmount(){
    Store.removeListener('initStore', this.getTargets);
  }
  getTargets=()=>{
    //get database information (Measurement,Samples,...)
    this.setState({targets: Store.getDocTypeLabels() });
  }

  /**************************************
   * the render method
   **************************************/
  render() {
    const docTypes = Object.keys(this.state.targets);
    const routeItems = docTypes.map((item,idx)=>  {
      if (item=='x0') {
        return (
          <Route exact path={'/'+item} key={idx}>
            <ProjectComponent/>
          </Route>
        );
      } else {
        return (
          <Route exact path={'/'+item} key={idx}>
            <DocComponent docType={item}/>
          </Route>
        );
      }
    });
    return (
      <ThemeProvider theme={theme}>
        <div style={paper}>
          <Router>
            <Header targets={this.state.targets}/>
            <Switch>
              <Route exact path='/'>              <ProjectComponent /> </Route>
              <Route exact path='/Configuration'> <ConfigPage /> </Route>
              {routeItems}
            </Switch>
          </Router>
        </div>
      </ThemeProvider>
    );
  }
}
