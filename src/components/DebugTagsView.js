import React, { Component } from 'react';
import { GameStore } from '../gameStore';


function getState() {
    return {
        tags: GameStore.tags(),
    };
}


class DebugTagsView extends Component {
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
        const tagViews = this.state.tags.map((tag, index) => {
            return <li key={index}>{tag}</li>;
        });

        return (<div className='tagsView'>
            <h3>Player tags:</h3>
            <ul>
                {tagViews}
            </ul>
        </div>);
    }
}


export default DebugTagsView;
