<template>
    <div class="search-list" v-show="searches.length">
      <transition-group name="list" tag="ul">
        <li :key="item" class="search-item" @click="selectItem(item)" v-for="item in searches">
          <span class="text">{{item}}</span>
          <span class="icon" @click.stop="deleteOne(item)">
            <i class="icon-delete"></i>
          </span>
        </li>
      </transition-group>
    </div>
</template>
  
  <script>
    export default {
      props: {
        searches: {
          type: Array,
          default: []
        }
      },
      methods: {
        //添加搜索关键字
        selectItem(item) {
          this.$emit('select', item)
        },
        //删除
        deleteOne(item) {
          this.$emit('delete', item)
        }
      }
    }
  </script>
  
  <style scoped lang="stylus" rel="stylesheet/stylus">
    .search-list{

    }
      .search-item{
        display: flex;
        align-items: center;
        height: 40px;
        overflow: hidden
      }
        
      .search-item .list-enter-active, .search-item .list-leave-active{
            transition: all 0.1s
        }
          
      .search-item.list-enter, .search-item.list-leave-to{
            height: 0
        }
          
        .text{
          flex: 1;
          color: rgba(255, 255, 255, 0.5)
        }
          
        /* .icon:before{ 
            content: '';
            position: absolute;
            top: -10px;
            left: -10px;
            right: -10px;
            bottom: -10px
        } */
          
          .icon-delete{
            font-size:12px;
            color:rgba(255, 255, 255, 0.3)
          }
            
  </style>