import React, { Component } from 'react';
import { GameStore } from '../gameStore';
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
        let view;
        switch (this.state.state) {
        case 'uninitialized': {
            view = (<p>...</p>);
            break;
        }
        case 'loading': {
            view = (<p>Loading...</p>);
            break;
        }
        case 'playing': {
            view = <div>
                <StatsView statNames={this.state.statNames} stats={this.state.stats} />
                <TagsView tags={this.state.tags} />
                <QuestView />
            </div>;
            break;
        }
        case 'error': {
            view = (<div>
                <p>Error: {this.state.errorMessage}.</p>
                <WarningList warnings={this.state.warnings} />
            </div>);
            break;
        }
        default: {
            view = (<p>Unknown state '{this.state.state}'.</p>);
            break;
        }
        }

        return (<div className='app'>
            {view}
        </div>);
    }
}


export default App;
