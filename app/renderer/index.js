/* Main js-entry point that is called first before all react-components
   - parent of App.js
*/
import React from 'react';      // eslint-disable-line no-unused-vars
import ReactDOM from 'react-dom';
import App from './App';        // eslint-disable-line no-unused-vars
import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';

Sentry.init({
  dsn: 'https://ee54c374742d42df80d457c66c290ddf@o597727.ingest.sentry.io/5742864',
  integrations: [new Integrations.BrowserTracing()],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
  maxValueLength:  1024
});

ReactDOM.render(
  <App />,
  document.querySelector(document.currentScript.getAttribute('data-container'))
);
