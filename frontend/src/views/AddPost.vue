<template>
  <div class="AddPost">
    <header class="header">
      <div id="logo">
        <img alt="Vue logo" src="../assets/logo.png">
      </div>
      <div id="nav">
        <router-link to="/posts"> <i class="fas fa-arrow-circle-left"></i> Retourner aux posts</router-link> |
        <router-link to="/user">Mon profil</router-link> |
        <button class="disconnection" @click = "disconnection"> Déconnexion </button>
      </div>
    </header>

    <form id="formElement" @submit="addPost">
      <label for="title">Titre <span class="required">*</span> </label>
      <input @input = "checkForm" type="text" id="title" name="title" minlength="8" maxlength= "49" required>
      <label for="description"> Description </label>
      <textarea @input = "checkForm" type="text" id="description" name="description" maxlength="1000"></textarea>
      <label for="url"> Lien </label>
      <input @input = "checkForm" type="url" id="link" name="link">
      <label for="media" class="custom-file-upload"><i class="fa fa-upload" aria-hidden="true"></i> Télécharger un média (image ou vidéo)</label>
      <input @input = "checkForm" @change = "loadImagePreview" type="file" id="media" name="media" accept="image/*, video/*">
      <div class="media-preview" v-if ="imageLoaded===true||videoLoaded===true">
        <img src="" alt="aperçu de l'image" class="media-preview__image" v-if="imageLoaded===true">
        <video controls src="" class="media-preview__video" v-if="videoLoaded===true">Aperçu de la vidéo</video>
      </div>
      <input type="submit" id="addPost" value="Créer" disabled>
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
    message :""
    }
  },

  computed: {
    ...mapState(['pseudo', 'token'])
  },

  methods: {

    disconnection() {
      this.$store.commit('CONNECT_USER', ["",""]);
      this.$router.push({ name: 'login' });
    },

    checkForm() {
      if (document.getElementById("title").checkValidity() 
      && document.getElementById("description").checkValidity() 
      && document.getElementById("link").checkValidity()
      && document.getElementById("media").checkValidity()) {
      document.getElementById("addPost").disabled = false;
      }
      else {document.getElementById("addPost").disabled = true;}
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

    addPost(event) {
      event.preventDefault();
      const title= document.getElementById("title").value;
      const description = document.getElementById("description").value;
      const url = document.getElementById("link").value;
      const post = {"userId": this.id, "title": title, "description": description, "url": url };
      const fileToSend = event.target.media.files[0];
      
      if (!fileToSend) {
        const options = {
          method: 'POST',
          body: JSON.stringify(post),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
          }
        };
        fetch("http://localhost:3000/api/posts", options)
          .then (res => {
            if (res.status == 201) {
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
      
      else if (fileToSend.size > 20*1000*1000) {
        this.waiting=false;
        this.success = false;
        this.message = "La taille maximale du fichier doit être de 20Mb";
      }

      else {
      let formData = new FormData();
      formData.append('post', JSON.stringify(post));
      formData.append('media', fileToSend);
      this.waiting = true;
      const options = {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Authorization': `Bearer ${this.token}`
        }
      };
      fetch("http://localhost:3000/api/posts", options)
        .then (res => {
          if (res.status == 201) {
            this.success=true;
            this.waiting=false;
            this.$router.push({ name: 'Posts' });
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
  border: 2px solid #dddddd;
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

.loader {
  border: 10px solid #f3f3f3;
  border-radius: 50%;
  border-top: 10px solid #FD2A00;
  width: 50px;
  height: 50px;
  margin:auto;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

#erreur {
  color:red;
  font-weight: bold;
}

#addPost {
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
