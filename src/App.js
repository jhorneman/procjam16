import React, { Component } from 'react';
import Tabletop from 'tabletop';
import './App.css';


function loadDataFromGoogleSpreadsheet() {
    Tabletop.init({
        key: '1AHirIj1eUn8ofGamkkCgu2XWXweM4byqrcu9FAg-j48',
        callback: dataFromGoogleSpreadsheetHasLoaded,
        simpleSheet: true
    });
}

function dataFromGoogleSpreadsheetHasLoaded(data, tabletop) {
    console.log(data);
}

function loadQuests() {
    if (process.env.NODE_ENV === 'development') {
        loadDataFromGoogleSpreadsheet();        
    } else {
        // loadDataFromJSONFile();
    }
}


class App extends Component {
    componentDidMount() {
        loadQuests();
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
