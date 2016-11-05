import React, { Component } from 'react';


class QuestView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            playerHasChosen: false,
            playerChoice: undefined
        };
        this.onAClick = this.onClick.bind(this, 0);
        this.onBClick = this.onClick.bind(this, 1);
    }

    onClick(choiceIndex) {
        this.setState({
            playerHasChosen: true,
            playerChoice: choiceIndex,
        });
    }

    render() {
        return this.state.playerHasChosen ? (<div className='questView'>
            <div className='resultText'>{this.state.playerChoice ? this.props.quest.ChoiceAResult : this.props.quest.ChoiceBResult}</div>
        </div>) : (<div className='questView'>
            <div className='questText'>{this.props.quest.QuestText}</div>
            <button onClick={this.onAClick}>{this.props.quest.ChoiceAText}</button>
            <button onClick={this.onBClick}>{this.props.quest.ChoiceBText}</button>
        </div>);
    }
}

QuestView.propTypes = {
    quest: React.PropTypes.object.isRequired,
};


export default QuestView;
