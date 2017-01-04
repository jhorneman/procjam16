import React, { Component } from 'react';
import { GameStore, GameStoreMutator } from '../gameStore';
import ClickableLink from './ClickableLink';
import QuestView from './QuestView';
import StatsView from './StatsView';
import WarningList from './WarningList';
import DebugNextQuestList from './DebugNextQuestList';
import Footer from './Footer';
import { createCanvases, drawBackground } from '../images';


function getState() {
    return {
        gameState: GameStore.state(),
        errorMessage: GameStore.errorMessage(),
        style: GameStore.currentStyle()
    };
}


class GameView extends Component {
    constructor(props) {
        super(props);
        this.state = getState();
        this._onChange = this._onChange.bind(this);
        this._onRestartGameClicked = this._onRestartGameClicked.bind(this);
        this._setBackgroundRef = this._setBackgroundRef.bind(this);
    }

    _onChange() {
        this.setState(getState());
    }

    _onRestartGameClicked() {
        GameStoreMutator.restartGame();
    }

    _setBackgroundRef(backgroundEl) {
        if (backgroundEl !== null) {
            this.canvases = createCanvases();
            backgroundEl.appendChild(this.canvases.bgCanvas);
        }
    }

    componentDidMount() {
        drawBackground(this.canvases, this.state.style);
        GameStore.addChangeListener(this._onChange);
    }

    componentWillUnmount() {
        GameStore.removeChangeListener(this._onChange);
    }

    componentDidUpdate(prevProps, prevState) {
        // Redraw background if style changed.
        if (prevState.style !== this.state.style) {
            drawBackground(this.canvases, this.state.style);
        }
    }

    render() {
        let contents = null;

        switch (this.state.gameState) {
        case 'uninitialized': {
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
            if (this.props.showDebugUI) {
                contents.push(<DebugNextQuestList key='nextQuests' />);
            }
            contents.push(<Footer key='footer'>
                <ClickableLink onClick={this._onRestartGameClicked} key='restart'>Restart the game</ClickableLink>
                <ClickableLink onClick={this.props.onShowAboutViewClicked} key='about'>About this game</ClickableLink>
            </Footer>);
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

        return (<div>
            <div id='background' key='background' ref={this._setBackgroundRef} />
            <div id='game' key='game'>{contents}</div>
        </div>);
    }
}


GameView.propTypes = {
    showDebugUI: React.PropTypes.bool,
    onShowAboutViewClicked: React.PropTypes.func.isRequired
};


GameView.defaultProps = {
    showDebugUI: false
};


export default GameView;
