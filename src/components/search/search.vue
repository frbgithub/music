<template>
  <div class="search">
      <div class="search-box-wrapper">
          <search-box ref="searchBox" @query="onQueryChange"></search-box>
      </div>
      <Scroll :data="shortcut" ref="shortcutWrapper" class="shortcut-wrapper" v-show="!query">
        <div>
          <!--热门搜索 -->
          <div class="hot-key">
              <h1 class="title">热门搜索</h1>
              <ul>
                <li @click="addQuery(item.k)" class="item" v-for="item in hotKey">
                  <span>{{item.k}}</span>
                </li>
              </ul>
          </div>
          <!-- 搜索历史 -->
          <div class="search-history" v-show="searchHistory.length">
            <h1 class="title">
              <span class="text">搜索历史</span>
              <span @click="deleteAll" class="clear">
                <i class="icon-clear"></i>
              </span>
            </h1>
            <search-list @delete="deleteSearchHistory" @select="addQuery" :searches="searchHistory"></search-list>
          </div>
        </div>
      </Scroll>
      <!-- 搜索歌曲结果 -->
      <div class="search-result" v-show="query" ref="searchResult">
          <suggest ref="suggest" :query="query" @listScroll="blurInput" @select="saveSearch"></suggest>
      </div>
      <router-view></router-view>
  </div>
</template>

<script>
  import SearchBox from 'base/search-box/search-box'
  import Suggest from 'components/suggest/suggest'
  import SearchList from 'base/search-list/search-list'
  import Scroll from 'base/scroll/scroll' 
  import {getHotKey} from 'api/search'
  import {ERR_OK} from 'api/config'
  import {mapGetters, mapActions} from 'vuex'
  export default {
    data(){
      return {
        hotKey:[],
        query: ''
      }
    },
    created() {
      this._getHotKey()
    },
    mounted() {
      this.handlePlayList(this.playlist) //设置滚动组件bottom
    },
    
    activated() {
      this.handlePlayList(this.playlist) //设置滚动组件bottom
    },
    computed:{
        shortcut() {
          return this.hotKey.concat(this.searchHistory)
        },
       ...mapGetters([
         'searchHistory', //搜索历史获取
         'playlist' //播放列表
       ])
    },
    methods:{
      _getHotKey() { //热门搜索数据
        getHotKey().then((res) => {
          if (res.code === ERR_OK) {
            this.hotKey = res.data.hotkey.slice(0, 10)
            // console.log(this.hotKey)
          }
        })
      },
      onQueryChange(query) {
        this.query = query
      },
      addQuery(query) {  //添加搜索关键字
        this.$refs.searchBox.setQuery(query)
      },
      blurInput(){  //失去焦点
        this.$refs.searchBox.blur()
      },
      saveSearch(){  //保存搜索历史
        this.saveSearchHistory(this.query)
      },
      deleteSearchHistory(item){  //删除搜索历史
        this.saveSearchHistory(item)
      },
      deleteAll(){  //清空搜索历史
       this.clearSearchHistory()
      },
      handlePlayList(playlist){
          const bottom =  playlist.length > 0? '60px': ''
          this.$refs.shortcutWrapper.$el.style.bottom = bottom
          this.$refs.searchResult.style.bottom =  bottom
          this.$refs.shortcutWrapper.refresh()
      },
      ...mapActions([
        'saveSearchHistory',
        'deleteSearchHistory',
        'clearSearchHistory'
      ])
    },
    watch:{
      query() {
          setTimeout(() => {
            this.$refs.shortcutWrapper.refresh()
          }, 20)
      },
      playlist(newPlaylist) {
          this.handlePlayList(newPlaylist)
      }
    },
    components:{
      SearchBox,
      Suggest,
      SearchList,
      Scroll
    }
  }
</script>

<style scoped>
  .search{

  }
    .search-box-wrapper{
      margin: 20px;
    }
      
    .shortcut-wrapper{
      overflow: hidden;
      position: fixed;
      top: 178px;
      bottom: 0;
      width: 100%
    }
      
      .shortcut{
        height: 100%;
        overflow: hidden
      }
        
        .hot-key{
          margin: 0 20px 20px 20px
        }
          
          .title{
            margin-bottom: 20px;
            font-size: 14px;
            color: rgba(255, 255, 255, 0.5)
          }
           
          .item{
            display: inline-block;
            padding: 5px 10px;
            margin: 0 20px 10px 0;
            border-radius: 6px;
            background: #333;
            font-size: 14px;
            color: rgba(255, 255, 255, 0.3)
          }
        .search-history{
          position: relative;
          margin: 0 20px
        }
         
          .title{
            display: flex;
            align-items: center;
            height: 40px;
            font-size: 14px;
            color: rgba(255, 255, 255, 0.5)
          }
            
            .text{
              flex: 1
            }
              
            .clear{
              position: relative;
              
            }
            .clear:before{
                content: '';
                position: absolute;
                top: -10px;
                left: -10px;
                right: -10px;
                bottom: -10px
            }
                
            
              
              .icon-clear{
                font-size: 14px;
                color: rgba(255, 255, 255, 0.3)
              }
                
    .search-result{
      position: fixed;
      width: 100%;
      top: 178px;
      bottom: 0
    }
      
</style>