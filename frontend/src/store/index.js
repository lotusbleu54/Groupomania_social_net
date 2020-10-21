import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    id:"",
    pseudo: "",
    token: "",
  },
  mutations: {
    CONNECT_USER(state, payload) {
      state.id = payload[0];
      state.pseudo = payload[1];
      state.token = payload[2];
    }
  },
  actions: {
  },
  modules: {
  }
})
