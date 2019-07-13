<template>
  <div class="rank" ref="rank">
    <scroll :data="topList" class="toplist" ref="toplist">
      <ul>
        <li @click="selectItem(item)" class="item" v-for="item in topList">
          <div class="icon">
            <img width="100" height="100" v-lazy="item.picUrl" />
          </div>
          <ul class="songlist">
            <li class="song" v-for="(song,index) in item.songList">
              <span>{{index + 1}}</span>
              <span>{{song.songname}}-{{song.singername}}</span>
            </li>
          </ul>
        </li>
      </ul>
      <div class="loading-container" v-show="!topList.length">
        <loading></loading>
      </div>
    </scroll>
    <router-view></router-view>
  </div>
</template>

<script>
  import Scroll from 'base/scroll/scroll'
  import Loading from 'base/loading/loading'
  import {getTopList} from 'api/rank'
  import {ERR_OK} from 'api/config'
  import { mapMutations , mapGetters} from 'vuex'
  export default {
    data() {
      return {
        topList: []
      }
    },
    created() {
      this._getTopList() //获取排行榜列表
    },
    activated(){
      this.handlePlayList(this.playlist) //设置滚动组件bottom
    },
    mounted() {
      this.handlePlayList(this.playlist) //设置滚动组件bottom
    },
    methods:{
      _getTopList() {  //获取排行榜列表数据
        getTopList().then((res) => {
          if (res.code === ERR_OK) {
            this.  = res.data.topList
          }
        })
      },
      selectItem(item) {
        this.$router.push({
          path: `/rank/${item.id}`
        })
        this.setTopList(item)
      },
      ...mapMutations({
        setTopList: 'SET_TOP_LIST'
      }),
      handlePlayList(playlist){
        const bottom =  playlist.length > 0? '60px': ''
        this.$refs.rank.style.bottom = bottom
        this.$refs.toplist.refresh()
      }
    },
    computed:{
      ...mapGetters([
          'playlist', //播放列表
      ])
    },
    components: {
      Scroll,
      Loading
    },
    watch: {
      playlist(newPlaylist) {
        this.handlePlayList(newPlaylist)
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
.rank {
  position: fixed;
  width: 100%;
  top: 88px;
  bottom: 0;
  padding-bottom: 20px;
}

.rank .toplist {
  height: 100%;
  overflow: hidden;
}

.rank .toplist .item {
  display: flex;
  margin: 0 20px;
  padding-top: 20px;
  height: 100px;
}

.rank .toplist:last-child {
}

.rank .toplist .item .icon {
  flex: 0 0 100px;
  width: 100px;
  height: 100px;
}

.rank .toplist .item .songlist {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 20px;
  height: 100px;
  overflow: hidden;
  background: #333;
  color: rgba(255, 255, 255, 0.3);
  font-size: 12px;
}

.rank .toplist .item .songlist .song {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  line-height: 26px;
}

.rank .toplist .loading-container {
  position: absolute;
  width: 100%;
  top: 50%;
  transform: translateY(-50%);
}
</style>