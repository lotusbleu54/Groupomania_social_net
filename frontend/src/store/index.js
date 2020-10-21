import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    pseudo: "",
    token: "",
  },
  mutations: {
    CONNECT_USER(state, payload) {
      state.pseudo = payload[0];
      state.token = payload[1];
    }
  },
  actions: {
  },
  modules: {
  }
})
