import { createRoot } from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <Auth0Provider
    domain="dev-2apkktmjitillc05.us.auth0.com"
    clientId="1d7KEc71I9mQaEKydfOtVi454L3cjkuB"
    authorizationParams={{
      audience: "https://curso-api",
      redirect_uri: window.location.origin, // volta para /
    }}
    cacheLocation="localstorage"   // <— importante para evitar loop
    useRefreshTokens               // <— importante para evitar loop
  >
    <App />
  </Auth0Provider>
);