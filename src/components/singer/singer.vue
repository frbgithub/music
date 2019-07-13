<template>
  <div class="singer" ref="singer">
   <list-view @select="selectSinger" :data="singers" ref="list"></list-view>
   <router-view></router-view>
  </div>
</template>

<script>
  import {getSingerList} from 'api/singer'
  import {ERR_OK} from 'api/config'
  import ListView from 'base/listview/listview'
  import {mapMutations,mapGetters} from 'vuex'
  const HOT_SINGER_LEN = 10
  const HOT_NAME = '热门'
  export default{
    data(){
      return{
        singers: []
      }
    },
    created() {
      this._getSingerList()
    },
    mounted() {
      this.handlePlayList(this.playlist) //设置滚动组件bottom
    },
    
    activated() {
      this.handlePlayList(this.playlist) //设置滚动组件bottom
    },
    components:{
      ListView
    },
    computed:{
      ...mapGetters([
          'playlist', //播放列表
      ])
    },
    methods:{
      _getSingerList() {
        getSingerList().then((res) => {
          if (res.code === ERR_OK) {
            this.singers = this._normalizeSinger(res.data.list)
            // console.log(this.singers)
          }
        })
      },
      //数据归类
      _normalizeSinger(list) {
        let map = {
          //热门歌手
          hot: {
            title: HOT_NAME,
            items: []
          }
        }

        list.forEach((item, index) => {
          if (index < HOT_SINGER_LEN) {
            map.hot.items.push({
              name: item.Fsinger_name,
              id: item.Fsinger_mid,
              avatar : `https://y.gtimg.cn/music/photo_new/T001R300x300M000${item.Fsinger_mid}.jpg?max_age=2592000`
            })
          }
          //排列A-Z
          const key = item.Findex
          if (!map[key]) {  //查看是否拥有属性 没有添加属性
            map[key] = {
              title: key,
              items: []
            }
          }
          map[key].items.push({ //有属性，往属性里添加一个对象
            name: item.Fsinger_name,
            id: item.Fsinger_mid,
            avatar : `https://y.gtimg.cn/music/photo_new/T001R300x300M000${item.Fsinger_mid}.jpg?max_age=2592000`
          })
        })
        
        //处理 map
        let ret = [] //A-Z
        let hot = [] //热门歌手
        for (let key in map) {
          let val = map[key]
          if (val.title.match(/[a-zA-Z]/)) {
            ret.push(val)
          } else if (val.title === HOT_NAME) {
            hot.push(val)
          }
        }
        //排序
        ret.sort((a, b) => {
          return a.title.charCodeAt(0) - b.title.charCodeAt(0)
          })
        //合并数组返回
        return hot.concat(ret)
      },  
      //跳转歌手详情页
      selectSinger(singer){
         this.$router.push({
           path:`/singer/${singer.id}`
         })
        // this.$store.commit('SET_SINGER',singer)
        this.setSinger(singer)
      },
      //vuex 映射
      ...mapMutations({
        setSinger:"SET_SINGER"
      }),
      handlePlayList(playlist){
          const bottom =  playlist.length > 0? '60px': ''
          this.$refs.singer.style.bottom = bottom
          this.$refs.list.refresh()
      }
    },
    watch:{
      playlist(newPlaylist) {
          this.handlePlayList(newPlaylist)
      }
    },
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
 .singer{
  position: fixed;
    top: 88px;
    bottom: 0;
    width: 100%
 }
    
</style>
