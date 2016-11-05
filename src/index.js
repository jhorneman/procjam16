import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import { QuestStoreMutator } from './questStore';
import './index.css';

QuestStoreMutator.init();

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
