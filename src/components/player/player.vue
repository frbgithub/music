<template>
    <div class="player" v-show="playlist.length>0">
        <transition name="normal">
            <div class="normal-player" v-show="fullScreen">

                <div class="background">
                    <img width="100%" height="100%" :src="currentSong.image">
                </div>

                <div class="top">
                    <div class="back" @click="back">
                        <i class="icon-back"></i>
                    </div>
                    <h1 class="title" v-html="currentSong.name"></h1>
                    <h2 class="subtitle" v-html="currentSong.singer"></h2>
                </div>

                <div class="middle" @touchstart.prevent="middleTouchStart" @touchmove.prevent="middleTouchMove" @touchend="middleTouchEnd">
                    <div class="middle-l" ref="middleL">
                        <div class="cd-wrapper" ref="cdWrapper">
                            <div class="cd" :class="cdCls">
                                <img class="image" :src="currentSong.image">
                            </div>
                        </div>
                        <div class="playing-lyric-wrapper">
                            <div class="playing-lyric">{{playingLyric}}</div>
                        </div>
                    </div>
                    <Scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
                        <div class="lyric-wrapper">
                            <div v-if="currentLyric">
                                <p ref="lyricLine" class="text" :class="{'current': currentLineNum ===index}" v-for="(line,index) in currentLyric.lines">{{line.txt}}</p>
                            </div>
                        </div>
                    </Scroll>
                </div>

                <div class="bottom">
                    <div class="dot-wrapper">
                        <span class="dot" :class="{'active':currentShow==='cd'}"></span>
                        <span class="dot" :class="{'active':currentShow==='lyric'}"></span>
                    </div>
                    <div class="progress-wrapper">
                        <span class="time time-l">{{format(currentTime)}}</span>
                        <div class="progress-bar-wrapper">
                            <progress-bar :percent="percent" @percentChange="percentChange"></progress-bar>
                        </div>
                        <span class="time time-r">{{format(currentSong.duration)}}</span>
                    </div>
                    <div class="operators">
                        <div class="icon i-left" @click="changeMode">
                            <i :class="iconMode"></i>
                        </div>
                        <div class="icon i-left" :class="disableCls">
                            <i @click="prev" class="icon-prev"></i>
                        </div>
                        <div class="icon i-center" :class="disableCls">
                            <i @click="togglePlaying" :class="playIcon"></i>
                        </div>
                        <div class="icon i-right" :class="disableCls">
                            <i @click="next" class="icon-next"></i>
                        </div>
                        <div class="icon i-right">
                            <i class="icon icon-not-favorite"></i>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
        <transition>
            <div class="mini-player" v-show="!fullScreen" @click="open">
                <div class="icon">
                    <img :class="cdCls" width="40" height="40" :src="currentSong.image">
                </div>
                <div class="text">
                    <h2 class="name" v-html="currentSong.name"></h2>
                    <p class="desc" v-html="currentSong.singer"></p>
                </div>
                <div class="control">
                    <i @click.stop="togglePlaying" class="icon-mini" :class="miniIcon"></i>
                </div>
                <div class="control">
                    <i class="icon-playlist"></i>
                </div>
            </div>
        </transition>
        <playlist ref="playlist"></playlist>
        <audio ref="audio" @canplay="ready" @error="error" @timeupdate="updateTime" @ended="end"></audio>
    </div>
