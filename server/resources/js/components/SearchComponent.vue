<template>
<div>
    <input type="text" v-model="url">
    <select v-model="remainingTime" :disabled="search">
        <option value="10">10秒</option>
        <option value="60">1分</option>
        <option value="300">5分</option>
        <option value="600">10分</option>
    </select>
    <button @click="startAnalysis" :disabled="search">検索</button>
    <p v-if="errorMsg">{{errorMsg}}</p>
    <p>{{min}}:{{sec}}</p>
    <button :disabled="reset" @click="timerReset">リセット</button>
    <p>同時視聴者数:{{concurrentViewers}}</p>
    <button @click="downloadCSV" :disabled="download">ダウンロード</button>
    <ul>
        <li v-for="(liveHistory, index) in liveHistories" :key="index">{{liveHistory.numberOfPeople}}人　{{liveHistory.date}}</li>
    </ul>
</div>
</template>

<script>
export default {
    data: function() {
        return {
            url: '',
            concurrentViewers: '',
            min: '',
            sec: '',
            remainingTime: '',
            initTime: '',
            timerObj: null,
            search: false,
            reset: true,
            errorMsg: null,
            date: null,
            download: true,
            liveHistories: []
        }
    },
    methods: {
        // 処理開始
        startAnalysis() {
            this.initTime = this.remainingTime;
            this.getYoutubeLiveStreamingDetailsByVideoId();
        },

        // ライブ情報取得
        getYoutubeLiveStreamingDetailsByVideoId() {
            // URLの余分な部分をカット
            let videoId = this.url.replace('https://www.youtube.com/watch?v=', '').replace('&feature=youtu.be', '');

            axios.get('/api/search/' + videoId).then((res) => {
                // ライブ中か判定
                if (!this.remainingTime) {
                    this.errorMsg = '時間を選択してください。';
                    return;
                }
                if (res.data.items[0].snippet.liveBroadcastContent === 'live') {
                    this.errorMsg = '';
                    this.concurrentViewers = res.data.items[0].liveStreamingDetails.concurrentViewers;
                    this.timerStart();
                } else {
                    this.errorMsg = 'このライブは終了したか、ライブ配信ではありません。'
                }
            }).catch(() => {
                this.concurrentViewers = 0;
                this.errorMsg = 'URLが無効です';
            });
        },

        // タイマー開始
        timerStart() {
            if (this.timerObj) clearInterval(this.timerObj);

            this.timerObj = setInterval(() => {
                this.search = true;
                this.reset = false;

                // 履歴が空でなければダウンロードボタンを押せるようにする
                if (this.liveHistories.length > 0) this.download = false;

                this.remainingTime = Number(this.remainingTime);
                this.min = Math.floor(this.remainingTime / 60);
                if (this.remainingTime % 60 < 10) {
                    this.sec = '0' + this.remainingTime % 60;
                } else {
                    this.sec = this.remainingTime % 60;
                }
                this.remainingTime --;
                
                // 残り時間が0になったとき
                if (this.remainingTime === 0) {
                    this.remainingTime = this.initTime;
                    this.getDate();
                    this.liveHistories.push({numberOfPeople: this.concurrentViewers, date: this.date});
                    this.getYoutubeLiveStreamingDetailsByVideoId();
                }
            }, 1000);
        },

        // タイマーリセット
        timerReset() {
            clearInterval(this.timerObj);
            // 各ボタンの活性/非活性を切り替える
            this.search = false;
            this.reset = true; 
            this.download = true;

            this.remainingTime = this.initTime;
            this.concurrentViewers = 0;
            this.liveHistories = [];
            this.min = Math.floor(this.remainingTime / 60);
            if (this.remainingTime % 60 < 10) {
                this.sec = '0' + this.remainingTime % 60;
            } else {
                this.sec = this.remainingTime % 60;
            }
        },

        // 現在日時を取得
        getDate() {
            let dateObj = new Date();

            let year = dateObj.getFullYear();
            let month = dateObj.getMonth() + 1;
            let date = dateObj.getDate();
            let hour = dateObj.getHours();
            let min = dateObj.getMinutes();
            let sec = dateObj.getSeconds();

            let now = year + '/' + month + '/' + date + ' ' + hour + ':' + min + ':' + sec;

            this.date = now;
        },

        // csvダウンロード
        downloadCSV() {
            if(this.liveHistories.length > 1) this.download = false; 

            let csv = '\ufeff' + '同時視聴者数,時刻\n'

            // 一行ずつデータを作成
            this.liveHistories.forEach(function(el){
                let line = el.numberOfPeople + ',' + el.date + '\n';
                csv += line;
                console.log(el);
            });

            let blob = new Blob([csv], { type: 'text/csv' });
            let link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = 'Result.csv';
            link.click();
        }
    }
}
</script>