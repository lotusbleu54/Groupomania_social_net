<template>
  <div class="Post">
    <header class="header">
      <div id="logo">
        <img alt="Vue logo" src="../assets/logo.png">
      </div>
      <div id="nav">
        <router-link to="/posts" v-if="pseudo"> <i class="fas fa-arrow-circle-left"></i> Retourner aux posts | &nbsp; </router-link>
        <router-link to="/addpost" v-if="pseudo"> <i class="fas fa-plus-circle"></i> Créer un Post | &nbsp; </router-link>
        <router-link :to="'/user/'+id" v-if="pseudo">Mon profil | &nbsp; </router-link>
        <button class="disconnection" @click = "disconnection" v-if="pseudo"> Déconnexion </button>
        <button class="disconnection" @click = "disconnection" v-else> Me connecter </button>
      </div>
    </header>
    <h1 v-if="pseudo">Bonjour {{pseudo}}, voici les détails du Post</h1>
    <div id="postDiv"></div>
    <button class="modifyPost" v-if="pseudo===postPseudo" @click= "modifyPost"> Modifier le post </button>
    <button class="deletePost" v-if="pseudo===postPseudo" @click= "deletePost" > Supprimer le post </button>
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
            title: "",
            postPseudo: "",
        }
    },

    computed: {
        ...mapState(['id','pseudo', 'token'])
    },

    beforeMount() {

        const optionsGetPost = {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.token}`
            }
        };
        const currentUrl = window.location.href;
        const postId = currentUrl.substr((currentUrl.lastIndexOf("/") + 1));
        this.waiting = true;

        fetch(`http://localhost:3000/api/posts/${postId}`, optionsGetPost)
            .then (res => {
            if (res.status == 200) {
                res.json ()
                    .then (json => {
                        const divToFill = document.getElementById('postDiv');
                        let newH2 = document.createElement("h2");
                        newH2.textContent = json.title;
                        divToFill.appendChild(newH2);
                        if (json.description) {
                        let newP = document.createElement("p");
                        newP.textContent = json.description;
                        newP.setAttribute("id","postDescription");
                        divToFill.appendChild(newP);
                        }
                        if (json.mediaUrl) {
                        const mediaContainer = document.createElement("div");
                        divToFill.appendChild(mediaContainer);
                        const mediaExtension = json.mediaUrl.substr((json.mediaUrl.lastIndexOf('.') + 1));
                            if (mediaExtension === 'mp4') {
                            const newVideo = document.createElement("video");
                            newVideo.src = json.mediaUrl;
                            newVideo.controls = true;
                            newVideo.textContent = json.mediaUrl;
                            mediaContainer.appendChild(newVideo);
                            }
                            else {
                            const newImage = document.createElement("img");
                            newImage.src = json.mediaUrl;
                            newImage.alt = json.mediaUrl;
                            mediaContainer.appendChild(newImage);
                            }
                        }
                        if (json.link) {
                        let newP = document.createElement("p");
                        let newA = document.createElement("a");
                        newA.href = json.link;
                        newA.textContent = json.link;
                        newP.appendChild(newA);
                        divToFill.appendChild(newP);
                        }

                        //Pseudo et avatar
                        const avatarContainer = document.createElement("p");
                        divToFill.appendChild(avatarContainer);
                        avatarContainer.textContent = `Par ${json.pseudo} `;
                        this.postPseudo=json.pseudo;
                        const newImage = document.createElement("img");
                        newImage.src = json.avatar;
                        newImage.alt = json.avatar;
                        newImage.width = 50;
                        newImage.height = 50;
                        divToFill.appendChild(newImage);
                        
                        //Info indiquant de quand date le post
                        const publishedOn = document.createElement("p");
                        //L'info date reçue de la base indique "post publié il y a hhh:mm:ss " 
                        //On ne s'intéresse ici qu'au nombre d'heures depuis que la post a été publié
                        const hoursSincePost = parseInt(json.date.substring(0,json.date.indexOf(':')));
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
                        divToFill.appendChild(publishedOn);
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
    },
        modifyPost() {
            const currentUrl = window.location.href;
            const postId = currentUrl.substr((currentUrl.lastIndexOf("/") + 1));
            this.$router.push({ path: `/modifypost/${postId}` })
    },
        deletePost() {
            let confirmation = confirm("Etes-vous certain de vouloir supprimer ce post ?");
            if (confirmation == true) {
                const optionsDeletePost = {
                    method: 'DELETE',
                    headers: {
                    'Authorization': `Bearer ${this.token}`
                    }
                };
                const currentUrl = window.location.href;
                const postId = currentUrl.substr((currentUrl.lastIndexOf("/") + 1));
                this.waiting = true;

                fetch(`http://localhost:3000/api/posts/${postId}`, optionsDeletePost)
                    .then (res => {
                        if (res.status == 200) {res.json ()
                            .then (() => {
                                this.waiting=false;
                                alert("Le post a bien été supprimé");
                                this.$router.push({ name: 'posts' });
                            })
                        }
                        else {res.json ().then (json => {
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
            }
        }
  }
}

</script>

<style lang="scss">
#postDiv {
    text-align: center;
    box-shadow: 5px 5px 10px grey; //effet d'ombre
    margin:30px auto;
    width:60%;
    background-color: #C9E6EB;
    padding:5px;
}

#postDescription {
    text-align: justify;
}


img, video {
max-width:80%;
max-height:200px;
}
</style>