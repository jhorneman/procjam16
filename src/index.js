import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import { loadImages } from './images';
import { GameStoreMutator } from './gameStore';

import 'normalize.css';
import './main.css';


loadImages().then(function() {
    GameStoreMutator.init();
    ReactDOM.render(
      <App />,
      document.getElementById('root')
    );
});
