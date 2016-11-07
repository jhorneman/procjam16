import React, { Component } from 'react';
import { GameStore } from '../gameStore';


function getState() {
    return {
        warnings: GameStore.warnings(),
    };
}


class WarningList extends Component {
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
        if (this.state.warnings.length === 0) return null;

        const warnings = this.state.warnings.map((warning, index) =>
            <p key={index}>{warning}.</p>
        );
        return (<div className='warningList'>
            <h3>Warnings: {this.state.warnings.length}.</h3>
            {warnings}
        </div>);
    }
}


export default WarningList;
