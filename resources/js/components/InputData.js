import React from 'react';

function InputData({handleChange, handleClick, service}) {
    console.log('InputData mounted');

    const placeholder = service ? 'Please enter the URL' : 'Please enter the UserName';

    return (
        <div className="input-group">
            <input type="text" className="form-control" placeholder={placeholder} onChange={handleChange} ></input>
            <span className="input-group-btn">
                <button className="btn btn-default btn-outline-primary" onClick={handleClick}><i className="fas fa-search"></i></button>
            </span>
        </div>
    );
}

export default React.memo(InputData);