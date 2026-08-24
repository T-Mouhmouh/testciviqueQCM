import ReactDOM from 'react-dom/client';
import App from './App';
import WebHome from './WebHome';
import './styles.css';

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Ignore registration failures so the app still works as a standard web app.
    });
  });
}

const isNativeRuntime =
  window.location.protocol === 'capacitor:' ||
  Boolean((window as Window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.());
const isAppPage = window.location.pathname.endsWith('/app.html');

ReactDOM.createRoot(document.getElementById('app')!).render(
  isNativeRuntime || isAppPage ? <App /> : <WebHome />,
);
