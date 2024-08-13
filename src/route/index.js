import Vue from 'vue'
import Router from 'vue-router'
import home from '@/components/Home'


Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
        
      path: '*',
      name: 'HelloWorld',
      component: home.HelloWorld
    },
    {
        
        path: '/PackageSelector',
        name: 'PackageSelector',
        component: home.PackageSelector
      },
      {
        
        path: '/edit_package',
        name: 'edit_package',
        component: home.edit_package
      },
      {
        path: '/edit_users',
        name: 'edit_users',
        component: home.edit_users
      }
  ]
})
