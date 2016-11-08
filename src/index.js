import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import { GameStoreMutator } from './gameStore';

import 'normalize.css';
import './main.css';


GameStoreMutator.init();

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
