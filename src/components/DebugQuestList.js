import React, { Component } from 'react';
import { GameStore } from '../gameStore';


function getState() {
    return {
        quests: GameStore.allQuests(),
    };
}


class DebugQuestList extends Component {
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
        let sheetNames = [];
        let questsBySheet = {};
        this.state.quests.forEach(q => {
            if (!questsBySheet.hasOwnProperty(q.SheetName)) {
                sheetNames.push(q.SheetName);
                questsBySheet[q.SheetName] = [];
            }
            questsBySheet[q.SheetName].push(q);
        });

        let questViews = [];
        sheetNames.forEach(sheetName => questsBySheet[sheetName].forEach((quest, index) => {
            questViews.push(<DebugQuestView quest={quest} key={questViews.length}/>);
        }));

        return (
            <div className='debug'>
                {questViews}
            </div>
        );
    }
}


function DebugQuestView(props) {
    return <div>
        Quest: {props.quest.QuestName}<br/>
        Sheet: {props.quest.SheetName}
    </div>;
}

DebugQuestView.propTypes = {
    quest: React.PropTypes.object.isRequired,
};


export default DebugQuestList;