</template>
<script> 
    import {mapGetters, mapMutations} from 'vuex'
    import  ProgressBar from 'base/progress-bar/progress-bar'
    import {playMode} from 'common/js/config'
    import {shuffle} from 'common/js/util'
    import Lyric from 'lyric-parser'
    import Scroll from 'base/scroll/scroll'
    import Playlist from 'components/playlist/playlist'
    export default {
        data(){
            return{
              songReady: false, //连续点
              currentTime: 0,  //播放时间
              currentLyric:null, //歌词信息
              currentLineNum:0, //歌词高亮
              currentShow: 'cd', //控制滑动切换
              playingLyric: ''
            }
        },
        created() {
          this.touch = {} //
        },
        computed:{
          ...mapGetters([
            'fullScreen', //播放器收展
            'playlist', //播放列表
            'currentSong', //歌曲信息
            'playing', //播放状态
            'currentIndex',  //播放索引
            'mode',         //播放模式
            'sequenceList' //原始播放列表
          ]),
          playIcon() { //播放暂停图标切换
                return this.playing ? 'icon-pause' : 'icon-play'
          },
          miniIcon() { //mini播放暂停图标切换
                return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
          },
          cdCls() { //控制CD旋转
                return this.playing ? 'play' : 'play pause'
          },
          disableCls() {
            return this.songReady ? '' : 'disable'
          },
          percent(){  //获取播放时间百分比
             return this.currentTime/this.currentSong.duration
          },
          iconMode() {  //播放模式
             return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
          },

        },
        methods:{
            back(){  //收起播放器
                this.setFullScreen(false)
            },
            open(){ //打开播放器
                this.setFullScreen(true)
            },
            ...mapMutations({
                setFullScreen: 'SET_FULL_SCREEN',  //播放器展开收起
                setPlayingState: 'SET_PLAYING_STATE', //播放状态
                setCurrentIndex: 'SET_CURRENT_INDEX', //播放索引
                setPlayMode: 'SET_PLAY_MODE',  //播放模式
                setPlaylist: 'SET_PLAYLIST' //播放列表 
            }),
            togglePlaying(){ //切换播放状态
                this.setPlayingState(!this.playing)
                this.currentLyric.togglePlay() //歌词暂停播放切换
            },
            next(){  //下一首
               if(this.songReady === false){
                   return
               }
               if(this.playlist.lenght === 1){ //如果播放列表只有一首歌
                 this.loop() //循环播放
               }else{
                  let index = this.currentIndex + 1
                  if(index === this.playlist.lenght){
                        index = 0
                  }
                  this.setCurrentIndex(index) //改变播放索引
                  if(this.playing === false){
                        this.togglePlaying()  //切换播放状态
                  }
               }
               
               this.songReady = false;
            },
            prev(){  //上一首
               if(this.songReady === false){
                   return
               }
               if(this.playlist.lenght === 1){ //如果播放列表只有一首歌
                this.loop() //循环播放 
               }else{
                  let index = this.currentIndex - 1
                  if(index === -1){
                        index = this.playlist.lenght - 1
                  }
                  this.setCurrentIndex(index)
                  if(this.playing === false){
                        this.togglePlaying() 
                  }
               }
               
               this.songReady = false;
            },
            ready(){ //歌曲加载成功
                this.songReady = true;
            },
            error(){ 
                this.songReady = true;
            },
            updateTime(e) { //当前播放时间
                this.currentTime = e.target.currentTime
            },
            format(interval) { //时间戳转化
                interval = interval | 0
                let minute = interval / 60 | 0  
                let second = interval % 60
                if(minute.toString().length < 2){
                    minute = '0' + minute
                }
                if(second.toString().length < 2){
                    second = '0' + second
                }
                return `${minute}:${second}`
            },
            percentChange(percent){ //改变播放时间
                const currentTime =  this.currentSong.duration * percent
                this.$refs.audio.currentTime =  currentTime
                if(this.playing === false){ //如果是暂停状态，就切换播放状态
                   this.togglePlaying()
                }
                if(this.currentLyric){ //歌词同步
                    this.currentLyric.seek(currentTime * 1000)
                }
            },
            changeMode(){ //切换播放模式
                const mode = (this.mode + 1) % 3
                this.setPlayMode(mode) //修改播放模式
                let list = null
                if (mode === playMode.random) {  //如果为随机模式
                  list = shuffle(this.sequenceList) //随机播放列表
                } else {
                  list = this.sequenceList  //原始播放列表
                }
                this.resetCurrentIndex(list)  //改变播放索引
                this.setPlaylist(list)  //改变播放列表
            },
            loop() { //循环播放
                this.$refs.audio.currentTime = 0 //播放时间重置为0
                this.$refs.audio.play() //播放歌曲
                if(this.currentLyric){
                    this.currentLyric.seek(0) //重0开始
                }
            },
            end(){ //歌曲播放完执行行数
              if(this.mode === playMode.loop){ //如果为循环播放模式
                  this.loop()
              }else{ //下一首
                 this.next()
              } 
            },
            resetCurrentIndex(list) {  //找到切换后的播放列表当前歌曲的id
                let index = list.findIndex((item) => {
                return item.id === this.currentSong.id
                })
                this.setCurrentIndex(index) //改变播放索引
            },
            getLyric() {  //获取歌词
                this.currentSong.getLyric()
                    .then((lyric) => {
                        this.currentLyric = new Lyric(lyric,this.handleLyric) //获取歌词信息
                        if (this.playing) { //如果为播放状态就播放歌词
                            this.currentLyric.play()  //播放歌词
                        }
                    })
                    .catch(() => {
                        this.currentLyric = null
                        this.playingLyric = ''
                        this.currentLineNum = 0
                    })
            },
            handleLyric({lineNum, txt}) {
                this.currentLineNum = lineNum
                if (lineNum > 5) {
                    let lineEl = this.$refs.lyricLine[lineNum - 5]
                    this.$refs.lyricList.scrollToElement(lineEl, 1000)
                } else {
                    this.$refs.lyricList.scrollTo(0, 0, 1000)
                }
                this.playingLyric = txt //当前播放的歌词
            },
            middleTouchStart(e){ //按下
                this.touch.initiated = true
                // 用来判断是否是一次移动
                this.touch.moved = false
                const touch = e.touches[0]
                this.touch.startX = touch.pageX
                this.touch.startY = touch.pageY
            },
            middleTouchMove(e) { //滑动
                if (!this.touch.initiated) {
                   return
                }
                const touch = e.touches[0]
                const deltaX = touch.pageX - this.touch.startX //X方向的滑动距离 负数
                const deltaY = touch.pageY - this.touch.startY //Y方向的滑动距离
                if (Math.abs(deltaY) > Math.abs(deltaX)) {
                return
                }
                if (!this.touch.moved) {
                  this.touch.moved = true
                }   
                const left = this.currentShow === 'cd' ? 0 : -window.innerWidth
                const offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + deltaX)) //歌词的offsetLeft
                this.touch.percent = Math.abs(offsetWidth / window.innerWidth) //滑动的比例

                this.$refs.lyricList.$el.style['transform'] = `translate3d(${offsetWidth}px,0,0)`
                this.$refs.lyricList.$el.style['transitionDuration'] = 0
                this.$refs.middleL.style.opacity = 1 - this.touch.percent
                this.$refs.middleL.style['transitionDuration'] = 0
            },
            middleTouchEnd(e) { //抬起
                let offsetWidth
                let opacity
                if (this.currentShow === 'cd') {  //向左滑动
                    if (this.touch.percent > 0.1) {
                        offsetWidth = -window.innerWidth
                        opacity = 0
                        this.currentShow = 'lyric'
                    } else {
                        offsetWidth = 0
                        opacity = 1
                    }
                } else {
                    if (this.touch.percent < 0.9) {  //向右滑动
                        offsetWidth = 0
                        this.currentShow = 'cd'
                        opacity = 1
                    } else {
                        offsetWidth = -window.innerWidth
                        opacity = 0
                    }
                }
                const time = 300
                this.$refs.lyricList.$el.style['transform'] = `translate3d(${offsetWidth}px,0,0)`
                this.$refs.lyricList.$el.style['transitionDuration'] = `${time}ms`
                this.$refs.middleL.style.opacity = opacity
                this.$refs.middleL.style['transitionDuration'] = `${time}ms`

                this.touch.initiated = false //手指抬起
            }

        },
        watch:{
            //监听当前播放歌曲变化
            currentSong(newSong,oldSong){
                if (newSong.id === oldSong.id) {
                   return
                }
                if (this.currentLyric) {
                    this.currentLyric.stop()
                    this.currentTime = 0
                    this.playingLyric = ''
                    this.currentLineNum = 0
                }
                this.$refs.audio.src = newSong.url
                this.$refs.audio.play()
                this.getLyric()
                
            },
            //监听播放暂停
            playing(newPlaying) {
                if (!this.songReady) {
                  return
                }
                const audio = this.$refs.audio
                this.$nextTick(() => {
                  newPlaying ? audio.play() : audio.pause()
                })
                
            },
        },
        components:{
          ProgressBar,
          Scroll,
          Playlist
        }
    }
