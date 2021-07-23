import React, { useState } from 'react';

function InputData({handleClick, service}) {
    console.log('InputData mounted');

    const placeholder = service ? 'Please enter the URL' : 'Please enter the UserName';
    const [inputData, setInputData] = useState('');

    const changeInputData = (e) => {
        setInputData(e.target.value);
    }

    return (
        <div className="input-group">
            <input type="text" className="form-control" placeholder={placeholder} onChange={changeInputData}></input>
            <span className="input-group-btn">
                <button className="btn btn-default btn-outline-primary" onClick={() => handleClick(inputData)}><i className="fas fa-search"></i></button>
            </span>
        </div>
    );
}

export default React.memo(InputData);