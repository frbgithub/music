export const singer = state => state.singer  //歌手信息

export const playing = state => state.playing  //播放状态

export const fullScreen = state => state.fullScreen  //播放器展开收起

export const playlist = state => state.playlist  //播放列表

export const sequenceList = state => state.sequenceList //顺序播放

export const mode = state => state.mode //播放模式

export const currentIndex = state => state.currentIndex //播放索引

export const currentSong = (state) => {
    return state.playlist[state.currentIndex] || {}   //当前播放的歌曲信息
}
export const disc = state => state.disc //歌单信息

export const topList = state => state.topList //排行榜列表

export const searchHistory = state => state.searchHistory //搜索历史
