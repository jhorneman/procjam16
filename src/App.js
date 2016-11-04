import React, { Component } from 'react';
// import './App.css';
import QuestDebugView from './QuestDebugView';
import { QuestStore, QuestStoreMutator } from './questStore';


class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            quests: [],
        };
        this.onChange = this.onChange.bind(this);
    }

    onChange() {
        this.setState({
            quests: QuestStore.all(),
        });
    }

    componentDidMount() {
        QuestStore.addChangeListener(this.onChange);
        QuestStoreMutator.init();
    }

    componentWillUnmount() {
        QuestStore.removeChangeListener(this.onChange);
    }

    render() {
        const questDebugViews = this.state.quests.map((quest, index) =>
            <QuestDebugView quest={quest} key={index}/>
        );
        return (
            <div>
                {questDebugViews}
            </div>
        );
    }
}


export default App;
