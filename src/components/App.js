import React, { Component } from 'react';
import DebugQuestList from './DebugQuestList';
import { QuestStore } from '../questStore';


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
            isLoading: QuestStore.isLoading(),
            quests: QuestStore.all(),
        });
    }

    componentDidMount() {
        QuestStore.addChangeListener(this.onChange);
    }

    componentWillUnmount() {
        QuestStore.removeChangeListener(this.onChange);
    }

    render() {
        const view = this.state.isLoading ? (
            <p>Loading...</p>
        ) : (
            <DebugQuestList quests={this.state.quests} />
        );
        return view;
    }
}


export default App;
