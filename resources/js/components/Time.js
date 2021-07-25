import React from 'react';

const times = [10, 60, 300, 600];

function Time({handleChange}) {
    return (
        <select className="form-control mb-2 w-25" onChange={handleChange}>
            <option value="" style={{display: 'none'}}>Please select a time</option>
            {times.map((time, index) => 
                <option key={index} value={time}>
                    {time >= 60 ? time / 60 + '分' : time + '秒'}
                </option>)
            }
        </select>
    );
}

export default React.memo(Time);