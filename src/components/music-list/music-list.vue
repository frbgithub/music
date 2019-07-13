<template>
    <div class="music-list">
        <div class="back">
            <i class="icon-back" @click=back></i>
        </div>
        <h1 class="title" v-html="title"></h1>
        <div class="bg-image" :style="bgStyle" ref="bgImage">
            <div class="play-wrapper">
                <div ref="playBtn" v-show="songs.length>0" class="play" @click="random">
                    <i class="icon-play"></i>
                    <span class="text">随机播放全部</span>
                </div>
            </div>
            <div class="filter" ref="filter"></div>
        </div>
        <div class="bg-layer" ref="layer"></div>
        <scroll :data="songs" :listen-scroll="listenScroll" @scroll="scroll" :probe-type="probeType" class="list" ref="list">
            <div class="song-list-wrapper">
                <song-list @select="selectItem" :songs="songs" :rank="rank"></song-list>
            </div>
            <div v-show="!songs.length" class="loading-container">
                <loading></loading>
            </div>
        </scroll>
    </div>
</template>
<script>
    import SongList from 'base/song-list/song-list'
    import Loading from 'base/loading/loading'
    import Scroll from 'base/scroll/scroll'
    import {mapActions,mapGetters} from 'vuex'
    const RESERVED_HEIGHT = 40
    export default{
        data() {
            return {
                scrollY: 0
            }
        },
        props: {
            bgImage: {  
                type: String,
                default: ''
            },
            songs: {  
                type: Array,
                default: []
            },
            title: {  
                type: String,
                default: ''
            },
            rank: {
                type: Boolean,
                default: false
            }
        },
        activated(){
            this.handlePlayList(this.playlist) //设置滚动组件bottom
        },
        methods:{
            //监听滚动 pos.y值
            scroll(pos) {
                this.scrollY = pos.y
                // console.log( this.scrollY)
            },
            back(){
                this.$router.back()
            },
            //歌曲列表存入vuex
            selectItem(item,index){
              this.selectPlay({
                  list:this.songs, //歌曲列表
                  index:index      //歌曲索引
              })
            },
            //随机播放
            random(){
                this.randomPlay({
                   list:this.songs, //歌曲列表
                })
            },
            ...mapActions([
               'selectPlay', //顺序播放
               'randomPlay' //随机播放
            ]),
            handlePlayList(playlist){
                const bottom =  playlist.length > 0? '60px': ''
                this.$refs.list.$el.style.bottom = bottom
                this.$refs.list.refresh()
            }
        },
        mounted() {
            this.imageHeight = this.$refs.bgImage.clientHeight //背景图高度
            this.minTransalteY = -this.imageHeight + RESERVED_HEIGHT //最小滚动值
            this.$refs.list.$el.style.top = `${this.imageHeight}px`

            this.handlePlayList(this.playlist) //设置滚动组件bottom
        },
        computed: {
            bgStyle() {
                return `background-image:url(${this.bgImage})`
            },
            ...mapGetters([
               'playlist', //播放列表
            ])

        },
        created() {
            this.probeType = 3
            this.listenScroll = true
        },
        components:{
          SongList,
          Scroll,
          Loading
        },
        watch: {
            scrollY(newVal) {
                let translateY = Math.max(this.minTransalteY, newVal)
                let scale = 1 //图片放大倍数
                let zIndex = 0
                let blur = 0 
                const percent = Math.abs(newVal / this.imageHeight) //放大比例
                //如果下拉
                if (newVal > 0) {
                scale = 1 + percent
                zIndex = 10
                } else {
                blur = Math.min(20, percent * 20)
                }
                this.$refs.layer.style['transform'] = `translate3d(0,${translateY}px,0)`
                this.$refs.filter.style['backdrop-filter'] = `blur(${blur}px)` //效果模糊
                this.$refs.filter.style['webkiBackdrop-filter'] = `blur(${blur}px)` //效果模糊
                //小于最大滚动值后
                if (newVal < this.minTransalteY) {
                zIndex = 10
                this.$refs.bgImage.style.paddingTop = 0
                this.$refs.bgImage.style.height = `${RESERVED_HEIGHT}px`
                this.$refs.playBtn.style.display = 'none' 
                } else {
                this.$refs.bgImage.style.paddingTop = '70%'
                this.$refs.bgImage.style.height = 0
                this.$refs.playBtn.style.display = ''
                }
                this.$refs.bgImage.style['transform'] = `scale(${scale})` //下拉图片放大
                this.$refs.bgImage.style.zIndex = zIndex
            },
            playlist(newPlaylist) {
                this.handlePlayList(newPlaylist)
            }
       }, 
    }
    
</script>
<style scoped>
.music-list {
  position: fixed;
  z-index: 100;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: #222;
}
.music-list .back {
  position: absolute;
  top: 0;
  left: 6px;
  z-index: 50;
}
.music-list .back .icon-back {
  display: block;
  padding: 10px;
  font-size: 22px;
  color: #ffcd32;
}

.music-list .title {
  position: absolute;
  top: 0;
  left: 10%;
  z-index: 40;
  width: 80%;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  text-align: center;
  line-height: 40px;
  font-size: 18px;
  color: #fff;
}

.music-list .bg-image {
  position: relative;
  width: 100%;
  height: 0;
  padding-top: 70%;
  transform-origin: top;
  background-size: cover;
}
.music-list .bg-image .play-wrapper {
  position: absolute;
  bottom: 20px;
  z-index: 50;
  width: 100%;
}
.music-list .bg-image .play-wrapper .play {
  box-sizing: border-box;
  width: 135px;
  padding: 7px 0;
  margin: 0 auto;
  text-align: center;
  border: 1px solid #ffcd32;
  color: #ffcd32;
  border-radius: 100px;
  font-size: 0;
}
.music-list .bg-image .play-wrapper .play .icon-play {
  display: inline-block;
  vertical-align: middle;
  margin-right: 6px;
  font-size: 16px;
}

.music-list .bg-image .play-wrapper .play .text {
  display: inline-block;
  vertical-align: middle;
  font-size: 12px;
}
.music-list .bg-image .filter {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(7, 17, 27, 0.4);
}
.music-list .bg-layer {
  position: relative;
  height: 100%;
  background: #222;
}
.music-list .list {
  position: fixed;
  top: 0;
  bottom: 0;
  width: 100%;
  background: #222;
}
.music-list .list .song-list-wrapper {
  padding: 20px 30px;
}

.music-list .list .loading-container {
  position: absolute;
  width: 100%;
  top: 50%;
  transform: translateY(-50%);
}
</style>