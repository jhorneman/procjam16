import React, { Component } from 'react';
import { GameStore } from '../gameStore';
import QuestView from './QuestView';


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
            quests: GameStore.quests(),
            loadWarnings: GameStore.loadWarnings(),
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
        ) : (
            <QuestView quest={this.state.quests[0]} />
        );
        return (<div className='app'>
            {view}
        </div>);
    }
}


export default App;
