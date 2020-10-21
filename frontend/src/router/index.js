import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../views/Login.vue'
import Posts from '../views/Posts.vue'
import AddPost from '../views/AddPost.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'login',
    component: Login
  },
  {
    path: '/signup',
    name: 'Signup',
    component: () => import('../views/Signup.vue')
  },
  {
    path: '/posts',
    name: 'posts',
    component: Posts
  },
  {
    path: '/addpost',
    name: 'addpost',
    component: AddPost
  }
]

const router = new VueRouter({
  mode: 'history',
  routes
})

export default router
