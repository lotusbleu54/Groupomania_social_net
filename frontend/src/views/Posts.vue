<template>
  <div class="AddPost">
    <header class="header">
      <div id="logo">
        <img alt="Vue logo" src="../assets/logo.png">
      </div>
      <div id="nav">
        <router-link to="/addpost"> <i class="fas fa-plus-circle"></i> Créer un Post</router-link> |
        <router-link to="/user">Mon profil</router-link> |
        <button class="disconnection" @click = "disconnection"> Déconnexion </button>
      </div>
    </header>
    <h1>Bonjour {{pseudo}}, voici les derniers posts</h1>
    <div id="postsDiv"></div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  data: function() {
    return {
    waiting: false,
    message :"",
    Posts: [],
    title: ""
    }
  },

  computed: {
    ...mapState(['pseudo', 'token'])
  },

  beforeMount() {
    
    const options = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    };
    fetch("http://localhost:3000/api/posts", options)
      .then (res => {
        if (res.status == 200) {
          res.json ()
            .then (json => {
              const divToFill = document.getElementById('postsDiv');
              for (let i = 0; i < json.length; i++) {
                let newDiv = document.createElement("div");
                newDiv.className = "post";
                divToFill.appendChild(newDiv);
                let newH2 = document.createElement("h2");
                newH2.textContent = json[i].title;
                newDiv.appendChild(newH2);
                if (json[i].mediaUrl) {
                  const mediaContainer = document.createElement("div");
                  newDiv.appendChild(mediaContainer);
                  const mediaExtension = json[i].mediaUrl.substr((json[i].mediaUrl.lastIndexOf('.') + 1));
                  console.log(mediaExtension);
                  if (mediaExtension === 'mp4') {
                    const newVideo = document.createElement("video");
                    newVideo.src = json[i].mediaUrl;
                    newVideo.controls = true;
                    newVideo.textContent = json[i].mediaUrl;
                    mediaContainer.appendChild(newVideo);
                  }
                  else {
                    const newImage = document.createElement("img");
                    newImage.src = json[i].mediaUrl;
                    newImage.alt = json[i].mediaUrl;
                    mediaContainer.appendChild(newImage);
                  }
                }
                const avatarContainer = document.createElement("p");
                newDiv.appendChild(avatarContainer);
                avatarContainer.textContent = `Par ${json[i].Pseudo} `;
                const newImage = document.createElement("img");
                newImage.src = json[i].Avatar;
                newImage.alt = json[i].Avatar;
                newImage.width = 50;
                newImage.height = 50;
                avatarContainer.appendChild(newImage);
              }
              this.waiting=false;
              }
            )}
            else {res.json ()
              .then (json => {
              this.waiting=false;
              this.success = false;
              this.message = json.error;
              console.log("KO");
              }
            )}
          })
          .catch (() => {
            console.log("KO2");
            this.waiting=false;
            this.success= false;
            this.message = "Désolé, le serveur ne répond pas ! Veuillez réessayer ultérieurement";
          })
  
  },

  methods: {
    disconnection() {
      this.$store.commit('CONNECT_USER', ["",""]);
      this.$router.push({ name: 'login' });
  }
}
}
</script>

<style lang="scss">
.post {
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;
    box-shadow: 5px 5px 10px grey; //effet d'ombre
    margin:20px auto;
    width:60%;
    background-color: #C9E6EB;
}

img, video {
max-width:80%;
max-height:200px;
}

</style>
