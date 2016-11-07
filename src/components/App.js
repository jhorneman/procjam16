import React, { Component } from 'react';
import { GameStore } from '../gameStore';
import ClickableLink from './ClickableLink';
import QuestView from './QuestView';
import StatsView from './StatsView';
import TagsView from './TagsView';
import WarningList from './WarningList';


function getState() {
    return {
        state: GameStore.state(),
        errorMessage: GameStore.errorMessage(),
        warnings: GameStore.warnings(),
        statNames: GameStore.allStatNames(),
        stats: GameStore.stats(),
        tags: GameStore.tags(),
    };
}


class App extends Component {
    constructor(props) {
        super(props);
        this.state = Object.assign({}, getState(), {
            debugViewIsOn: (process.env.NODE_ENV === 'development'),
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
        let sidebarContents = null;
        let mainContents = null;
        let debugHeader = this.state.debugViewIsOn ? (<header>
            Debug buttons!
        </header>) : null;

        switch (this.state.state) {
        case 'uninitialized': {
            mainContents = (<p>...</p>);
            break;
        }
        case 'loading': {
            mainContents = (<p>Loading...</p>);
            break;
        }
        case 'playing': {
            mainContents = [
                <StatsView statNames={this.state.statNames} stats={this.state.stats} />,
                <QuestView />
            ];
            sidebarContents = (<TagsView tags={this.state.tags} />);
            break;
        }
        case 'error': {
            mainContents = (<div>
                <p>Error: {this.state.errorMessage}.</p>
                <WarningList warnings={this.state.warnings} />
            </div>);
            break;
        }
        default: {
            mainContents = (<p>Unknown state '{this.state.state}'.</p>);
            break;
        }
        }

        return (<div className='flex-container page'>
            {debugHeader}
            <div className='flex-container content'>
                <div className='sidebar' />
                <div className='flex-container main'>
                    {mainContents}
                    <footer>
                        <ClickableLink onClick={undefined}>About this game</ClickableLink>
                        &copy; 2016 Liz England &amp; Jurie Horneman
                    </footer>
                </div>
                <div className='sidebar'>
                    {sidebarContents}
                </div>
            </div>
        </div>);
    }
}


export default App;
