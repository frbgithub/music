<template>
    <div class="progress-bar" ref="progressBar" @click="progressClick">
        <div class="bar-inner">
            <div class="progress" ref="progress"></div>
            <div class="progress-btn-wrapper" ref="progressBtn" @touchstart.prevent="progressTouchStart" @touchmove.prevent="progressTouchMove" @touchend="progressTouchEnd">
                <div class="progress-btn"></div>
            </div>
        </div>
    </div>
</template>
<script>
    const progressBtnWidth = 16
    export default{
         data(){
           return{

           }
         },
         props:{
             percent:{
                type: Number,
                 default: 0
             }
         },
         created() {
            this.touch = {}
        },
         methods:{
             
            progressTouchStart(e){ //手指按住
                this.touch.initiated = true  //判断是否按住
                this.touch.startX = e.touches[0].pageX  //按住时距离左边的距离
                this.touch.left = this.$refs.progress.clientWidth  //进度条的宽度&圆点的偏移量
            },
            progressTouchMove(e){  //手指滑动
                if (!this.touch.initiated) {  //如果没按住， return
                    return
                }
                const deltaX = e.touches[0].pageX - this.touch.startX //滑动的距离
                const offsetWidth = Math.min(this.$refs.progressBar.clientWidth - progressBtnWidth, Math.max(0, this.touch.left + deltaX)) //偏移量
                this.$refs.progress.style.width = `${offsetWidth}px` //设置进度条宽度
                this.$refs.progressBtn.style['transform'] = `translate3d(${offsetWidth}px,0,0)` //设置圆点的偏移量
            },
            progressTouchEnd(e){  //手指放开
                this.touch.initiated = false
                this._triggerPercent()
            },
            _triggerPercent() {
                const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
                const percent = this.$refs.progress.clientWidth / barWidth  //播放百分比
                this.$emit('percentChange', percent) //事件派发到父元素
            },
            progressClick(e){ //点击进度条
                // const offsetWidth =  e.offsetX
                const rect = this.$refs.progressBar.getBoundingClientRect() //盒子距离左边的距离
                const offsetWidth = e.pageX - rect.left  
                this.$refs.progress.style.width = `${offsetWidth}px` //设置进度条宽度
                this.$refs.progressBtn.style['transform'] = `translate3d(${offsetWidth}px,0,0)` //设置圆点的偏移量
                this. _triggerPercent()
            }
         },
         watch:{
            percent(newPercent) { //监听时间百分比的变化
                if (newPercent >= 0 && !this.touch.initiated) { //手指松开后改变
                const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth  
                const offsetWidth = newPercent * barWidth //偏移量
                this.$refs.progress.style.width = `${offsetWidth}px` //设置进度条宽度
                this.$refs.progressBtn.style['transform'] = `translate3d(${offsetWidth}px,0,0)` //设置圆点的偏移量
                }
            }  
         }
    }
</script>
<style scoped>
.progress-bar {
  height: 30px;
}

.bar-inner {
  position: relative;
  top: 13px;
  height: 4px;
  background: rgba(0, 0, 0, 0.3);
}

.progress {
  position: absolute;
  height: 100%;
  background: #ffcd32;
}

.progress-btn-wrapper {
  position: absolute;
  left: -8px;
  top: -13px;
  width: 30px;
  height: 30px;
}

.progress-btn {
  position: relative;
  top: 7px;
  left: 7px;
  box-sizing: border-box;
  width: 16px;
  height: 16px;
  border: 3px solid #fff;
  border-radius: 50%;
  background: #ffcd32;
}
</style>