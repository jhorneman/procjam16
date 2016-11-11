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
            debugViewIsOn: (process.env.NODE_ENV === 'development'),
            uiState: 'game',
        });

        this._onChange = this._onChange.bind(this);
        this._onRestartGameClicked = this._onRestartGameClicked.bind(this);
        this._onShowAboutViewClicked = this._onShowAboutViewClicked.bind(this);
        this._onBackToGameClicked = this._onBackToGameClicked.bind(this);
        this._onViewQuestsClicked = this._onViewQuestsClicked.bind(this);
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

    _onViewQuestsClicked() {
        this.setState({
            uiState: 'quests',
        });
    }

    render() {
        let debugBar = null;
        let debugButtons = null;
        let mainView = null;
        let sidebarView = null;
        let footerButtons = null;

        switch (this.state.uiState) {
        case 'game': {
            mainView = <GameView />;
            sidebarView = <Sidebar />;
            debugButtons = (<ClickableLink onClick={this._onViewQuestsClicked} key='quests'>View all quests</ClickableLink>);
            footerButtons = [
                <ClickableLink onClick={this._onRestartGameClicked} key='restart'>Restart the game</ClickableLink>,
                <ClickableLink onClick={this._onShowAboutViewClicked} key='about'>About this game</ClickableLink>,
            ];
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

        if (this.state.debugViewIsOn) {
            debugBar = <header>
                Debug Menu
                {debugButtons}
            </header>;
        }

        return (<div className='flex-container page'>
            {debugBar}
            <div className='flex-container content'>
                <div className='sidebar' />
                <div className='flex-container main'>
                    {mainView}
                </div>
                <div className='sidebar'>
                    {sidebarView}
                </div>
            </div>
            <footer>
                <div className='buttonBar'>
                    {footerButtons}
                </div>
                <p className='copyright'>&copy; 2016 Liz England &amp; Jurie Horneman</p>
            </footer>
        </div>);
    }
}


export default App;
