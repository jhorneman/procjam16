import React, { Component } from 'react';
import { GameStore, GameStoreMutator } from '../gameStore';


class QuestView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            quest: GameStore.currentQuest(),
            playerHasChosen: false,
            playerChoice: undefined
        };
        this.onAClick = this.onChoiceClick.bind(this, 0);
        this.onBClick = this.onChoiceClick.bind(this, 1);
        this.onContinueClick = this.onContinueClick.bind(this);
    }

    onChoiceClick(choiceIndex) {
        this.setState({
            playerHasChosen: true,
            playerChoice: choiceIndex,
        });
    }

    onContinueClick() {
        this.props.onContinue();
    }

    render() {
        const quest = this.state.quest;
        console.log(quest);
        let view;
        if (!this.state.playerHasChosen) {
            view = (<div className='questView'>
                <div className='questText'>{quest.QuestText}</div>
                <button onClick={this.onAClick}>{quest.ChoiceAText}</button>
                <button onClick={this.onBClick}>{quest.ChoiceBText}</button>
            </div>); 
        } else {
            view = (<div className='questView'>
                <div className='resultText'>{this.state.playerChoice ? quest.ChoiceAResult : quest.ChoiceBResult}</div>
                <button onClick={this.onContinueClick}>Continue...</button>
            </div>)
        }

        return view;
    }
}


export default QuestView;
