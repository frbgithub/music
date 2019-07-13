<template>
    <div ref="wrapper">
      <slot></slot>
    </div>
  </template>
  
  <script>
    import BScroll from 'better-scroll'
    export default {
      props: {
        probeType: {
          type: Number,
          default: 1
        },
        //是否阻止点击事件
        click: {
          type: Boolean,
          default: true
        },
        //渲染的数据
        data: {
          type: Array,
          default: null
        },
        //是否监听滚动事件
        listenScroll:{
          type:Boolean,
          default:false
        },
        //是否上拉刷新
        pullup: {
          type: Boolean,
          default: false
       },
       //监听开始滚动
       beforeScroll: {
        type: Boolean,
        default: false
      }
      },
      mounted() {
        setTimeout(() => {
          this._initScroll()
        }, 20)
      },
      methods: {
        //初始化
        _initScroll() {
          if (!this.$refs.wrapper) {
            return
          }
          this.scroll = new BScroll(this.$refs.wrapper, {
            probeType: this.probeType,
            click: this.click
          })
          //监听滚动事件
          if (this.listenScroll) {
            let me = this
            this.scroll.on('scroll', (pos) => {
              me.$emit('scroll', pos)
            })
          }
          //上拉加载
          if (this.pullup) {
            this.scroll.on('scrollEnd', () => {
              if (this.scroll.y <= (this.scroll.maxScrollY + 50)) {
                this.$emit('scrollToEnd')
              }
            })
          }
          //监听开始滚动
          if (this.beforeScroll) {
            this.scroll.on('beforeScrollStart', () => {
              this.$emit('beforeScroll')
            })
          } 
        },
        enable() {
          this.scroll && this.scroll.enable()
        },
        disable() {
          this.scroll && this.scroll.disable()
        },
        //重新刷新 重新计算高度
        refresh() {
          this.scroll && this.scroll.refresh()
        },
        //滚动到相应的位置
        scrollTo() {
        this.scroll && this.scroll.scrollTo.apply(this.scroll, arguments)
        },
        scrollToElement() {
          this.scroll && this.scroll.scrollToElement.apply(this.scroll, arguments)
        }
      },
      //监听数据变化
      watch: {
        data() {
          setTimeout(() => {
            this.refresh()
          }, 20)
        }
      }
    }
  </script>
  
  <style scoped lang="stylus" rel="stylesheet/stylus">

  </style>