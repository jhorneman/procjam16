import React, { Component } from 'react';
import { GameStore } from '../gameStore';


function getState() {
    return {
        statNames: GameStore.visibleStatNames(),
        stats: GameStore.stats(),
    };
}


class StatsView extends Component {
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
        const statViews = this.state.statNames.map((name, index) => {
            return <StatView name={name} value={this.state.stats[name]} key={index} />;
        });
        return (<div className='statsView flex-container'>
            {statViews}
        </div>);
    }
}


function StatView(props) {
    let className = 'stat';
    if (props.value === 0) {
        className += ' valueZero';
    } else if (props.value <= 2) {
        className += ' valueLow';
    }

    return (<div className={className}>
        <span className='statValue' key='value'>{props.value}</span>
        <span className='statName' key='name'>{props.name}</span>
    </div>);
}

StatView.propTypes = {
    name: React.PropTypes.string.isRequired,
    value: React.PropTypes.number.isRequired,
};


export default StatsView;
