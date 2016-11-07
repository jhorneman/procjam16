import React, { Component } from 'react';


class StatsView extends Component {
    render() {
        const statViews = this.props.statNames.map((name, index) => {
            return <StatView name={name} value={this.props.stats[name]} key={index} />;
        });
        return (<div className='statsView'>
            {statViews}
        </div>);
    }
}

StatsView.propTypes = {
    statNames: React.PropTypes.array.isRequired,
    stats: React.PropTypes.object.isRequired,
};


function StatView(props) {
    return (<p>{props.name}: {props.value}</p>);
}

StatView.propTypes = {
    name: React.PropTypes.string.isRequired,
    value: React.PropTypes.number.isRequired,
};


export default StatsView;