</script>
<style scoped>
.player .normal-player {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 150;
  background: #222;
}
.player .normal-player .background {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  opacity: 0.6;
  filter: blur(20px);
}
.player .normal-player .top {
  position: relative;
  margin-bottom: 25px;
}

.player .normal-player .top .back {
  position: absolute;
  top: 0;
  left: 6px;
  z-index: 50;
}

.player .normal-player .top .back .icon-back {
  display: block;
  padding: 9px;
  font-size: 22px;
  color: #ffcd32;
  transform: rotate(-90deg);
}

.player .normal-player .top .title {
  width: 70%;
  margin: 0 auto;
  line-height: 40px;
  text-align: center;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  font-size: 18px;
  color: #fff;
}

.player .normal-player .top .subtitle {
  line-height: 20px;
  text-align: center;
  font-size: 14px;
  color: #fff;
}
.player .normal-player .middle {
  position: fixed;
  width: 100%;
  top: 80px;
  bottom: 170px;
  white-space: nowrap;
  font-size: 0;
}

.player .normal-player .middle .middle-l {
  display: inline-block;
  vertical-align: top;
  position: relative;
  width: 100%;
  height: 0;
  padding-top: 80%;
}

.player .normal-player .middle .middle-l .cd-wrapper {
  position: absolute;
  left: 10%;
  top: 0;
  width: 80%;
  height: 100%;
}

