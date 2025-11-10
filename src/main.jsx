import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Auth0Provider } from "@auth0/auth0-react";
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <Auth0Provider
    domain="dev-2apkktmjitillc05.us.auth0.com"
    clientId="1d7KEc71I9mQaEKydfOtVi454L3cjkuB"
    authorizationParams={{
      audience: "https://curso-api",
      redirect_uri: window.location.origin,
    }}
  >
    <App />
  </Auth0Provider>
);
