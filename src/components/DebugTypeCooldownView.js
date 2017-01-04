import React, { Component } from 'react';
import { GameStore } from '../gameStore';


function getState() {
    return {
        typeCooldowns: GameStore.typeCooldowns()
    };
}


class DebugTypeCooldownView extends Component {
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
        const typeCooldownViews = Object.keys(this.state.typeCooldowns).map((type, index) => {
            return <li key={index}>{type} ({this.state.typeCooldowns[type]})</li>;
        });

        return (<div className='debug debugTypeCooldownView'>
            <h3>Quest types on cooldown:</h3>
            <ul>
                {typeCooldownViews}
            </ul>
        </div>);
    }
}


export default DebugTypeCooldownView;
