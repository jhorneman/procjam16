import React, { Component } from 'react';


class StatsView extends Component {
    render() {
        const statViews = this.props.statNames.map((name, index) => {
            return <StatView name={name} value={this.props.stats[name]} key={index} />;
        });
        return (<div className='statsView flex-container'>
            {statViews}
        </div>);
    }
}

StatsView.propTypes = {
    statNames: React.PropTypes.array.isRequired,
    stats: React.PropTypes.object.isRequired,
};


function StatView(props) {
    let className = 'stat';
    if (props.value === 0) {
        className += ' valueZero';
    } else if (props.value <= 2) {
        className += ' valueLow';
    }

    return (<div className={className}>
        <span className='statValue'>{props.value}</span>
        <span className='statName'>{props.name}</span>
    </div>);
}

StatView.propTypes = {
    name: React.PropTypes.string.isRequired,
    value: React.PropTypes.number.isRequired,
};


export default StatsView;
