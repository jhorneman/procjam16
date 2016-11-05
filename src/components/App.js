import React, { Component } from 'react';
import { GameStore } from '../gameStore';
import QuestView from './QuestView';
import StatsView from './StatsView';


class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            quests: [],
        };
        this.onChange = this.onChange.bind(this);
    }

    onChange() {
        this.setState({
            isLoading: GameStore.isLoading(),
            statNames: GameStore.statNames(),
            stats: GameStore.stats(),
            currentQuest: GameStore.currentQuest(),
        });
    }

    componentDidMount() {
        GameStore.addChangeListener(this.onChange);
    }

    componentWillUnmount() {
        GameStore.removeChangeListener(this.onChange);
    }

    render() {
        const view = this.state.isLoading ? (
            <p>Loading...</p>
        ) : (<div>
            <StatsView statNames={this.state.statNames} stats={this.state.stats} />
            <QuestView quest={this.state.currentQuest} />
        </div>);
        return (<div className='app'>
            {view}
        </div>);
    }
}


export default App;
