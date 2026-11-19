import { AppRegistry } from 'react-native';
import { registerSW } from 'virtual:pwa-register';
import App from './App.jsx';
import './index.css';

registerSW({ immediate: true });

AppRegistry.registerComponent('DueLedger', () => App);
AppRegistry.runApplication('DueLedger', {
  rootTag: document.getElementById('root'),
});
