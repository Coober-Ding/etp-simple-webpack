<template>
  <div>
    <div>hello world</div>
    <img src="a.png"/>
    <img :src="'b.png'"/>
  </div>
</template>
<script>
import a from 'a.js'
import {d,e,f} from '/d.js'

export default {
  data () {
    return {
      d: d,
      e: e,
      f: f
    }
  },
  methods: {
    testImport: function () {
      var b = import('/b.js')
    },
    testImport2 () {
      var c = import('/c.js')
    },
    test () {
      [].forEach(() => {

      })
      let aaa = {b,c}
      let {bbb} = aaa
    }
  }
}

export {a}

</script>
<style>
  @import url('./a.css');
  @import url('a.css');
  .a {
    color: white;
  }
  div {
    color: red;
    background: url('./logo.png');
    background: url(./logo.png);
  }
</style>
<style>
  @import url('./b.css');
  span {
    color: white;
  }

</style>


