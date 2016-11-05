import React, { Component } from 'react';
import { QuestStore } from '../questStore';
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
            isLoading: QuestStore.isLoading(),
            quests: QuestStore.all(),
            loadWarnings: QuestStore.loadWarnings(),
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
            <QuestView quest={this.state.quests[0]} />
        );
        return (<div className='app'>
            {view}
        </div>);
    }
}


export default App;
