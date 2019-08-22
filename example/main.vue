<template>
  <div>
    <div>hello world</div>
    <img src="a.js"/>
    <img :src="'a.js'"/>
  </div>
</template>
<script>
import a from 'a.js'
import {d,e,f} from '/d.js'

var cp = {
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
export default cp
export {a}

</script>
<style>
  .a {
    color: white;
  }
</style>


