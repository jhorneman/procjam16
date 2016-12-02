import React, { Component } from 'react';
import { GameStore } from '../gameStore';
import QuestView from './QuestView';
import StatsView from './StatsView';
import WarningList from './WarningList';
import { setupBackground, drawBackground } from '../images';


function getState() {
    return {
        gameState: GameStore.state(),
        errorMessage: GameStore.errorMessage(),
    };
}


class GameView extends Component {
    constructor(props) {
        super(props);
        this.state = getState();
        this._onChange = this._onChange.bind(this);
    }

    _onChange() {
        this.setState(getState());
    }

    componentDidMount() {
        setupBackground();
        drawBackground();
        GameStore.addChangeListener(this._onChange);
    }

    componentWillUnmount() {
        GameStore.removeChangeListener(this._onChange);
    }

    render() {
        let contents = null;

        switch (this.state.gameState) {
        case 'uninitialized': {
            contents = (<p>...</p>);
            break;
        }
        case 'loading': {
            contents = (<p>Loading...</p>);
            break;
        }
        case 'playing': {
            contents = [
                <StatsView key='stats' />,
                <QuestView key='quest' />
            ];
            break;
        }
        case 'error': {
            contents = [
                <p key='message'>Error: {this.state.errorMessage}.</p>,
                <WarningList key='warnings' />
            ];
            break;
        }
        default: {
            contents = (<p>Unknown game state '{this.state.gameState}'.</p>);
            break;
        }
        }

        return (<div id='gameView'>
            <div id='background' />
            <div id='game'>{contents}</div>
        </div>);
    }
}


export default GameView;
