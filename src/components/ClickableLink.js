import React from 'react';


function ClickableLink(props) {
    return (<div className='btn'>
        <a href='#' onClick={props.onClick}>
            {props.children}
        </a>
    </div>);
}

ClickableLink.propTypes = {
    onClick: React.PropTypes.func.isRequired,
    children: React.PropTypes.node.isRequired,
};


export default ClickableLink;
