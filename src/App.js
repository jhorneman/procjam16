import React, { Component } from 'react';
import './App.css';
import loadDataFromGoogleSpreadsheet from './loadData';


function loadData() {
    if (process.env.NODE_ENV === 'development') {
        // '1AHirIj1eUn8ofGamkkCgu2XWXweM4byqrcu9FAg-j48',     // Simple test doc
        let dataLoadPromise = loadDataFromGoogleSpreadsheet('1rDndDW7cebpGy9fnDZqvfcsLN1CB_pTb4n28W140O04');        // Copy of game doc
        dataLoadPromise.then(function(result) {
            console.log(result);
        });
    } else {
        // loadDataFromJSONFile();
    }
}


class App extends Component {
    componentDidMount() {
        loadData();
    }

    render() {
        return (
            <div className="App">
                <div className="App-header">
                    <h2>Procjam 16</h2>
                </div>
                <p className="App-intro">
                </p>
            </div>
        );
    }
}


export default App;
