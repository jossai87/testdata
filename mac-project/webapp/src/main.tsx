import { Buffer } from 'buffer';
import process from 'process';
window.Buffer = Buffer;
window.process = process;
import React from 'react'
import ReactDOM from 'react-dom/client'
import '@aws-amplify/ui-react/styles.css';
import "@cloudscape-design/global-styles/index.css";
import 'react-toastify/dist/ReactToastify.css';
import App from './App.tsx'
import { Authenticator } from "@aws-amplify/ui-react";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Authenticator.Provider>
      <App />
    </Authenticator.Provider>
  </React.StrictMode>,
)
