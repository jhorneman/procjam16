import React from 'react';
import './DebugQuestList.css';


function DebugQuestList(props) {
    return (
        <div>
            {props.quests.map((quest, index) =>
                <DebugQuestView quest={quest} key={index}/>
            )}
        </div>
    )
}

DebugQuestList.propTypes = {
    quests: React.PropTypes.array.isRequired,
};


function DebugQuestView(props) {
    return <div className='debugQuestView'>
        Quest: {props.quest.QuestName}<br/>
        Sheet: {props.quest.SheetName}
    </div>;
}

DebugQuestView.propTypes = {
    quest: React.PropTypes.object.isRequired,
};


export default DebugQuestList;
