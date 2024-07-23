import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import route from './route'
import VueRouter from 'vue-router'
import axios from "axios";
import './assets/font.css'

axios.defaults.headers.common['ngrok-skip-browser-warning'] = 'true'
Vue.config.productionTip = false
Vue.use(VueRouter)

new Vue({
  el: '#app',
  vuetify,
  router: route, // แก้ชื่อจาก route เป็น router ตามการตั้งค่าในไฟล์ route/index.js
  render: h => h(App)
}).$mount('#app')