/* Information on the software
*/
import React, { Component } from 'react'

export default class AboutPage extends Component {
  constructor() {
    super();
    this.state = {
      credentials: ""
    }
    this.submit = this.submit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleInputChange(event) {
    this.setState({
      credentials: event.target.value
    });
  }
  submit(){
    try {
      //try successful, use string; json-object can be ignored
      localStorage.setItem('credentials',this.state.credentials);
    }
    finally{;}
  }

  render(){
    return (
      <div className="container-fluid px-0 pt-1">
      <div className="row px-0">
        <div  className="col-sm-5 mx-5">  {/* nested div required to enforce  col-sm-8 */}
          {this.about()}
        </div>
        <div className="col-sm-5 mx-5">
        {this.config()}
        </div>
      </div>
    </div>
    )
  }

  config = function (){
    return(<div>
      <h3>Configuration</h3>
      <form>
        <label> Credentials: </label><br/>
        <textarea rows="6" cols="50" value={this.state.credentials} onChange={this.handleInputChange}/><br/>
        <input type="submit" value="Submit" onClick={this.submit}/>
      </form>
    </div>)
  };


  about = function (){
    return(
      <div>
        <h3>About jamDB</h3>
        <h5>Towards a database for experimental materials science </h5>
        <p>
        According to wikipedia "jam" refers to "a type of fruit preserve" or "improvise music". In both cases different content flows together to generate something new and improved. In "improvised music" the performers are agile and adoptive.
        </p>

        <h5>Goal of software</h5>
        <ul>
        <li>Data has two origins:
          <ul>
            <li> local directory structure where data can be dumped into (freedom to research) </li>
            <li> links to stored data in data-base </li>
          </ul>
          </li>
        <li>follow scum, agile software structure, which is used in IT-projects</li>
        <li>hierarchical structure for projects (project, sprint, task)</li>
        <li>since local folders and projects are structured
          <ul>
            <li>programs can efficiently process it</li>
            <li>other people/supervisor can collaborate</li>
            <li>do not only exchange pptx presentations but data, meta-data and information</li>
          </ul>
          </li>
        </ul>
      </div>
    )
  };
}
