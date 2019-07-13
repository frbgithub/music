<template>
        <div class="slider" ref="slider">
          <div class="slider-group" ref="sliderGroup">
            <slot>
            </slot>
          </div>
          <div class="dots">
            <span class="dot" :class="{active: currentPageIndex === index }" v-for="(item, index) in dots"></span>
          </div>
        </div>
</template>
<script>
import BScroll from "better-scroll"
export default {
    name:"slider",
    data() {
      return {
        dots: [],
        currentPageIndex: 0 //索引
      }
    },
    props: {
        //轮播
        loop: {
            type: Boolean,
            default: true
        },
        //自动轮播
        autoPlay: {
            type: Boolean,
            default: true
        },
        //自动轮播间隔
        interval: {
            type: Number,
            default: 2000 
        }
    },
    mounted(){
        setTimeout(()=>{
           this._setSliderWidth()//设置宽度

           this._initDots()//轮播图圆点

           this._initSlider()//滚动方法
           if (this.autoPlay) { //自动轮播
              this._play()
            }
        },20)

        //监听窗口改变
        window.addEventListener('resize', () => {
        if (!this.slider) {
          return
        }
        this._setSliderWidth(true) //重置宽度
        this.slider.refresh()  //刷新
      })

    },
    deactivated() {
      clearTimeout(this.timer)
    },
    methods:{
        //设置每个图片的宽度
        _setSliderWidth() {
        //拿到每个img 元素
        this.children = this.$refs.sliderGroup.children
        let width = 0
        //轮播图宽度
        let sliderWidth = this.$refs.slider.clientWidth
        for (let i = 0; i < this.children.length; i++) {
          let child = this.children[i]
        //  addClass(child, 'slider-item')
          //为每个child 动态添加classname
          child.className = "slider-item"
          child.style.width = sliderWidth + 'px'
          width += sliderWidth
        }
        if (this.loop) {
          width += 2 * sliderWidth
        }
        //滑动元素的宽度
        this.$refs.sliderGroup.style.width = width + 'px'
      },

      //轮播圆点
      _initDots(){
        this.dots = new Array(this.children.length) 
      },
      //初始化滚动
      _initSlider() {
        this.slider = new BScroll(this.$refs.slider, {
          scrollX: true,
          scrollY: false,
          momentum: false,
          snap: {
            loop: this.loop, // 循环
            threshold: 0.3,
            speed: 400 // 轮播间隔
          },
          click:true
        })
        //滑动触发事件
        this.slider.on('scrollEnd', () => {
         let pageIndex = this.slider.getCurrentPage().pageX +1
          // console.log(pageIndex)
          if (this.loop) {
            pageIndex -= 1
          }
        //   console.log(pageIndex)
          this.currentPageIndex = pageIndex
          if (this.autoPlay) {
            clearTimeout(this.timer)
            this._play()
          }
        })
      },
      //自动轮播
      _play() {
        let pageIndex = this.currentPageIndex
        // console.log(pageIndex)
        if (this.loop) {
            pageIndex += 1
        }
        this.timer = setTimeout(() => {
          this.slider.goToPage(pageIndex, 0, 400)
        }, this.interval)
      }
    }
}
</script>
<style scoped lang="stylus" rel="stylesheet/stylus">
    /* @import "~common/stylus/variable" */
.slider{
       min-height: 1px;
       position: relative;
    }
      
.slider .slider-group{
        position: relative;
        overflow: hidden;
        white-space: nowrap;
      }
        
.slider .slider-group .slider-item{
          float: left;
          box-sizing: border-box;
          overflow: hidden;
          text-align: center
    }
          
.slider .slider-group .slider-item  a{
            display: block;
            width: 100%;
            overflow: hidden;
            text-decoration: none
    }
            
.slider .slider-group .slider-item  a img{
            display: block;
            width: 100%
    }
            
.slider .dots{
        position: absolute;
        right: 0;
        left: 0;
        bottom: 12px;
        text-align: center;
        font-size: 0
      }
        
.slider .dots .dot{
          display: inline-block;
          margin: 0 4px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.5)  
        }
.slider .dots  .active{
            width: 20px;
            border-radius: 5px;
            background: rgba(255, 255, 255, 0.8)
          }
            
  </style>