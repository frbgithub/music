<template>
    <div class="search-box">
      <i class="icon-search"></i>
      <input ref="query" v-model="query" class="box" :placeholder="placeholder"/>
      <i @click="clear" v-show="query" class="icon-dismiss"></i>
    </div>
</template>
<script>
    // import {debounce} from 'common/js/util'
    export default {
      props: {
        placeholder: {
          type: String,
          default: '搜索歌曲、歌手'
        }
      },
      data() {
        return {
          query: ''
        }
      },
      methods: {
        clear() {  //删除query
          this.query = ''
        },
        setQuery(query) {
          this.query = query
        },
        //失去焦点
        blur() {
          this.$refs.query.blur()
        }
      },
      created() {
        this.$watch('query',(newQuery) => {
          this.$emit('query', newQuery)
        })
      }
    }
  </script>
  <style scoped>

    .search-box{
        display: flex;
        align-items: center;
        box-sizing: border-box;
        width: 100%;
        padding: 0 6px;
        height: 40px;
        background: #333;
        border-radius: 6px;
        
    }
      
    .search-box  .icon-search{
        font-size:24px;
        color: #222
      }
        
    .search-box .box{
        flex: 1;
        margin: 0 5px;
        line-height: 18px;
        background: #333;
        color: #fff;
        font-size:14px;
        outline:medium
      }
        
    .search-box::placeholder{
            color: rgba(255, 255, 255, 0.3)
        }
          
    .search-box .icon-dismiss{
        font-size: 16px;
        color:#222
      }
        
  </style>
  