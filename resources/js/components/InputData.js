import React from 'react';

function InputData({handleChange, handleClick}) {
    console.log('InputData mounted');

    return (
        <div className="input-group">
            <input type="text" className="form-control" placeholder="Please enter the URL" onChange={handleChange} ></input>
            <span className="input-group-btn">
                <button className="btn btn-default btn-outline-primary" onClick={handleClick}><i className="fas fa-search"></i></button>
            </span>
        </div>
    );
}

export default React.memo(InputData);