/* Main js-entry point that is called first before all react-components
*/
import React from 'react';      // eslint-disable-line no-unused-vars
import ReactDOM from 'react-dom';
import App from './App';        // eslint-disable-line no-unused-vars

ReactDOM.render(
  <App />,
  document.querySelector(document.currentScript.getAttribute('data-container'))
);
