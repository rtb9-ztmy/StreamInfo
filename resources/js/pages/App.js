import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import ToggleSwitch from 'react-switch';
import Time from '../components/Time';
import InputData from '../components/InputData';
import axios from 'axios';

function App() {
    console.log('App mounted');

    const [service, setService] = useState(true);   // true is YouTube, false is Twitch
    const [time, setTime] = useState(null);
    const [startTime, setStartTime] = useState(0);
    const [displayTime, setDisplayTime] = useState({});
    const [inputData, setInputData] = useState('');
    const [intervalId, setIntervalId] = useState('');
    const [totalViewerNum, setTotalViewerNum] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        let min = Math.floor(time / 60);
        let sec = time % 60;

        // 残り秒数が10以下の場合、0埋めする。
        if(sec < 10) {
            sec = ( '00' + sec ).slice(-2);
        }
        setDisplayTime({min: min, sec: sec});

        // 残り時間が0になった場合はタイマーを止める。
        if(time === 0) {
            timerStop();
            startAnalysis(inputData);
        }
    }, [time]);

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

    const timerStart = () => {
        setIntervalId(
            setInterval(() => {
                setTime(prevState => prevState - 1);
            }, 1000)
        );
    }

    const timerStop = () => {
        clearInterval(intervalId);
        setTime(startTime);
        setTotalViewerNum(null);
    }

    const getYoutubeLiveDetails = async videoId => {
        await axios.get('/api/search/' + videoId).then( res => {
            // ライブ中か判定
            if(res.data.items[0].snippet.liveBroadcastContent === 'live') {
                setTotalViewerNum(res.data.items[0].liveStreamingDetails.concurrentViewers);
            } else {
                throw new Error('このライブは終了したか、ライブ配信ではありません。');
            }
        }).catch((e) => {
            // isAxiosErrorがtrueの場合は400系、500系のエラー
            throw new Error(e.isAxiosError ? 'URLが無効です。' : e.message);
        });
    }

    const checkInputDataSet = (inputData) => {
        if(!inputData) {
            throw new Error('URLを入力してください。');
        }
    }

    const changeTime = useCallback((e) => {
        setTime(e.target.value);
        setStartTime(e.target.value);
    }, []);

    const startAnalysis = useCallback(async inputData => {
        setInputData(inputData);

        try {
            checkInputDataSet(inputData);
            await getYoutubeLiveDetails(inputData);
        } catch(e) {
            setErrorMsg(e.message);
            return;
        }

        timerStart();
    }, []);

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
                <InputData handleClick={startAnalysis} service={service} />
            </div>

            {errorMsg && (
                <p className="mt-3 h5 text-danger">{errorMsg}</p>
            )}
            <p id="time" className="mt-3 display-4">{displayTime.min}:{displayTime.sec}</p>
            <button className="btn btn-success" onClick={timerStop}>Reset</button>
            <button className="btn btn-dark ml-1">Download CSV</button>
            <p id="concurrentViewers" className="mt-5 h4">同時視聴者数：{totalViewerNum}</p>
        </div>
    );
}

ReactDOM.render(<App />, document.getElementById('app'));