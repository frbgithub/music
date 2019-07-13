import * as types from './mutation-types'
import {
  playMode
} from 'common/js/config'
import {
  shuffle
} from 'common/js/util'
import {
  saveSearch,
  clearSearch,
  deleteSearch
} from 'common/js/cache'

function findIndex(list, song) {
  return list.findIndex((item) => {
    return item.id === song.id
  })
}

export const selectPlay = function ({
  commit,
  state
}, {
  list,
  index
}) {
  commit(types.SET_SEQUENCE_LIST, list) //顺序播放
  if (state.mode === playMode.random) { //如果是随机播放模式
    let randomList = shuffle(list) //随机播放歌曲列表
    commit(types.SET_PLAYLIST, randomList) //改变为随机播放列表
    index = findIndex(randomList, list[index]) //找到当前点击播放歌曲在随机播放歌曲列表中的索引
  } else {
    commit(types.SET_PLAYLIST, list)
  }
  commit(types.SET_CURRENT_INDEX, index) //播放索引
  commit(types.SET_FULL_SCREEN, true) //播放器展开收起
  commit(types.SET_PLAYING_STATE, true) //播放状态
}

//随机播放
export const randomPlay = function ({
  commit
}, {
  list
}) {
  commit(types.SET_PLAY_MODE, playMode.random) //随机播放模式
  commit(types.SET_SEQUENCE_LIST, list) //原始播放列表
  let randomList = shuffle(list) //随机播放列表
  commit(types.SET_PLAYLIST, randomList) //随机播放列表
  commit(types.SET_CURRENT_INDEX, 0) //从第一首开始播放
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true) //播放状态
}
//插入歌曲
export const insertSong = function ({
  commit,
  state
}, song) {

  //播放列表
  let playlist = state.playlist.slice()
  let currentIndex = state.currentIndex
  // 记录当前歌曲
  let currentSong = playlist[currentIndex]
  // 查找当前列表中是否有待插入的歌曲并返回其索引
  let fpIndex = findIndex(playlist, song)
  // 因为是插入歌曲，所以索引+1
  currentIndex++
  // 插入这首歌到当前索引位置
  playlist.splice(currentIndex, 0, song)
  // 如果已经包含了这首歌
  if (fpIndex > -1) {
    // 如果当前插入的序号大于列表中的序号
    if (currentIndex > fpIndex) { //如果插入位置在插入这首歌后面
      playlist.splice(fpIndex, 1)
      currentIndex--
    } else {
      playlist.splice(fpIndex + 1, 1)
    }
  }
  //原始列表
  let sequenceList = state.sequenceList.slice()
  let currentSIndex = findIndex(sequenceList, currentSong) + 1
  // 查找当前列表中是否有待插入的歌曲并返回其索引
  let fsIndex = findIndex(sequenceList, song)

  sequenceList.splice(currentSIndex, 0, song)

  if (fsIndex > -1) {
    if (currentSIndex > fsIndex) {
      sequenceList.splice(fsIndex, 1)
    } else {
      sequenceList.splice(fsIndex + 1, 1)
    }
  }

  commit(types.SET_PLAYLIST, playlist)
  commit(types.SET_SEQUENCE_LIST, sequenceList)
  commit(types.SET_CURRENT_INDEX, currentIndex)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}
//搜索历史信息存入本地
export const saveSearchHistory = function ({
  commit
}, query) {
  commit(types.SET_SEARCH_HISTORY, saveSearch(query))
}
//删除搜索历史信息
export const deleteSearchHistory = function ({
  commit
}, query) {
  commit(types.SET_SEARCH_HISTORY, deleteSearch(query))
}
//清空搜索历史信息
export const clearSearchHistory = function ({
  commit
}) {
  commit(types.SET_SEARCH_HISTORY, clearSearch())
}
