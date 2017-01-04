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
        let footerButtons = null;

        switch (this.state.uiState) {
        case 'game': {
            mainView = <GameView showDebugUI={this.state.showDebugUI} />;
            footerButtons = [
                <ClickableLink onClick={this._onRestartGameClicked} key='restart'>Restart the game</ClickableLink>,
                <ClickableLink onClick={this._onShowAboutViewClicked} key='about'>About this game</ClickableLink>,
            ];
            if (this.state.inDevMode) {
                rightSidebarView = this.state.showDebugUI ? (<Sidebar />) : null;
                debugButtons = [
                    <li><ClickableLink onClick={this._onToggleSidebarClicked} key='view'>Toggle debug UI</ClickableLink></li>,
                    <li><ClickableLink onClick={this._onViewQuestsClicked} key='quests'>View all quests</ClickableLink></li>,
                    <li><ClickableLink onClick={this._onDownloadDataClicked} key='download'>Download game data</ClickableLink></li>,
                    <li><ClickableLink onClick={this._onClearLSClicked} key='clearls'>Clear local storage</ClickableLink></li>,
                ];
            }
            break;
        }
        case 'about': {
            mainView = <AboutView />;
            footerButtons = (
                <ClickableLink onClick={this._onBackToGameClicked}>Back to the game</ClickableLink>
            );
            break;
        }
        case 'quests': {
            debugButtons = (<ClickableLink onClick={this._onBackToGameClicked} key='quests'>Back to the game</ClickableLink>);
            mainView = <DebugQuestList />;
            break;            
        }
        default: {
            mainView = (<p>Unknown UI state '{this.state.uiState}'.</p>);
            break;
        }
        }

        if (this.state.inDevMode) {
            leftSidebarView = <div className='debug'>
                <h3>Debug functions</h3>
                <ul>{debugButtons}</ul>
            </div>;
        }

        // const footer = (<footer>
        //     <div className='buttonBar'>
        //         {footerButtons}
        //     </div>
        //     <p className='copyright'>&copy; 2017 Liz England, Jurie Horneman &amp; Stefan Srb</p>
        // </footer>);

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
