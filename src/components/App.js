import React, { Component } from 'react';
import { GameStore, GameStoreMutator } from '../gameStore';
import ClickableLink from './ClickableLink';
import GameView from './GameView';
import Sidebar from './Sidebar';
import AboutView from './AboutView';
import DebugQuestList from './DebugQuestList';


function getState() {
    return {
        gameState: GameStore.state(),
    };
}


class App extends Component {
    constructor(props) {
        super(props);

        this.state = Object.assign({}, getState(), {
            inDevMode: (process.env.NODE_ENV === 'development'),
            showDebugUI: false,
            uiState: 'game',
        });

        this._onChange = this._onChange.bind(this);
        this._onRestartGameClicked = this._onRestartGameClicked.bind(this);
        this._onShowAboutViewClicked = this._onShowAboutViewClicked.bind(this);
        this._onBackToGameClicked = this._onBackToGameClicked.bind(this);
        this._onToggleSidebarClicked = this._onToggleSidebarClicked.bind(this);
        this._onViewQuestsClicked = this._onViewQuestsClicked.bind(this);
        this._onDownloadDataClicked = this._onDownloadDataClicked.bind(this);
        this._onClearLSClicked = this._onClearLSClicked.bind(this);
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

    _onRestartGameClicked() {
        GameStoreMutator.restartGame();
    }

    _onShowAboutViewClicked() {
        this.setState({
            uiState: 'about',
        });
    }

    _onBackToGameClicked() {
        this.setState({
            uiState: 'game',
        });
    }

    _onToggleSidebarClicked() {
        this.setState({
            showDebugUI: !this.state.showDebugUI,
        });
    }

    _onViewQuestsClicked() {
        this.setState({
            uiState: 'quests',
        });
    }

    _onDownloadDataClicked() {
        GameStore.downloadGameDataAsJSON();
    }

    _onClearLSClicked() {
        GameStore.clearLocalStorage();
    }

    render() {
        let mainView = null;
        let leftSidebarView = null;
        let rightSidebarView = null;
        let debugButtons = null;

        switch (this.state.uiState) {
        case 'game': {
            mainView = <GameView showDebugUI={this.state.showDebugUI} onShowAboutViewClicked={this._onShowAboutViewClicked} />;
            if (this.state.inDevMode) {
                rightSidebarView = this.state.showDebugUI ? (<Sidebar />) : null;
                debugButtons = [
                    <ClickableLink onClick={this._onToggleSidebarClicked}>Toggle debug UI</ClickableLink>,
                    <ClickableLink onClick={this._onViewQuestsClicked}>View all quests</ClickableLink>,
                    <ClickableLink onClick={this._onDownloadDataClicked}>Download game data</ClickableLink>,
                    <ClickableLink onClick={this._onClearLSClicked}>Clear local storage</ClickableLink>,
                ];
            }
            break;
        }
        case 'about': {
            mainView = <AboutView onBackToGameClicked={this._onBackToGameClicked} />;
            break;
        }
        case 'quests': {
            debugButtons = [<ClickableLink onClick={this._onBackToGameClicked}>Back to the game</ClickableLink>];
            mainView = <DebugQuestList />;
            break;            
        }
        default: {
            mainView = (<p>Unknown UI state '{this.state.uiState}'.</p>);
            break;
        }
        }

        if (this.state.inDevMode && debugButtons) {
            debugButtons = debugButtons.map((btn, index) => (<li key={index}>{btn}</li>));
            leftSidebarView = <div className='debug'>
                <h3>Debug functions</h3>
                <ul>{debugButtons}</ul>
            </div>;
        }

        return (<div className='flex-container content'>
            <div className='sidebar'>
                {leftSidebarView}
            </div>
            <div className='main'>
                {mainView}
            </div>
            <div className='sidebar'>
                {rightSidebarView}
            </div>
        </div>);
    }
}


export default App;
