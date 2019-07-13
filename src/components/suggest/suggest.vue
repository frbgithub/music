<template>
<Scroll class="suggest"
        @scrollToEnd="searchMore"
        :beforeScroll="beforeScroll"
        @beforeScroll="listScroll"
        :data="result"
        :pullup="pullup"
         ref="suggest"
        >
    <ul class="suggest-list">
        <li @click="selectItem(item)" class="suggest-item" v-for="item in result">
            <div class="icon">
                <i :class="getIconCls(item)"></i>
            </div>
            <div class="name">
                <p class="text"  v-html="getDisplayName(item)"></p>
            </div>
        </li>
        <loading v-show="hasMore" title=""></loading>
    </ul>
    <div class="no-result-wrapper" v-show="!hasMore && !result.length">
        <no-result title="抱歉，暂无搜索结果"></no-result>
    </div>
</Scroll> 
</template>
<script>
    import Scroll from 'base/scroll/scroll'
    import Loading from 'base/loading/loading'
    import NoResult from 'base/no-result/no-result'
    import {search} from 'api/search'
    import {ERR_OK} from 'api/config'
    import { createSong,processSongsUrl } from 'common/js/song'
    import {mapMutations, mapActions} from 'vuex'
    import Singer from 'common/js/singer' 


     const TYPE_SINGER = 'singer'
     const perpage = 20  //每页20条歌曲
    export default {
        props: {
            showSinger: {
                type: Boolean,
                default: true
            },
            query: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                page: 1, //请求页数
                pullup: true, //上拉刷新
                beforeScroll: true, //监听开始滚动
                hasMore: true, //加载
                result: []
            }   
        },
        methods:{
            //数据搜索请求
            search() {
                this.page = 1 //默认请求第一页
                this.hasMore = true 
                this.$refs.suggest.scrollTo(0, 0) //滚到顶部
                search(this.query, this.page, this.showSinger, perpage).then((res) => {
                    if (res.code === ERR_OK) {
                        this._genResult(res.data).then((result) => {
                           this.result = result
                        //    console.log(this.result)
                        })
                        this._checkMore(res.data)  //判断是否加载完成
                    }
                })
            },
            //对数据处理
            _genResult(data) {
                let ret = []
                if (data.zhida && data.zhida.singerid && this.page === 1) {
                  ret.push({...data.zhida, ...{type: TYPE_SINGER}})
                }
                return processSongsUrl(this._normalizeSongs(data.song.list)).then((songs) => {
                  ret = ret.concat(songs)
                  return ret
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
            },
            //判断是否全部加载完成
           _checkMore(data) {
                const song = data.song
                if (!song.list.length || (song.curnum + song.curpage * perpage) > song.totalnum) {
                   this.hasMore = false
                }
            },
            //图标
            getIconCls(item) {
                if (item.type === TYPE_SINGER) {
                  return 'icon-mine'
                } else {
                   return 'icon-music'
                }
            
            },
            //歌手 歌名
            getDisplayName(item) {
                if (item.type === TYPE_SINGER) {
                 return item.singername
                } else {
                 return `${item.name}-${item.singer}`
                }
            },
            //上拉加载歌曲
            searchMore(){
                if (!this.hasMore) {  //如果加载完成
                  return
                }
                this.page++
                //歌曲请求
                search(this.query, this.page, this.showSinger, perpage).then((res) => {
                    if (res.code === ERR_OK) {
                        this._genResult(res.data).then((result) => {
                           this.result = this.result.concat(result)
                        })
                        this._checkMore(res.data)   //this.hasMore ==flass
                    }
                })  
            },
            selectItem(item) {
                if (item.type === TYPE_SINGER) {  //如果点击的是歌手
                    const singer = new Singer({
                        id: item.singermid,
                        name: item.singername
                    })
                    this.$router.push({
                        path: `/search/${singer.id}` //跳转到歌手详情页
                    })
                    this.setSinger(singer)   //更新歌手信息
                } else {      
                  //如歌点击的是歌曲，则播放列表插入歌曲           
                  this.insertSong(item)
                }
                this.$emit('select', item)
            },
            listScroll() { //开始滚动时触发
                this.$emit('listScroll')
            },
            ...mapMutations({
                setSinger: 'SET_SINGER'
            }),
            ...mapActions([
                'insertSong'
            ])
        },
        components:{
          Loading,
          Scroll,
          NoResult
        },
        watch:{
            query(newQuery) {
              this.search()
            }  
        }
    }
</script>
<style scoped>
    .suggest{
        height: 100%;
    overflow: hidden
    }
    
    .suggest .suggest-list{
        padding: 0 30px
    }
     
    .suggest .suggest-list .suggest-item{
        display: flex;
        align-items: center;
        padding-bottom: 20px
      }
        
    .suggest .suggest-list .suggest-item .icon{
        flex: 0 0 30px;
        width: 30px;
        font-size: 14px;
        color: rgba(255, 255, 255, 0.3)
      }
       
        
    .suggest .suggest-list .suggest-item .name{
        flex: 1;
        font-size: 14px;
        color: rgba(255, 255, 255, 0.3);
        overflow: hidden
      }
        
      .suggest .suggest-list .suggest-item .name .text{
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
        }
          
    .suggest .no-result-wrapper{
      position: absolute;
      width: 100%;
      top: 50%;
      transform: translateY(-50%)
    }
      
</style>