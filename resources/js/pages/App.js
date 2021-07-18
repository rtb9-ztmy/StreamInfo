import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import ToggleSwitch from 'react-switch';

function App() {
    console.log('App mounted');

    // true is YouTube, false is Twitch
    const [service, setService] = useState(true);

    const serviceToggleTextStyle = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: service ? '15px' : '-15px',
        textAlign: 'center',
        height: '100%',
        fontSize: 12,
        color: '#fff'
    }

    const times = [10, 60, 300, 600];

    const changeService = () => {
        setService(!service);
    }

    return (
        <div className="container">
            <div className="mt-4">
                <ToggleSwitch 
                    onChange={changeService} 
                    checked={service} 
                    onColor="#DA1725"
                    offColor="#6441A4"
                    uncheckedIcon={<div style={serviceToggleTextStyle}>Twitch</div>}
                    checkedIcon={<div style={serviceToggleTextStyle}>YouTube</div>}
                    width={85}
                    height={30} />
            </div>

            <div className="mt-3">
                <select className="form-control mb-2 w-25">
                    <option value="" style={{display: 'none'}}>Please select a time</option>
                    {times.map((time, index) => 
                        <option key={index} value={time}>
                            {time >= 60 ? time / 60 + '分' : time + '秒'}
                        </option>)
                    }
                </select>
                <div className="input-group">
                    <input type="text" className="form-control" placeholder="Please enter the URL"></input>
                    <span className="input-group-btn">
                        <button className="btn btn-default btn-outline-primary"><i className="fas fa-search"></i></button>
                    </span>
                </div>
            </div>

            <p id="time" className="mt-3 display-4">:</p>
            <button className="btn btn-success">Reset</button>
            <button className="btn btn-dark ml-1">Download CSV</button>
            <p id="concurrentViewers" className="mt-5 h4">同時視聴者数：</p>
        </div>
    );
}

ReactDOM.render(<App />, document.getElementById('app'));