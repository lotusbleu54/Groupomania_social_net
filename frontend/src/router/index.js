import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../views/Login.vue'
import Posts from '../views/Posts.vue'
import Post from '../views/Post.vue'
import AddPost from '../views/AddPost.vue'
import User from '../views/User.vue'
import Modifypost from '../views/ModifyPost.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'login',
    component: Login
  },
  {
    path: '/signup',
    name: 'signup',
    component: () => import('../views/Signup.vue')
  },
  {
    path: '/posts',
    name: 'posts',
    component: Posts
  },
  {
    path: '/post/:numero',
    name: 'post',
    component: Post
  },
  {
    path: '/user/:id',
    name: 'user',
    component: User
  },
  {
    path: '/addpost',
    name: 'addpost',
    component: AddPost
  },
  {
    path: '/modifypost/:numero',
    name: 'modifypost',
    component: Modifypost
  }
]

const router = new VueRouter({
  mode: 'history',
  routes
})

export default router
