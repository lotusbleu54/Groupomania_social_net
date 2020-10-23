<template>
  <div class="ModifyPost">
    <header class="header">
      <div id="logo">
        <img alt="Vue logo" src="../assets/logo.png">
      </div>
      <div id="nav">
        <router-link to="/posts" v-if="pseudo"> <i class="fas fa-arrow-circle-left"></i> Retourner aux posts</router-link> |
        <router-link :to="'/user/'+id" v-if="pseudo">Mon profil</router-link> |
        <button class="disconnection" @click = "disconnection" v-if="pseudo"> Déconnexion </button>
        <button class="disconnection" @click = "disconnection" v-else> Me connecter </button>
      </div>
    </header>

    <form id="formElement" @submit= "modifyPost">
      <label for="title">Titre <span class="required">*</span> </label>
      <input @input = "checkForm" type="text" id="title" name="title" minlength="8" maxlength= "49" required>
      <label for="description"> Description </label>
      <textarea @input = "checkForm" type="text" id="description" name="description" maxlength="1000"></textarea>
      <label for="url"> Lien </label>
      <input @input = "checkForm" type="url" id="link" name="link">
      <label for="media" class="custom-file-upload"><i class="fa fa-upload" aria-hidden="true"></i> Modifier le média</label>
      <input @input = "checkForm" @change = "loadImagePreview" type="file" id="media" name="media" accept="image/*, video/*">
      <div class="media-preview" v-show ="imageLoaded===true||videoLoaded===true">
        <img src="" alt="aperçu de l'image" class="media-preview__image" v-show="imageLoaded===true">
        <video controls src="" class="media-preview__video" v-show="videoLoaded===true">Aperçu de la vidéo</video>
      </div>
      <button type="button" v-show = "imageLoaded===true||videoLoaded===true" @click= "deleteMedia"> Supprimer le média </button>
      <input type="submit" id="modifyPost" value="Enregistrer les changements">
    </form>

    <div class="loader" v-show="waiting===true"></div>
    <p id="erreur" v-show="success===false"> Echec de la création de post : {{message}} </p>

  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  data: function() {
    return {
    imageLoaded: false,
    videoLoaded: false,
    success: true,
    waiting: false,
    message :"",
    mediaUrl: ""
    }
  },

  computed: {
    ...mapState(['id','pseudo', 'token'])
  },

  mounted() {
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
                this.waiting=false;
                document.getElementById('title').value = json.title;
                if (json.description) {document.getElementById('description').value = json.description;}
                if (json.link) {document.getElementById('link').value = json.link;}
                if (json.mediaUrl) {
                  this.mediaUrl=json.mediaUrl;
                  const mediaExtension = json.mediaUrl.substr((json.mediaUrl.lastIndexOf('.') + 1));
                  if (mediaExtension === 'mp4') {
                    this.videoLoaded=true;
                    document.getElementsByClassName("media-preview__video")[0].setAttribute("src",json.mediaUrl);
                  }
                  else {
                    this.imageLoaded=true;
                    document.getElementsByClassName("media-preview__image")[0].setAttribute("src",json.mediaUrl);
                  }
                }
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

    deleteMedia() {
      if (this.videoLoaded==true) {
        document.getElementsByClassName('media-preview__video')[0].setAttribute("src", "");
        document.getElementById("media").value='';
        this.videoLoaded=false;}
      else {
        document.getElementsByClassName('media-preview__image')[0].setAttribute("src", "");
        document.getElementById("media").value='';
        this.imageLoaded=false;}
      },

    checkForm() {
      if (document.getElementById("title").checkValidity() 
      && document.getElementById("description").checkValidity() 
      && document.getElementById("link").checkValidity()
      && document.getElementById("media").checkValidity()) {
      document.getElementById("modifyPost").disabled = false;
      }
      else {document.getElementById("modifyPost").disabled = true;}
    },

    loadImagePreview() {
      const fileUploaded = document.getElementById("media").files[0];
      const regexImage = RegExp('image*');
      const regexVideo = RegExp('video*');
      if (fileUploaded && regexImage.test(fileUploaded.type)) {
        const reader = new FileReader();
        this.imageLoaded = true;
        this.videoLoaded = false;
        reader.addEventListener("load", function() {
          document.getElementsByClassName('media-preview__image')[0].setAttribute("src", this.result);
        });
        reader.readAsDataURL(fileUploaded);
      }
      else if (fileUploaded && regexVideo.test(fileUploaded.type)) {
        const reader = new FileReader();
        this.videoLoaded = true;
        this.imageLoaded=false;
        reader.addEventListener("load", function() {
          document.getElementsByClassName('media-preview__video')[0].setAttribute("src", this.result);
        });
        reader.readAsDataURL(fileUploaded);
      }
      else {
        this.imageLoaded=false;
        this.videoLoaded=false;
      }
    },

    modifyPost(event) {
      event.preventDefault();
      const title= document.getElementById("title").value;
      const description = document.getElementById("description").value;
      const url = document.getElementById("link").value;
      const fileToSend = document.getElementById("media").files[0];
      const currentUrl = window.location.href;
      const postId = currentUrl.substr((currentUrl.lastIndexOf("/") + 1));
      
      if ( (!fileToSend) && (!this.imageLoaded) && (!this.videoLoaded)) {
        const optionsModifyPost = {
          method: 'PUT',
          body: JSON.stringify({"title": title, "description": description, "url": url, "mediaUrl":"" }),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
          }
        };
        fetch(`http://localhost:3000/api/posts/${postId}`, optionsModifyPost)
          .then (res => {
            if (res.status == 200) {
              res.json ()
              .then (() => {
                this.success=true;
                this.waiting=false;
                this.$router.push({ name: 'posts' });
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
      }
      else if ((fileToSend) && (fileToSend.size > 20*1000*1000)) {
        this.waiting=false;
        this.success = false;
        this.message = "La taille maximale du fichier doit être de 20Mb";
      }
      else if ((!fileToSend) && (this.imageLoaded||this.videoLoaded)) {
                const optionsModifyPost = {
          method: 'PUT',
          body: JSON.stringify({"title": title, "description": description, "url": url, "mediaUrl": this.mediaUrl }),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
          }
        };
        fetch(`http://localhost:3000/api/posts/${postId}`, optionsModifyPost)
          .then (res => {
            if (res.status == 200) {
              res.json ()
              .then (() => {
                this.success=true;
                this.waiting=false;
                this.$router.push({ name: 'posts' });
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
      }
      else {
      let formData = new FormData();
      formData.append('post', JSON.stringify({"title": title, "description": description, "url": url}));
      formData.append('media', fileToSend);
      this.waiting = true;
      const optionsModifyPostWithMedia = {
        method: 'PUT',
        body: formData,
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Authorization': `Bearer ${this.token}`
        }
      };
      fetch(`http://localhost:3000/api/posts/${postId}`, optionsModifyPostWithMedia)
        .then (res => {
          if (res.status == 200) {
            this.success=true;
            this.waiting=false;
            this.$router.push({ name: 'posts' });
          }
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
      }
    }
  }
}
</script>

<style lang="scss">

.media-preview {
  width:300px;
  min-height:100px;
  margin-top:15px;

  &__image {
    width:100%;
  }
  &__video {
    width:100%;
  }
}

.required {
  color:red;
}
input[type="file"] {
    display: none;
}

.custom-file-upload {
    border: 2px solid rgb(0, 0, 0);
    border-radius: 10px;
    display: inline-block;
    padding: 6px 12px;
    cursor: pointer;
}

#modifyPost {
  margin:20px auto 0;
  height:auto;
  border:none;
	padding:10px;
	border-radius:8px;
	background:#FD2A00;
	font-weight:bold;
  color:#fff;
  font-size:20px;
  cursor:pointer;

  &:disabled {
  background: grey;
  color:rgb(200, 200, 200);
  cursor:auto;
  }
}

</style>