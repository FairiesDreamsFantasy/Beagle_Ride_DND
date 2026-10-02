import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { IntegritySentinel } from './System/Security/index';

// Enforce 200^1000% Type-Safe Active Defense Sentinel State
IntegritySentinel.validateSystemState();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
