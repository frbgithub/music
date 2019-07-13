<template>
<transition name="slide">
    <music-list class="singer-detail" :title="title" :bg-image="bgImage" :songs="songs"></music-list>
</transition>
</template>
<script>
  import {mapGetters} from 'vuex'
  import {getSingerDetail} from 'api/singer'
  import {ERR_OK} from 'api/config'
  import { createSong, processSongsUrl } from 'common/js/song'
  import  MusicList from '@/components/music-list/music-list'
  export default{
      data(){
          return{
            songs:[]
          }
      },
      created() {
      this._getDetail()
      },
      methods:{
        _getDetail() {
        //如果获取不到歌手id 跳转待歌手页面
        if (!this.singer.id) {
          this.$router.push('/singer')
          return
        }
        //获取歌手歌曲
        getSingerDetail(this.singer.id)
        .then((res) => {
         if (res.code === ERR_OK) {
            processSongsUrl(this._normalizeSongs(res.data.list))
            .then((songs) => {
              this.songs = songs
            //console.log(this.songs)
            })
          }
        })
      },
      //数据处理
      _normalizeSongs(list) {
        let ret = []
        list.forEach((item) => {
          let {musicData} = item
          if (musicData.songid && musicData.albummid) {
            ret.push(createSong(musicData))
          }
        })
        return ret
      }
      },
      computed:{
        // singer(){
        //     return this.$store.getters.singer
        // },
        title() {
            return this.singer.name
        },
        bgImage() {
            return this.singer.avatar
        },
        ...mapGetters([
            'singer'
        ])
      },
      components:{
        MusicList 
      }
  }
</script>
<style scoped>
  .slide-enter-active, .slide-leave-active{
    transition: all 0.3s 
  }
   
  .slide-enter, .slide-leave-to{
    transform: translate3d(100%, 0, 0)
  }
   
</style>