.player .normal-player .middle .middle-l .cd-wrapper .cd {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  border: 10px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.player .normal-player .middle .middle-l .cd-wrapper .cd .play {
  animation: rotate 20s linear infinite;
}

.player .normal-player .middle .middle-l .cd-wrapper .cd .pause {
  animation-play-state: paused;
}

.player .normal-player .middle .middle-l .cd-wrapper .cd .image {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.player .normal-player .middle .middle-l .playing-lyric-wrapper {
  width: 80%;
  margin: 30px auto 0 auto;
  overflow: hidden;
  text-align: center;
}

.player .normal-player .middle .middle-l .playing-lyric-wrapper .playing-lyric {
  height: 20px;
  line-height: 20px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
}

.player .normal-player .middle .middle-r {
  display: inline-block;
  vertical-align: top;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.player .normal-player .middle .middle-r .lyric-wrapper {
  width: 80%;
  margin: 0 auto;
  overflow: hidden;
  text-align: center;
}

.player .normal-player .middle .middle-r .lyric-wrapper .text {
  line-height: 32px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
}

.player .normal-player .middle .middle-r .lyric-wrapper .current {
  color: #fff;
}

.bottom {
  position: absolute;
  bottom: 50px;
  width: 100%;
}

.bottom .dot-wrapper {
  text-align: center;
  font-size: 0;
}

.bottom .dot-wrapper .dot {
  display: inline-block;
  vertical-align: middle;
  margin: 0 4px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
}
.bottom .dot-wrapper .active {
  width: 20px;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.8);
}

.bottom .progress-wrapper {
  display: flex;
  align-items: center;
  width: 85%;
  margin: 0px auto;
  padding: 10px 0;
}

.bottom .progress-wrapper .time {
  color: #fff;
  font-size: 12px;
  flex: 0 0 40px;
  line-height: 30px;
  width: 30px;
}

.bottom .progress-wrapper .time-l {
  text-align: left;
}

.bottom .progress-wrapper .time-r {
  text-align: right;
}

.bottom .progress-wrapper .progress-bar-wrapper {
  flex: 1;
}

.bottom .operators {
  display: flex;
  align-items: center;
}

.bottom .operators .icon {
  flex: 1;
  color: #ffcd32;
}

.bottom .operators .disable {
  color: rgba(255, 205, 49, 0.5);
}

.bottom .operators .disable i {
  font-size: 30px;
}

.bottom .operators .i-left {
  text-align: right;
  font-size: 30px;
}

.bottom .operators .i-center {
  padding: 0 20px;
  text-align: center;
}

.bottom .operators .i-center i {
  font-size: 40px;
}

.bottom .operators .i-right {
  text-align: left;
  font-size: 30px;
}

.bottom .operators .icon-favorite {
  color: #d93f30;
}

.normal-enter-active,
.normal-leave-active {
  transition: all 0.4s;
}
.normal-enter,
.normal-leave-to {
  opacity: 0;
}
.normal-enter-active .top,
.normal-leave-active .top {
  transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32);
}
.normal-enter .top,
.normal-leave-to .top {
  transform: translate3d(0, -100px, 0);
}
.normal-enter-active .bottom,
.normal-leave-active .bottom {
  transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32);
}
.normal-enter .bottom,
.normal-leave-to .bottom {
  transform: translate3d(0, 100px, 0);
}
.player .mini-player {
  display: flex;
  align-items: center;
  position: fixed;
  left: 0;
  bottom: 0;
  z-index: 180;
  width: 100%;
  height: 60px;
  background: #333;
}

.mini-enter-active,
.mini-leave-active {
  transition: all 0.4s;
}
.mini-enter,
.mini-leave-to {
  opacity: 0;
}

.player .mini-player .icon {
  flex: 0 0 40px;
  width: 40px;
  padding: 0 10px 0 20px;
}

.player .mini-player .icon img {
  border-radius: 50%;
}

.play {
  animation: rotate 10s linear infinite;
}

.pause {
  animation-play-state: paused;
}

.player .mini-player .text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
  line-height: 20px;
  overflow: hidden;
}

.player .mini-player .text .name {
  margin-bottom: 2px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  font-size: 14px;
  color: #fff;
}

.player .mini-player .text .desc {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.3);
}

.player .mini-player .control {
  flex: 0 0 30px;
  width: 30px;
  padding: 0 10px;
}

.icon-play-mini,
.icon-pause-mini,
.icon-playlist {
  font-size: 30px;
  color: rgba(255, 205, 49, 0.5);
}

.icon-mini {
  font-size: 30px;
  color: rgba(255, 205, 49, 0.5);
}
@keyframes rotate {
  0% {
    transform: rotate(0);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>