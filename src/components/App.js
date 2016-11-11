import React, { Component } from 'react';
import { GameStore } from '../gameStore';
import ClickableLink from './ClickableLink';
import GameView from './GameView';
import Sidebar from './Sidebar';


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
        let debugHeader = this.state.debugViewIsOn ? (<header>
            Debug buttons!
        </header>) : null;

        return (<div className='flex-container page'>
            {debugHeader}
            <div className='flex-container content'>
                <div className='sidebar' />
                <div className='flex-container main'>
                    <GameView/>
                </div>
                <div className='sidebar'>
                    <Sidebar/>
                </div>
            </div>
            <footer>
                <ClickableLink onClick={() => {}}>About this game</ClickableLink>
                &copy; 2016 Liz England &amp; Jurie Horneman
            </footer>
        </div>);
    }
}


export default App;
