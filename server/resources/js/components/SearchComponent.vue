<template>
<div>
    <input type="text" v-model="url">
    <select v-model="remainingTime" :disabled="search">
        <option value="300">5分</option>
        <option value="600">10分</option>
    </select>
    <button @click="startAnalysis" :disabled="search">検索</button>
    <p v-if="errorMsg">{{errorMsg}}</p>
    <p>{{min}}:{{sec}}</p>
    <button :disabled="reset" @click="timerReset">リセット</button>
    <p>同時視聴者数:{{concurrentViewers}}</p>
    <ul>
        <li v-for="comparisonViewer in comparisonViewers" :key="comparisonViewer">{{comparisonViewer}}</li>
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
            comparisonViewers: []
        }
    },
    methods: {
        startAnalysis() {
            this.initTime = this.remainingTime;
            this.getYoutubeLiveStreamingDetailsByVideoId();
        },
        getYoutubeLiveStreamingDetailsByVideoId() {
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
            }).catch((error) => {
                this.concurrentViewers = 0;
                this.errorMsg = 'URLが無効です';
            });
        },
        timerStart() {
            if (this.timerObj) clearInterval(this.timerObj);
            this.timerObj = setInterval(() => {
                this.search = true;
                this.reset = false;

                this.remainingTime = Number(this.remainingTime);
                this.min = Math.floor(this.remainingTime / 60);
                if (this.remainingTime % 60 < 10) {
                    this.sec = '0' + this.remainingTime % 60;
                } else {
                    this.sec = this.remainingTime % 60;
                }

                this.remainingTime --;
                if (this.remainingTime === 0) {
                    this.remainingTime = this.initTime;
                    this.comparisonViewers.push(this.concurrentViewers);
                    this.beforeConcurrentViewers = this.concurrentViewers;
                    this.getYoutubeLiveStreamingDetailsByVideoId();
                }
            }, 1000);
        },
        timerReset() {
            clearInterval(this.timerObj);
            this.search = false;
            this.reset = true; 
            this.remainingTime = this.initTime;
            this.concurrentViewers = 0;
            this.comparisonViewers = [];
            this.min = Math.floor(this.remainingTime / 60);
            if (this.remainingTime % 60 < 10) {
                this.sec = '0' + this.remainingTime % 60;
            } else {
                this.sec = this.remainingTime % 60;
            }
        }
    }
}
</script>