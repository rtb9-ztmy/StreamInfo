import React, { useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import ToggleSwitch from 'react-switch';
import Time from '../components/Time';
import InputData from '../components/InputData';

function App() {
    console.log('App mounted');

    const [service, setService] = useState(true);   // true is YouTube, false is Twitch
    const [time, setTime] = useState(0);
    const [inputData, setInputData] = useState('');

    console.log(inputData);

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

    const changeService = () => {
        setService(!service);
    }

    const changeTime = useCallback((e) => {
        setTime(e.target.value);
    }, [time]);

    const changeInputData = useCallback((e) => {
        setInputData(e.target.value)
    }, [inputData]);

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
                <Time handleChange={changeTime} />
                <InputData handleChange={changeInputData} />
            </div>

            <p id="time" className="mt-3 display-4">:</p>
            <button className="btn btn-success">Reset</button>
            <button className="btn btn-dark ml-1">Download CSV</button>
            <p id="concurrentViewers" className="mt-5 h4">同時視聴者数：</p>
        </div>
    );
}

ReactDOM.render(<App />, document.getElementById('app'));