import React, { Component } from 'react';
import { GameStore, GameStoreMutator } from '../gameStore';


function getInitialState() {
    return {
        quest: GameStore.currentQuest(),
        playerIsDead: GameStore.playerIsDead(),
        playerHasChosen: false,
        playerChoice: undefined,
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
            const questText = GameStore.processText(quest.QuestText);
            let buttons = this.state.playerIsDead ? (
                <button className='death' onClick={this.onAClick}>Rest In Peace</button>
            ) : [
                <button className='choice' onClick={this.onAClick} key='choiceA'>{quest.ChoiceTexts[0]}</button>,
                <button className='choice' onClick={this.onBClick} key='choiceB'>{quest.ChoiceTexts[1]}</button>
            ];

            view = (<div className='questView'>
                <div className='text'>{questText}</div>
                <div className='flex-container buttonBar'>
                    {buttons}
                </div>
            </div>); 
        } else {
            const resultText = GameStore.processText(quest.ResultTexts[this.state.playerChoice]);
            view = (<div className='questView'>
                <div className='text'>{resultText}</div>
                <div className='flex-container buttonBar'>
                    <button className='continue' onClick={this.onContinueClick}>Continue...</button>
                </div>
            </div>)
        }

        return view;
    }
}


export default QuestView;
