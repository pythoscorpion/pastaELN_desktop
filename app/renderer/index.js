/* Main js-entry point that is called first before all react-components
*/
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

ReactDOM.render(
  <App />,
  document.querySelector(document.currentScript.getAttribute('data-container'))
);
