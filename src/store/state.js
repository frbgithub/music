import {playMode} from 'common/js/config'
import {loadSearch} from 'common/js/cache'
const state = {
    singer: {}, //歌手信息
    playing: false, //播放状态
    fullScreen: false, //播放器展开收起
    playlist: [], //播放列表
    sequenceList: [], //原始播放列表
    mode: playMode.sequence, //播放模式
    currentIndex: -1, //播放索引
    disc: {},   //歌单信息
    topList: {}, //排行榜列表
    searchHistory:loadSearch() //搜索历史
    
  }
  
 export default state