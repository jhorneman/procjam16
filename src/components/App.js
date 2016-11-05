import React, { Component } from 'react';
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
            <p>Data has loaded.</p>
        );
        return (<div className='app'>
            {view}
        </div>);
    }
}


export default App;
