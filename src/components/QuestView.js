import React, { Component } from 'react';
import { GameStore, GameStoreMutator } from '../gameStore';


function getInitialState() {
    return {
        quest: GameStore.currentQuest(),
        playerHasChosen: false,
        playerChoice: undefined
    };
}


class QuestView extends Component {
    constructor(props) {
        super(props);
        this.state = getInitialState();
        this.onAClick = this.onChoiceClick.bind(this, 0);
        this.onBClick = this.onChoiceClick.bind(this, 1);
        this.onContinueClick = this.onContinueClick.bind(this);
    }

    onChoiceClick(choiceIndex) {
        GameStoreMutator.executeChoice(choiceIndex);
        this.setState({
            playerHasChosen: true,
            playerChoice: choiceIndex,
        });
    }

    onContinueClick() {
        GameStoreMutator.pickNextQuest();
        this.setState(getInitialState());
    }

    render() {
        const quest = this.state.quest;
        let view;
        if (!this.state.playerHasChosen) {
            view = (<div className='questView'>
                <div className='text'>{quest.QuestText}</div>
                <button className='button choiceA' onClick={this.onAClick}>{quest.ChoiceTexts[0]}</button>
                <button className='button choiceB' onClick={this.onBClick}>{quest.ChoiceTexts[1]}</button>
            </div>); 
        } else {
            view = (<div className='questView'>
                <div className='text'>{quest.ResultTexts[this.state.playerChoice]}</div>
                <button className='button continue' onClick={this.onContinueClick}>Continue...</button>
            </div>)
        }

        return view;
    }
}


export default QuestView;
