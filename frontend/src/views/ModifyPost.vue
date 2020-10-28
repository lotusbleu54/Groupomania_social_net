<template>
  <div class="ModifyPost">
    <header class="header">
      <div id="logo">
        <img alt="Vue logo" src="../assets/logo.png">
      </div>
      <nav id="nav">
        <ul>
          <li @click = "displayMenu"><i class="fas fa-user-circle fa-3x"></i></li>
          <li class = "invisible"><router-link :to="'/user/'+id">Mon profil</router-link></li>
          <li class = "invisible disconnection" @click = "disconnection"> Déconnexion </li>
        </ul>
      </nav>
    </header>

    <!--Formulaire de modification de post-->
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
      <button type="button" class="button button__delete" v-show = "imageLoaded===true||videoLoaded===true" @click= "deleteMedia"> Supprimer le média </button>
      <div class="required"> * Champs requis </div>
      <input type="submit" id="modifyPost" value="Enregistrer les changements">
    </form>

    <router-link to="/posts"> <button class = "button button__back"> <i class="fas fa-undo"></i> Retourner aux posts </button> </router-link>
    <div class="loader" v-show="waiting===true"></div>
    <p id="erreur" v-show="success===false"> Echec de la modification : {{message}} </p>

  </div>
</template>

<script>

