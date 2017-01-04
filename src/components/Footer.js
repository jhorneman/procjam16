import React from 'react';


function Footer(props) {
    return (<div className='footer'>
        <div className='buttonBar'>
            {props.children}
        </div>
        <p className='copyright'>&copy; 2017 Liz England, Jurie Horneman &amp; Stefan Srb</p>
    </div>);
}


Footer.propTypes = {
    children: React.PropTypes.arrayOf(React.PropTypes.node).isRequired
};


export default Footer;
