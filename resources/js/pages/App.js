import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import ToggleSwitch from 'react-switch';
import Time from '../components/Time';
import InputData from '../components/InputData';
import axios from 'axios';

function App() {
    const [service, setService] = useState(true);   // true is YouTube, false is Twitch
    const [time, setTime] = useState(null);
    const [startTime, setStartTime] = useState(0);
    const [displayTime, setDisplayTime] = useState({});
    const [inputData, setInputData] = useState('');
    const [intervalId, setIntervalId] = useState('');
    const [totalViewerNum, setTotalViewerNum] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [runFlg, setRunFlg] = useState(false);

    useEffect(() => {
        let min = Math.floor(time / 60);
        let sec = time % 60;

        // 残り秒数が10以下の場合、0埋めする。
        if(sec < 10) {
            sec = ( '00' + sec ).slice(-2);
        }
        setDisplayTime({min: min, sec: sec});

        // 残り時間が0になった場合は時間をリセットして再度データを取得する。
        if(runFlg && time === 0) {
            timerStop();
            startAnalysis(inputData, startTime, service);
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
        setRunFlg(true);
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
        setRunFlg(false);
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

    const getTwitchLiveDetails = async username => {
        await axios.get('/api/twitch/search/' + username).then( res => {
            // 検索したユーザーと一致するユーザーを取得
            let streamDetail = '';
            res.data.streams.forEach((stream) => {
                if(username === stream.channel.display_name) streamDetail = stream;
            });

            // ライブ配信中かチェック
            if(!streamDetail) {
                throw new Error('ユーザーが存在しないか、ライブ配信中ではありません。');
            }

            setTotalViewerNum(streamDetail.viewers);
        }).catch( e => {
            // isAxiosErrorがtrueの場合は400系、500系のエラー
            throw new Error(e.isAxiosError ? 'ユーザー名がが無効です。' : e.message);
        });
    }

    const checkInputDataSet = (inputData) => {
        if(!inputData) {
            throw new Error('URLを入力してください。');
        }
    }

    const checkTimeSet = (time) => {
        if(!time) {
            throw new Error('時間を選択してください。');
        }
    }

    const extractVideoId = (url) => {
        return url.replace('https://www.youtube.com/watch?v=', '').replace('&feature=youtu.be', '');
    }

    const changeTime = useCallback((e) => {
        setTime(e.target.value);
        setStartTime(e.target.value);
    }, []);

    const startAnalysis = useCallback(async (inputData, time, service) => {
        setInputData(inputData);

        try {
            checkTimeSet(time);
            checkInputDataSet(inputData);

            if(service) {
                let videoId = extractVideoId(inputData);
                await getYoutubeLiveDetails(videoId);
            } else {
                await getTwitchLiveDetails(inputData);
            }
        } catch(e) {
            setErrorMsg(e.message);
            return;
        }

        setErrorMsg('');
        timerStart(runFlg);
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
                <InputData handleClick={startAnalysis} service={service} time={time} />
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