import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import outputs from '../amplify_outputs.json';
import App from './App';
import './index.css';


Amplify.configure(outputs);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Authenticator>
        {({ signOut, user }) => <App signOut={signOut} user={user} />}
      </Authenticator>
    </BrowserRouter>
  </React.StrictMode>
);