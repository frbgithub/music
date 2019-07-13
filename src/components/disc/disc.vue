<template>
    <transition name="slide">
            <music-list :title="title" :bg-image="bgImage" :songs="songs"></music-list>
    </transition>
</template>
<script>
    import MusicList from 'components/music-list/music-list'
    import {getSongList} from 'api/recommend'
    import {createSong,isValidMusic,processSongsUrl} from 'common/js/song'
    import {ERR_OK} from 'api/config'
    import {mapGetters} from 'vuex'
    export default {
        data() {
            return {
                songs: []
            }
        },
        created() {
          this._getSongList()
        },
        components:{
         MusicList
        },
        methods:{
            //歌单详情数据获取
            _getSongList() {
                if (!this.disc.dissid) {
                    this.$router.push('/recommend')
                    return
                }
                getSongList(this.disc.dissid).then((res) => {
                    if (res.code === ERR_OK) {
                        processSongsUrl(this._normalizeSongs(res.cdlist[0].songlist)).then((songs) => {
                          this.songs = songs
                        })
                    }
                })
            },
            //数据处理
            _normalizeSongs(list) {
                let ret = []
                list.forEach((musicData) => {
                if (musicData.songid && musicData.albummid) {
                    ret.push(createSong(musicData))
                }
                })
                return ret
            }
        },
        computed:{
            title() {
                return this.disc.dissname
            },
            bgImage() {
                return this.disc.imgurl
            },
            ...mapGetters([
                'disc'
            ])
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
  