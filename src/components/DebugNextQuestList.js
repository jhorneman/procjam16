import React, { Component } from 'react';
import { GameStore } from '../gameStore';


function getState() {
    return {
        nextQuests: GameStore.possibleNextQuests(),
    };
}


class DebugNextQuestList extends Component {
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
        const questViews = this.state.nextQuests.map((quest, index) => {
            return <li key={index}>{quest.QuestName}</li>;
        });

        return (
            <div className='debug debugNextQuestList'>
                <h3>Possible next quests:</h3>
                <ul>{questViews}</ul>
            </div>
        );
    }
}


export default DebugNextQuestList;
