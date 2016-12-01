import React, { Component } from 'react';
import { GameStore, GameStoreMutator } from '../gameStore';


const initialState = {
    playerHasChosen: false,
    playerChoice: undefined,
};


function getState() {
    return {
        quest: GameStore.currentQuest(),
        isDeathQuest: GameStore.isDeathQuest(),
        continueButtonText: GameStore.continueButtonText(),
        deathContinueButtonText: GameStore.deathContinueButtonText(),
        deathResultText: GameStore.deathResultText(),
    };
}


class QuestView extends Component {
    constructor(props) {
        super(props);
        this.state = Object.assign({}, getState(), initialState);
        this._onChange = this._onChange.bind(this);
        this._onAClick = this._onChoiceClick.bind(this, 0);
        this._onBClick = this._onChoiceClick.bind(this, 1);
        this._onContinueClick = this._onContinueClick.bind(this);
    }

    _onChange() {
        const newState = getState();
        if (newState.quest !== this.state.quest) {
            this.setState(Object.assign({}, newState, initialState));
        }
    }

    componentDidMount() {
        GameStore.addChangeListener(this._onChange);
    }

    componentWillUnmount() {
        GameStore.removeChangeListener(this._onChange);
    }

    _onChoiceClick(choiceIndex) {
        this.setState({
            playerHasChosen: true,
            playerChoice: choiceIndex,
        });
        GameStoreMutator.executeChoice(choiceIndex);
    }

    _onContinueClick() {
        GameStoreMutator.pickNextQuest();
        this.setState(Object.assign({}, getState(), initialState));
    }

    render() {
        const quest = this.state.quest;
        let view;

        if (!this.state.isDeathQuest) {
            if (!this.state.playerHasChosen) {
                const questText = GameStore.processText(quest.QuestText);
                view = (<div className='questView'>
                    <div className='text'>{questText}</div>
                    <div className='buttonBar'>
                        <button className='choice' onClick={this._onAClick} key='choiceA'>{quest.ChoiceTexts[0]}</button>
                        <button className='choice' onClick={this._onBClick} key='choiceB'>{quest.ChoiceTexts[1]}</button>
                    </div>
                </div>); 

            } else {
                let resultText = this.state.isDeathQuest ? this.state.deathResultText : quest.ResultTexts[this.state.playerChoice];
                resultText = GameStore.processText(resultText);
                view = (<div className='questView'>
                    <div className='text'>{resultText}</div>
                    <div className='buttonBar'>
                        <button className='continue' onClick={this._onContinueClick}>{this.state.continueButtonText}</button>
                    </div>
                </div>)
            }

        } else {
            if (!this.state.playerHasChosen) {
                const questText = GameStore.processText(quest.QuestText);
                view = (<div className='questView'>
                    <div className='text'>{questText}</div>
                    <div className='buttonBar'>
                        <button className='death' onClick={this._onAClick}>{quest.ChoiceTexts[0]}</button>
                    </div>
                </div>); 

            } else {
                const resultText = GameStore.processText(this.state.deathResultText);
                view = (<div className='questView'>
                    <div className='text'>{resultText}</div>
                    <div className='buttonBar'>
                        <button className='restart' onClick={this._onContinueClick}>{this.state.deathContinueButtonText}</button>
                    </div>
                </div>)
            }
        }

        return view;
    }
}


export default QuestView;
