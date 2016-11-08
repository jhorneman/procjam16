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


const continueButtonText = 'Continue...';
const deathContinueButtonText = 'Begin Anew';
const deathResultText = 'You lasted #days# in the jungle and traveled #miles# miles. You did not reach the white city.';


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

        if (!this.state.playerIsDead) {
            if (!this.state.playerHasChosen) {
                const questText = GameStore.processText(quest.QuestText);
                view = (<div className='questView'>
                    <div className='text'>{questText}</div>
                    <div className='flex-container buttonBar'>
                        <button className='choice' onClick={this.onAClick} key='choiceA'>{quest.ChoiceTexts[0]}</button>
                        <button className='choice' onClick={this.onBClick} key='choiceB'>{quest.ChoiceTexts[1]}</button>
                    </div>
                </div>); 

            } else {
                const resultText = GameStore.processText(this.state.playerIsDead ? deathResultText : quest.ResultTexts[this.state.playerChoice]);
                view = (<div className='questView'>
                    <div className='text'>{resultText}</div>
                    <div className='flex-container buttonBar'>
                        <button className='continue' onClick={this.onContinueClick}>{continueButtonText}</button>
                    </div>
                </div>)
            }

        } else {
            if (!this.state.playerHasChosen) {
                const questText = GameStore.processText(quest.QuestText);
                view = (<div className='questView'>
                    <div className='text'>{questText}</div>
                    <div className='flex-container buttonBar'>
                        <button className='death' onClick={this.onAClick}>{quest.ChoiceTexts[0]}</button>
                    </div>
                </div>); 

            } else {
                const resultText = GameStore.processText(deathResultText);
                view = (<div className='questView'>
                    <div className='text'>{resultText}</div>
                    <div className='flex-container buttonBar'>
                        <button className='restart' onClick={this.onContinueClick}>{deathContinueButtonText}</button>
                    </div>
                </div>)
            }
        }

        return view;
    }
}


export default QuestView;
