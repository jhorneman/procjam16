import React, { Component } from 'react';
import './App.css';


function loadQuests() {
    // fetch('/data/JungleQuests.xlsx')
    // .then(function(response) {
    //     return response.arrayBuffer();
    // }).then(function(arrayBuffer) {
    //     parseQuests(arrayBuffer);
    // });
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
