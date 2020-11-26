/* Information on the software
*/
import React, { Component } from 'react';      // eslint-disable-line no-unused-vars

export default class ConfigPage extends Component {
  constructor() {
    super();
    this.state = {
      credentials:{
        user: '',
        password: '',
        url: '',
        database: ''
      },
      pwdBoxType: 'password',
      eyeType: 'fa fa-eye'
    };
    this.submit = this.submit.bind(this);
    this.handleInputChangeUSR = this.handleInputChangeUSR.bind(this);
    this.handleInputChangePW = this.handleInputChangePW.bind(this);
    this.handleInputChangeURL = this.handleInputChangeURL.bind(this);
    this.handleInputChangeDB = this.handleInputChangeDB.bind(this);
    this.toggle = this.toggle.bind(this);
  }

  handleInputChangeUSR(event) {
    this.setState({
      credentials: {
        user: event.target.value,
        password: this.state.credentials.password,
        url: this.state.credentials.url,
        database: this.state.credentials.database
      }
    });
  }
  handleInputChangePW(event) {
    this.setState({
      credentials: {
        user: this.state.credentials.user,
        password: event.target.value,
        url: this.state.credentials.url,
        database: this.state.credentials.database
      }
    });
  }
  handleInputChangeURL(event) {
    this.setState({
      credentials: {
        user: this.state.credentials.user,
        password: this.state.credentials.password,
        url: event.target.value,
        database: this.state.credentials.database
      }
    });
  }
  handleInputChangeDB(event) {
    this.setState({
      credentials: {
        user: this.state.credentials.user,
        password: this.state.credentials.password,
        url: this.state.credentials.url,
        database: event.target.value
      }
    });
  }

  toggle() {
    if(this.state.pwdBoxType==='password'){
      this.setState({
        pwdBoxType: 'text',
        eyeType: 'fa fa-eye-slash'
      });
    } else if(this.state.pwdBoxType==='text'){
      this.setState({
        pwdBoxType: 'password',
        eyeType: 'fa fa-eye'
      });
    }
  }

  submit(){
    try {
      //try successful, use string; json-object can be ignored
      localStorage.setItem('credentials',JSON.stringify(this.state.credentials));
    }
    finally{
      console.log('credentials submitted');
    }
  }

  render(){
    return (
      <div className='container-fluid px-0 pt-1'>
        <div className='row px-0'>
          <div  className='col-sm-5 mx-5'>  {/* nested div required to enforce  col-sm-8 */}
            {this.about()}
          </div>
          <div className='col-sm-5 mx-5'>
            {this.config()}
          </div>
        </div>
      </div>
    );
  }

  config() {
    //TODO Thomas, brauchen wir das loading of the stylesheet. In DocTable ist Beispiel gegeben wie wir fontAwesome und wechsel des Status machen können
    //   kannst Du bitte auch das System verwenden?
    return(<div>
      <link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.13.0/css/all.min.css'/>
      <h3>Login</h3>
      <form>
        <label> Credentials: </label><br/>
        <input type='text' placeholder='Username' value={this.state.credentials.user} onChange={this.handleInputChangeUSR}/><br/>
        <input type={this.state.pwdBoxType} placeholder='Password' value={this.state.credentials.password} onChange={this.handleInputChangePW} id='pwdBox'/>
        <button type='button' id='toggleButton' onClick={this.toggle}>
          <i className={this.state.eyeType}></i>
        </button><br/>
        <input type='text' placeholder='database' value={this.state.credentials.database} onChange={this.handleInputChangeDB}/><br/>
        <input type='text' placeholder='127.0.0.1' value={this.state.credentials.url} onChange={this.handleInputChangeURL}/><br/>
        <input type='submit' value='login' onClick={this.submit}/>
      </form>
    </div>);
  }


  about() {
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
    );
  }
}
