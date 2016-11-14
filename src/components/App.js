import React, { Component } from 'react';
import { GameStore, GameStoreMutator } from '../gameStore';
import ClickableLink from './ClickableLink';
import GameView from './GameView';
import Sidebar from './Sidebar';
import AboutView from './AboutView';
import DebugQuestList from './DebugQuestList';
import { jitterHSV, HSVtoRGBstring } from '../colorUtils';


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
            showDebugSidebar: false,
            uiState: 'game',
        });

        this._onChange = this._onChange.bind(this);
        this._onRestartGameClicked = this._onRestartGameClicked.bind(this);
        this._onShowAboutViewClicked = this._onShowAboutViewClicked.bind(this);
        this._onBackToGameClicked = this._onBackToGameClicked.bind(this);
        this._onToggleSidebarClicked = this._onToggleSidebarClicked.bind(this);
        this._onViewQuestsClicked = this._onViewQuestsClicked.bind(this);
    }

    _onChange() {
        this.setState(getState());
    }

    componentDidMount() {
        const canvasWidth = 600;
        const canvasHeight = 600;

        var canvas = document.createElement('canvas');
        var c = canvas.getContext('2d');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const backgroundElement = document.getElementById('background');
        backgroundElement.appendChild(canvas);

        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;

        const gradientCenterX = centerX + (Math.random() * 50) - 25;
        const gradientCenterY = centerY + (Math.random() * 50) - 25;

        const radialGradient = c.createRadialGradient(gradientCenterX, gradientCenterY, 20, gradientCenterX, gradientCenterY, centerX);

        radialGradient.addColorStop(0, HSVtoRGBstring(jitterHSV([87, 20, 96], 50)));
        radialGradient.addColorStop(1, HSVtoRGBstring(jitterHSV([136, 44, 100], 50)));

        c.save();
 
        c.beginPath();
        c.arc(centerX, centerY, centerX, 0, Math.PI * 2, false);
 
        c.clip();
 
        c.fillStyle = radialGradient;
        c.fillRect(0, 0, canvasWidth, canvasHeight);

        c.restore();

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
            showDebugSidebar: !this.state.showDebugSidebar,
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
            footerButtons = [
                <ClickableLink onClick={this._onRestartGameClicked} key='restart'>Restart the game</ClickableLink>,
                <ClickableLink onClick={this._onShowAboutViewClicked} key='about'>About this game</ClickableLink>,
            ];
            if (this.state.inDevMode) {
                sidebarView = this.state.showDebugSidebar ? (<Sidebar />) : null;
                debugButtons = [
                    <ClickableLink onClick={this._onToggleSidebarClicked} key='view'>Toggle sidebar</ClickableLink>,
                    <ClickableLink onClick={this._onViewQuestsClicked} key='quests'>View all quests</ClickableLink>,
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
