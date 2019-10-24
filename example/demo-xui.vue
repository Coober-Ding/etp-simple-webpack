
<template>
    <router-view/>
  </template>
<script>

    import List from "/x/ibox2/admin/_xui/Ibox2Toilet/Ibox2Toilet/List.vue";
import Add from "/x/ibox2/admin/_xui/Ibox2Toilet/Ibox2Toilet/Add.vue";
import Detail from "/x/ibox2/admin/_xui/Ibox2Toilet/Ibox2Toilet/Detail.vue";
import StdbasemixinMixin from "StdBaseMixin";
import Update from "/x/ibox2/admin/_xui/Ibox2Toilet/Ibox2Toilet/Update.vue";
import { StdBaseMixin } from "entropy-ui";
import BoParamSupportMixin from "@/lib/bo/bo-param-support.js";

    
      var routes = [
      
            {
                path:"/",
                redirect:'/list'
            },
        
                {
                path: '/list',
                name:'list',
                            component: List
                        }
                
            ,
        
                {
                path: '/add',
                name:'add',
                            component: Add
                        }
                
            ,
        
                {
                path: '/afterAdd/:_id',
                name:'afterAdd',
                        redirect : 'detail/:_id'
                    }
                
            ,
        
                {
                path: '/afterUpdate/:_id',
                name:'afterUpdate',
                        redirect : 'detail/:_id'
                    }
                
            ,
        
                {
                path: '/update/:_id',
                
                    props: true,
                name:'update',
                            component: Update
                        }
                
            ,
        
                {
                path: '/detail/:_id',
                
                    props: true,
                name:'detail',
                            component: Detail
                        }
                
            
        
      ];
      
        var router = new VueRouter({
        mode:'abstract',
        routes: routes  });
      

    
    

    var _exportedComponent = {
    
    fileName: 'Ibox2Toilet_vue',
    
      bizObjName:'Ibox2Toilet',
    
        router,
      
      defaultRoute:'/list',
    

    mixins:[ StdbasemixinMixin,BoParamSupportMixin ],

    
    data(){
    
    return {
    
    
    
    }
    },
    
    components: {
    
      "Add": Add ,
    
      "List": List ,
    
      "Update": Update ,
    
      "Detail": Detail 
    
    },
    

    methods: {
    
    
    
    },
    
    props:{
    
    },
    computed:{
    
    },
    beforeCreate(){
    
    this.$v = 'default';
    }
    
    }
    
    export default _exportedComponent;
    
      export {routes}
    </script>