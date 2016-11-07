import React, { Component } from 'react';


class TagsView extends Component {
    render() {
        const tagViews = this.props.tags.map((tag, index) => {
            return <li key={index}>{tag}</li>;
        });
        return (<div className='tagsView'>
            <p>Player tags:</p>
            <ul>
                {tagViews}
            </ul>
        </div>);
    }
}

TagsView.propTypes = {
    tags: React.PropTypes.array.isRequired,
};


export default TagsView;
