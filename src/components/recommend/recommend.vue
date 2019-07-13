<template>
  <div class="recommend" ref="recommend">
    <Scroll ref="scroll" class="recommend-content" :data="discList">
      <div>
        <div v-if="recommends.length" class="slider-wrapper" ref="sliderWrapper">
          <slider>
            <div v-for="item in recommends">
              <a :href="item.linkUrl">
                <img class="needsclick" @load="loadImage" :src="item.picUrl">
              </a>
            </div>
          </slider>
        </div>
        <div class="recommend-list">
          <h1 class="list-title">热门歌单推荐</h1>
          <ul>
            <li @click="selectItem(item)" v-for="(item,index) in discList" class="item" :key="index">
              <div class="icon">
                <img width="60" height="60" v-lazy="item.imgurl">
              </div>
              <div class="text">
                <h2 class="name" v-html="item.creator.name"></h2>
                <p class="desc" v-html="item.dissname"></p>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div class="loading-container" v-show="!discList.length">
        <loading></loading>
      </div>
    </Scroll>
    <router-view></router-view>
  </div>
</template>

<script>
  import {getRecommend, getDiscList} from 'api/recommend'
  import {mapGetters,mapMutations} from 'vuex'
  import Loading from 'base/loading/loading'
  import Slider from 'base/slider/slider'
  import Scroll from 'base/scroll/scroll'
  import {ERR_OK} from 'api/config'
  import axios from 'axios'
  export default {
    data(){
      return{
        recommends:[],//轮播图数据
        discList: [] //热门歌单列表数据
      }
    },
    created() {
      this._getRecommend()
      setTimeout(()=>{
        this._getDiscList()
      },1000)
      
    },
    mounted() {
      this.handlePlayList(this.playlist) //设置滚动组件bottom
    },
    
    activated() {
      this.handlePlayList(this.playlist) //设置滚动组件bottom
    },
    components:{
      Slider,
      Scroll,
      Loading
    },
    computed:{
      ...mapGetters([
          'playlist', //播放列表
      ])
    },
    methods:{
      //获取轮播图
      _getRecommend() {
        getRecommend().then((res) => {
          if (res.code === ERR_OK) {
            // console.log(res.data.slider)
            this.recommends = res.data.slider
          }
        })
      },
      _getDiscList() { //获取歌单列表
        getDiscList().then((res) => {
          // console.log(res.data) 
          if (res.code === ERR_OK) {
            // console.log(res.data)
            this.discList = res.data.list
          }
        })
      },
      //轮播图片加载后refresh()
      loadImage() {
        if (!this.checkloaded) {
          this.checkloaded = true
          this.$refs.scroll.refresh()
        }
      },
      handlePlayList(playlist){  //设置bottom值
          const bottom =  playlist.length > 0? '60px': ''
          this.$refs.recommend.style.bottom = bottom
          this.$refs.scroll.refresh()
      },
      selectItem(item){
        this.$router.push({
          path:`/recommend/${item.dissid}`
        })
        this.setDisc(item) //歌单信息存入vuex
      },
      ...mapMutations({
        setDisc:'SET_DISC'
      })
    },
    watch:{
      playlist(newPlaylist) {
          this.handlePlayList(newPlaylist)
      }
    },
  }  

</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
.recommend {
  position: fixed;
  width: 100%;
  top: 88px;
  bottom: 0;
}

.recommend .recommend-content {
  height: 100%;
  overflow: hidden;
}

.recommend .recommend-content .slider-wrapper {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.recommend .recommend-list .list-title {
  height: 65px;
  line-height: 65px;
  text-align: center;
  font-size: 16px;
  color: #ffcd32;
}

.recommend .recommend-list .item {
  display: flex;
  box-sizing: border-box;
  align-items: center;
  padding: 0 20px 20px 20px;
}

.recommend .recommend-list .item .icon {
  flex: 0 0 60px;
  width: 60px;
  padding-right: 20px;
}

.recommend .recommend-list .item .text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
  line-height: 20px;
  overflow: hidden;
  font-size: 14px;
}

.recommend .recommend-list .item .name {
  margin-bottom: 10px;
  color: #fff;
}

.recommend .recommend-list .item .desc {
  color: rgba(255, 255, 255, 0.3);
}

.loading-container {
  position: absolute;
  width: 100%;
  top: 50%;
  transform: translateY(-50%);
}
</style>