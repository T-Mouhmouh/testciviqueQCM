import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Ignore registration failures so the app still works as a standard web app.
    });
  });
}

ReactDOM.createRoot(document.getElementById('app')!).render(<App />);
