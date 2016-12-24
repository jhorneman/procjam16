import React, { Component } from 'react';
import { GameStore } from '../gameStore';
import { visibleStatNames } from '../constants';

import icon_health from '../../images/icon_health.png';
import icon_luck from '../../images/icon_luck.png';
import icon_morale from '../../images/icon_morale.png';
import icon_rations from '../../images/icon_rations.png';


const statImages = {
    'health': icon_health,
    'luck': icon_luck,
    'morale': icon_morale,
    'rations': icon_rations
};


function getState() {
    return {
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
        const statViews = visibleStatNames.map((name, index) => {
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
        <span className='statName' key='name'><img src={statImages[props.name]} alt={props.name} /></span>
        <span className='statValue' key='value'>{props.value}</span>
    </div>);
}

StatView.propTypes = {
    name: React.PropTypes.string.isRequired,
    value: React.PropTypes.number.isRequired,
};


export default StatsView;
