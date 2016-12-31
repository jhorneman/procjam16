import React, { Component } from 'react';
import { GameStore } from '../gameStore';


function getState() {
    return {
        currentQuest: GameStore.currentQuest()
    };
}


class DebugQuestView extends Component {
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
        return (<div className='debug debugQuestView'>
            <h3>Current quest:</h3>
            <p>{this.state.currentQuest.QuestName} ({this.state.currentQuest.SheetName})</p>
        </div>);
    }
}


export default DebugQuestView;
