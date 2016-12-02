import React, { Component } from 'react';
import { GameStore } from '../gameStore';


function getState() {
    return {
        statNames: GameStore.allStatNames(),
        stats: GameStore.stats(),
    };
}


class DebugStatsView extends Component {
    constructor(props) {
        super(props);
        this.state = getState();
        this._onChange = this._onChange.bind(this);
    }

    _onChange() {
        this.setState(getState());
    }

    componentDidMount() {
        GameStore.addChangeListener(this._onChange);
    }

    componentWillUnmount() {
        GameStore.removeChangeListener(this._onChange);
    }

    render() {
        const tagViews = this.state.statNames.map((statName, index) => {
            return <li key={index}>{statName}: {this.state.stats[statName]}</li>;
        });

        return (<div className='debug debugStatsView'>
            <h3>Player stats:</h3>
            <ul>
                {tagViews}
            </ul>
        </div>);
    }
}


export default DebugStatsView;
