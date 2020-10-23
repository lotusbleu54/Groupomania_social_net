<template>
  <div class="AddPost">
    <header class="header">
      <div id="logo">
        <img alt="Vue logo" src="../assets/logo.png">
      </div>
      <div id="nav">
        <router-link to="/addpost" v-if="pseudo"> <i class="fas fa-plus-circle"></i> Créer un Post | &nbsp; </router-link>
        <router-link :to="'/user/'+id" v-if="pseudo"> Mon profil | &nbsp;</router-link>
        <button class="disconnection" @click = "disconnection" v-if="pseudo"> Déconnexion </button>
        <button class="disconnection" @click = "disconnection" v-else> Me connecter </button>
      </div>
    </header>
    <h1 v-if="pseudo">Bonjour {{pseudo}}, voici les derniers posts</h1>
    <div id="postsDiv"></div>
    <div class="loader" v-show="waiting===true"></div>
    <p id="erreur" v-show="success===false"> Echec de la requête : {{message}} </p>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  data: function() {
    return {
    success: true,
    waiting: false,
    message :"",
    Posts: [],
    title: ""
    }
  },

  computed: {
    ...mapState(['id','pseudo', 'token'])
  },

  beforeMount() {

    const options = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    };

    this.waiting = true;
    fetch("http://localhost:3000/api/posts", options)
      .then (res => {
        if (res.status == 200) {
          res.json ()
            .then (json => {
              const divToFill = document.getElementById('postsDiv');
              //Cas où il n'y a aucun poste
              if (json.length===0) {
                let pEmpty = document.createElement("p");
                pEmpty.textContent = "Désolé, il n'y a aucun post. Mais vous pouvez en créer un !";
                divToFill.appendChild(pEmpty);
                }
              //Sinon, boucle sur tous les posts
              for (let i = 0; i < json.length; i++) {
                let newDiv = document.createElement("div");
                newDiv.className = "post";
                newDiv.addEventListener('click', () => {
                   this.$router.push("post/"+json[i].numero);
                })
                divToFill.appendChild(newDiv);
                let newH2 = document.createElement("h2");
                newH2.textContent = json[i].title;
                newDiv.appendChild(newH2);
                if (json[i].mediaUrl) {
                  const mediaContainer = document.createElement("div");
                  newDiv.appendChild(mediaContainer);
                  const mediaExtension = json[i].mediaUrl.substr((json[i].mediaUrl.lastIndexOf('.') + 1));
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
                avatarContainer.textContent = `Par ${json[i].pseudo} `;
                const newImage = document.createElement("img");
                newImage.src = json[i].avatar;
                newImage.alt = json[i].avatar;
                newImage.width = 50;
                newImage.height = 50;
                newDiv.appendChild(newImage);

                const publishedOn = document.createElement("p");
                const hoursSincePost = parseInt(json[i].date.substring(0,json[i].date.indexOf(':')));
                switch (true) {
                  case hoursSincePost == 0:
                    publishedOn.textContent = "Publié il y a moins d'une heure";
                    break;
                  case hoursSincePost == 1:
                    publishedOn.textContent = `Publié il y a 1 heure`;
                    break;
                  case hoursSincePost<=23 && hoursSincePost>1:
                    publishedOn.textContent = `Publié il y a ${hoursSincePost} heures`;
                    break;
                  case hoursSincePost<=47 && hoursSincePost>23:
                    publishedOn.textContent = `Publié il y a 1 jour`;
                    break;
                  case hoursSincePost<=167 && hoursSincePost>47:
                    publishedOn.textContent = `Publié il y a ${Math.floor(hoursSincePost/24)} jours`;
                    break;
                  case hoursSincePost>167:
                    publishedOn.textContent = `Publié il y a plus d'1 semaine`;
                    break;
                }
                newDiv.appendChild(publishedOn);
              }
              this.waiting=false;
              this.success = true;
              }
            )}
            else {res.json ()
              .then (json => {
              this.waiting=false;
              this.success = false;
              this.message = json.error;
              }
            )}
          })
          .catch (() => {
            this.waiting=false;
            this.success= false;
            this.message = "Désolé, le serveur ne répond pas ! Veuillez réessayer ultérieurement";
          })

  },

  methods: {
    disconnection() {
      this.$store.commit('CONNECT_USER', ["","",""]);
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
    align-items: center;
    text-align: center;
    box-shadow: 5px 5px 10px grey; //effet d'ombre
    margin:30px auto;
    padding:5px;
    width:60%;
    background-color: #C9E6EB;
    transform: scale(1);
    transition: all 400ms;

    &:hover {
      transform: scale(1.1);
      opacity: 0.6;
      cursor:pointer;
    }
}

img, video {
max-width:90%;
max-height:250px;
}

</style>
