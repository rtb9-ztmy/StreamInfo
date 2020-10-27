<template>
<div class="container">
    <div class="mt-4">
        <toggle-button :value="isChecked"
                :color="{checked: '#DA1725', unchecked: '#6441A4'}"
                :width="85"
                :height="30"
                :font-size=12
                :labels="{checked: 'YouTube', unchecked: 'Twitch'}"
                @change="changeStreamService"></toggle-button>
    </div>

    <div class="mt-2">
        <select class="form-control mb-2 w-25" v-model="remainingTime" :disabled="search">
            <option value="" style="display: none">Please select a time</option>
            <option value="10">10秒</option>
            <option value="60">1分</option>
            <option value="300">5分</option>
            <option value="600">10分</option>
        </select>
        <div class="input-group">
            <input type="text" v-model="url" class="form-control" placeholder="Please enter the URL">
            <span class="input-group-btn">
                <button class="btn btn-default btn-outline-primary" @click="startAnalysis" :disabled="search"><i class="fas fa-search"></i></button>
            </span>
        </div>
    </div>

    <p class="mt-3 h5 text-danger" v-if="errorMsg">{{errorMsg}}</p>
    <p class="mt-3 display-4">{{min}}:{{sec}}</p>
    <button class="btn btn-success" :disabled="reset" @click="timerReset">Reset</button>
    <button class="btn btn-dark" @click="downloadCSV" :disabled="download">Download CSV</button>
    <p class="mt-5 h4">同時視聴者数：{{concurrentViewers}}</p>
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
            liveHistories: [],
            isChecked: true
        }
    },
    methods: {
        // 処理開始
        startAnalysis() {
            this.initTime = this.remainingTime;
            // 配信サイトによって叩くAPIを変更
            if(this.isChecked) {
                this.getYoutubeLiveStreamingDetailsByVideoId();
            } else {
                this.errorMsg = 'Twitchは現在利用できません。';
            }
            
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
                this.concurrentViewers = '';
                this.errorMsg = 'URLが無効です';
            });
        },

        // タイマー開始
        timerStart() {
            if (this.timerObj) clearInterval(this.timerObj);

            this.timerObj = setInterval(() => {
                this.search = true;
                this.reset = false;

                console.log(this.isChecked);

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
            let month = this.digitAdjustment(dateObj.getMonth() + 1);
            let date = this.digitAdjustment(dateObj.getDate());
            let hour = this.digitAdjustment(dateObj.getHours());
            let min = this.digitAdjustment(dateObj.getMinutes());
            let sec = this.digitAdjustment(dateObj.getSeconds());

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
        },

        // 日時の桁数を調整
        digitAdjustment(date){
            if (date < 10) return '0' + date;
            return date;
        },

        // 配信サービス切り替え
        changeStreamService() {
            this.isChecked ? this.isChecked = false : this.isChecked = true;
            console.log(this.isChecked);
        }
    }
}
</script>