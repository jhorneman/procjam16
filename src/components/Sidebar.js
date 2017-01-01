import React, { Component } from 'react';
import { GameStore } from '../gameStore';
import DebugQuestView from './DebugQuestView';
import DebugTagsView from './DebugTagsView';
import DebugStatsView from './DebugStatsView';
import DebugTypeCooldownView from './DebugTypeCooldownView';
import WarningList from './WarningList';


function getState() {
    return {
        gameState: GameStore.state(),
    };
}


class Sidebar extends Component {
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
        if (this.state.gameState !== 'playing') return null;

        return (<div>
            <DebugQuestView key='quest' />
            <DebugTagsView key='tags' />
            <DebugStatsView key='stats' />
            <DebugTypeCooldownView key='typeCooldowns' />
            <WarningList key='warnings' />
        </div>);
    }
}


export default Sidebar;
