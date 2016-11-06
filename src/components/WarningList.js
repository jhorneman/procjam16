import React from 'react';
import './WarningList.css';


function WarningList(props) {
    const list = props.warnings.length > 0 ? (
        <ul>
            {props.warnings.map((warning, index) =>
                <li key={index}>{warning}</li>
            )}
        </ul>
    ) : null;
    return (<div className='warningList'>
        <p>Warnings: {props.warnings.length}.</p>
        {list}
    </div>);
}

WarningList.propTypes = {
    warnings: React.PropTypes.array.isRequired,
};


export default WarningList;
