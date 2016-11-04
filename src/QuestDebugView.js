import React, { Component } from 'react';


function QuestDebugView(props) {
    return <p>Quest: {props.quest.QuestName}</p>;
}

QuestDebugView.propTypes = {
    quest: React.PropTypes.object.isRequired,
};


export default QuestDebugView;
