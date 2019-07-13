<template>
        <scroll
        :data="data"
        class="listview"
        :listen-scroll="listenScroll"
        :probe-type="probeType"
        ref="listview"
        @scroll="scroll">
        <ul>
            <li v-for="group in data" class="list-group" ref="listGroup">
                <h2 class="list-group-title">{{group.title}}</h2>
                <uL>
                <li @click="selectItem(item)" v-for="item in group.items" class="list-group-item">
                    <img class="avatar" v-lazy="item.avatar">
                    <span class="name">{{item.name}}</span>
                </li>
                </uL>
            </li>
        </ul>
        <div class="list-shortcut" @touchstart.stop.prevent="onShortcutTouchStart" @touchmove.stop.prevent="onShortcutTouchMove"> 
            <ul>
                <li v-for="(item, index) in shortcutList"
                    :data-index="index"
                    @click="onShortcutTouchStart(index)"
                    class="item"
                    :class="{'current':currentIndex===index}">{{item}}
                </li>
            </ul>
        </div>
        <div class="list-fixed" ref="fixed" v-show="fixedTitle">
            <div class="fixed-title">{{fixedTitle}} </div>
        </div>
        </scroll>
</template>
<script>
  import Scroll from 'base/scroll/scroll'
  import {getData} from 'common/js/dom'
  const ANCHOR_HEIGHT = 18
  export default {
    data() {
      return {
        scrollY: -1,
        currentIndex: 0,
      }
    },
    props: {
        data: {
            type: Array,
            default: []
        }
     },
     created() {
        this.probeType = 3
        this.listenScroll = true //是否监听滚动事件
        this.touch = {} //手指滑动
        this.listHeight = [] //每个分类列表的高度
     },
     computed: {
      //右侧列表数据
      shortcutList() {
        return this.data.map((group) => {
          return group.title.substr(0, 1)
        })
      },
      //标题
      fixedTitle() {
        if (this.scrollY > 0) {
          return ''
        }
        return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
      }
    },
    methods:{
        selectItem(item){
          this.$emit('select',item)
        },
        //滑动方法
        onShortcutTouchStart(e) {
        // let anchorIndex = e.target.getAttribute("data-index")
        let anchorIndex = getData(e.target, 'index')
        // console.log(anchorIndex)
        //滚动的相应的位置
        this.$refs.listview.scrollToElement(this.$refs.listGroup[anchorIndex], 0)
        //获取手指滑动过的位置的Y值
        let firstTouch = e.touches[0]
        this.touch.y1 = firstTouch.pageY
        this.touch.anchorIndex = anchorIndex
        this._scrollTo(anchorIndex)
      },
      onShortcutTouchMove(e) {
        let firstTouch = e.touches[0]
        this.touch.y2 = firstTouch.pageY
        let delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0
        let anchorIndex = parseInt(this.touch.anchorIndex) + delta
        this._scrollTo(anchorIndex)
      },
      //滚动的位置
      scroll(pos) {
        this.scrollY = pos.y
        // console.log(this.scrollY)
      },
      //计算每个分类列表高度方法
      _calculateHeight() {
        this.listHeight = []
        const list = this.$refs.listGroup
        let height = 0
        this.listHeight.push(height)
        for (let i = 0; i < list.length; i++) {
          let item = list[i]
          height += item.clientHeight
          this.listHeight.push(height)
        }
      },
      //滚动到指定位置方法
      _scrollTo(index) {
        if (!index && index !== 0) {
          return
        }
        if (index < 0) {
          index = 0
        } else if (index > this.listHeight.length - 2) {
          index = this.listHeight.length - 2
        }
        this.scrollY = -this.listHeight[index]
        this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0)
      },
      refresh(){
        this.$refs.listview.refresh()
      }
    },
    //监听
    watch: {
        //监听data
        data() {
            setTimeout(() => {
            this._calculateHeight()
            }, 20)
       },
       //监听scrollY
       scrollY(newY) {
        const listHeight = this.listHeight
        // 当滚动到顶部，newY>0
        if (newY > 0) {
          this.currentIndex = 0
          return
        }
        // 在中间部分滚动
        for (let i = 0; i < listHeight.length - 1; i++) {
          let height1 = listHeight[i]
          let height2 = listHeight[i + 1]
          if (-newY >= height1 && -newY < height2) {
            this.currentIndex = i
            // console.log(this.currentIndex)
            return
          }
        }
        // 当滚动到底部，且-newY大于最后一个元素的上限
        // this.currentIndex = listHeight.length - 2
      },
     },
    components:{
        Scroll
     }
  }
</script>
<style scoped>
   .listview{
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: #222
   }
    
   .listview .list-group{
       padding-bottom: 30px
    }
     
    .listview .list-group  .list-group-title{
        height: 30px;
        line-height: 30px;
        padding-left: 20px;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.5);
        background: #333;
      }
        
      .listview .list-group  .list-group-item{
        display: flex;
        align-items: center;
        padding: 20px 0 0 30px
      }
        
    .listview .list-group  .list-group-item   .avatar{
          width: 50px;
          height: 50px;
          border-radius: 50%;
        }
          
    .listview .list-group  .list-group-item  .name{
          margin-left: 20px;
          color: rgba(255, 255, 255, 0.5);
          font-size: 16px
        }
          
    .listview .list-shortcut{
        position: absolute;
        z-index: 30;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 20px;
        padding: 20px 0;
        border-radius: 10px;
        text-align: center;
        background: rgba(0, 0, 0, 0.3);
        font-family: Helvetica
    }
     
    .listview .list-shortcut  .item{
        padding: 3px;
        line-height: 1;
        color: rgba(255, 255, 255, 0.5);
        font-size: 12px;
      }
        
      .listview .list-shortcut .current{
        color: #ffcd32
      }
          
    .list-fixed{
      position: absolute;
      top: 0;
      left: 0;
      width: 100%
    }
      
      .fixed-title{
        height: 30px;
        line-height: 30px;
        padding-left: 20px;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.5);
        background:#333
      }
        
    .loading-container{
        position: absolute;
        width: 100%;
        top: 50%;
        transform: translateY(-50%)
    }
     
</style>