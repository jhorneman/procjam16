import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import { GameStoreMutator } from './gameStore';
import './index.css';

GameStoreMutator.init();

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
