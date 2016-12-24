import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import { prepareImages } from './images';
import { GameStoreMutator } from './gameStore';

import 'normalize.css';
import './main.css';


prepareImages();
GameStoreMutator.init();
ReactDOM.render(<App />,document.getElementById('root'));