export default {
  data: function() {
    return {
      imageLoaded: false, //Permet d'afficher l'image chargée si true
      videoLoaded: false, //Permet d'afficher la vidéo chargée si true
      success: true, //affichage d'un message d'erreur si passe à false
      waiting: false, //spinner affiché si variable passe à true
      message :"", //message d'erreur
      id:"", //id de l'utilisateur connecté
      token:"", //token de connection
      mediaUrl: "" //url du média pour pouvoir l'utiliser dans plusieurs fonctions
    }
  },

  //Chargement automatique dès que le js est monté
  mounted() {
    const userInfo = JSON.parse(localStorage.getItem('userInfo')); //on récupère les infos de connection
    if (userInfo) { //On vérifie si l'utilisateur s'est connecté, sinon on le renvoie vers la page login
      this.id = userInfo.id;
      this.token = userInfo.token;
      //On cache les menus "Mon profil" et "Déconnection" tant que l'utilisateur ne clique pas sur l'icône
      const menu = document.getElementsByClassName("invisible");
      for (let i = 0; i < menu.length; i++) {
        menu[i].setAttribute("style","display:none");
      }

      this.getPost(); //Appel de la fonction qui charge les détails du post

    }
    else {this.$router.push({ name: 'login' });}
  },

  methods: {

    getPost() {
      const optionsGetPost = {
      method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      };

      //L'id du post est dans l'url après le dernier "/"
      const postId = window.location.href.substr((window.location.href.lastIndexOf("/") + 1));
      this.waiting = true;

      fetch(`http://localhost:3000/api/posts/${postId}`, optionsGetPost)
        .then (res => {
          if (res.status == 200) {res.json ()
            .then (json => {
              this.waiting=false;
              document.getElementById('title').value = json.title; //On remplit le champ titre avec le titre enregistré dans la DB
              //On fait de même pour les autres champs s'ils existent
              if (json.description) {document.getElementById('description').value = json.description;}
              if (json.link) {document.getElementById('link').value = json.link;}
              if (json.mediaUrl) {
                this.mediaUrl=json.mediaUrl;
                const mediaExtension = json.mediaUrl.substr((json.mediaUrl.lastIndexOf('.') + 1));
                //Cas de la vidéo
                if (mediaExtension === 'mp4') {
                  this.videoLoaded=true;
                  document.getElementsByClassName("media-preview__video")[0].setAttribute("src",json.mediaUrl);
                }
                //Cas des images
                else {
                  this.imageLoaded=true;
                  document.getElementsByClassName("media-preview__image")[0].setAttribute("src",json.mediaUrl);
                }
              }
            })
          }
          else {res.json ()
            .then (() => {this.$router.push({ name: 'login' });})
          }
        })
        .catch (() => {
          this.waiting=false;
          this.success= false;
          this.message = "Désolé, le serveur ne répond pas ! Veuillez réessayer ultérieurement";
        })
    },

    //Affiche les menus "Mon Profil" et "Déconnection" ou les cache si déjà affichés
    displayMenu() {
      const menu = document.getElementsByClassName("invisible");
      for (let i = 0; i < menu.length; i++) {
        if (menu[i].style.display == "none") {menu[i].setAttribute("style","display:block");}
        else {menu[i].setAttribute("style","display:none");}
      }
    },

    //Effacement des données de connection et redirection vers la page login
    disconnection() {
      localStorage.clear();
      this.$router.push({ name: 'login' });
    },

    //Action en cas de click sur "Supprimer le média"
    deleteMedia() {
      //Cas de la vidéo
      if (this.videoLoaded==true) {
        document.getElementsByClassName('media-preview__video')[0].setAttribute("src", "");
        document.getElementById("media").value='';
        this.videoLoaded=false;}
      //Cas de l'image
      else {
        document.getElementsByClassName('media-preview__image')[0].setAttribute("src", "");
        document.getElementById("media").value='';
        this.imageLoaded=false;}
      },

    //Vérification en direct de la validité du formulaire. Le bouton "Envoyer" n'est clickable que si tous les champs sont OK
    checkForm() {
      if (document.getElementById("title").checkValidity() 
      && document.getElementById("description").checkValidity() 
      && document.getElementById("link").checkValidity()
      && document.getElementById("media").checkValidity()) {
      document.getElementById("modifyPost").disabled = false;
      }
      else {document.getElementById("modifyPost").disabled = true;}
    },

    //Fonction de prévisualisation du média
    loadImagePreview() {
      const fileUploaded = document.getElementById("media").files[0];
      const regexImage = RegExp('image*');
      const regexVideo = RegExp('video*');
      //Cas de l'image
      if (fileUploaded && regexImage.test(fileUploaded.type)) {
        const reader = new FileReader();
        this.imageLoaded = true;
        this.videoLoaded = false;
        reader.addEventListener("load", function() {
          document.getElementsByClassName('media-preview__image')[0].setAttribute("src", this.result);
        });
        reader.readAsDataURL(fileUploaded);
      }
      //Cas de la vidéo
      else if (fileUploaded && regexVideo.test(fileUploaded.type)) {
        const reader = new FileReader();
        this.videoLoaded = true;
        this.imageLoaded=false;
        reader.addEventListener("load", function() {
          document.getElementsByClassName('media-preview__video')[0].setAttribute("src", this.result);
        });
        reader.readAsDataURL(fileUploaded);
      }
      //Cas où aucun média n'est chargé
      else {
        this.imageLoaded=false;
        this.videoLoaded=false;
      }
    },

    //Fonction appelée lors de la soumission du formulaire
    modifyPost(event) {
      event.preventDefault(); //On gère nous-mêmes l'appel backend

      //On récupère toutes les infos du formulaire
      const title= document.getElementById("title").value;
      const description = document.getElementById("description").value;
      const url = document.getElementById("link").value;
      const fileToSend = document.getElementById("media").files[0];
      const currentUrl = window.location.href;
      const postId = currentUrl.substr((currentUrl.lastIndexOf("/") + 1));
      
      //Cas où il n'y a pas de média ni dans le post d'origine, ni après modification : on envoie les données en objet JSON
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

      //Si la taille du fichier est > 20Mb, on n'envoie même pas la requête au serveur
      else if ((fileToSend) && (fileToSend.size > 20*1000*1000)) {
        this.waiting=false;
        this.success = false;
        this.message = "La taille maximale du fichier doit être de 20Mb";
      }

      //Cas où on n'a pas chargé de nouveau média, mais qu'il y en avait un dans le post d'origine
      else if ((!fileToSend) && (this.imageLoaded||this.videoLoaded)) {
        const optionsModifyPost = {
        method: 'PUT',
        //Dans le mediaUrl, on remet l'url du média déjà présent
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

      //Cas où il y a un nouveau média. La requête comprendra un fichier et un objet JSON
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