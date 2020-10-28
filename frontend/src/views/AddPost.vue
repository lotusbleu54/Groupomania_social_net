<template>
  <div class="AddPost">
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
    <h1>Veuillez entrer les informations suivantes </h1>

    <!--Formulaire de création de post-->
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
      <div class="required"> * Champs requis </div>
      <input type="submit" id="addPost" value="Créer" disabled>
    </form>

    <router-link to="/posts"> <button class = "button button__back"> <i class="fas fa-undo"></i> Retourner aux posts </button> </router-link>

    <div class="loader" v-show="waiting===true"></div>
    <p id="erreur" v-show="success===false"> Echec de la création de post : {{message}} </p>

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
    token:"" //token de connection
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
    }
    else {this.$router.push({ name: 'login' });}
  },

  methods: {

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

    //Vérification en direct de la validité du formulaire. Le bouton "Envoyer" n'est clickable que si tous les champs sont OK
    checkForm() {
      if (document.getElementById("title").checkValidity() 
      && document.getElementById("description").checkValidity() 
      && document.getElementById("link").checkValidity()
      && document.getElementById("media").checkValidity()) {
      document.getElementById("addPost").disabled = false;
      }
      else {document.getElementById("addPost").disabled = true;}
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
    addPost(event) {
      event.preventDefault(); //On gère nous-mêmes l'appel backend

      //On récupère toutes les infos du formulaire
      const title= document.getElementById("title").value;
      const description = document.getElementById("description").value;
      const url = document.getElementById("link").value;
      const post = {"userId": this.id, "title": title, "description": description, "url": url };
      const fileToSend = event.target.media.files[0];
      
      //Cas où il n'y a pas de média : on envoie les autres données en objet JSON
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
            if (res.status == 201) {res.json ()
              .then (() => {
                this.success=true;
                this.waiting=false;
                this.$router.push({ name: 'posts' }); //En cas de succès, on est renvoyé sur la page des posts
              }
            )}
            else {res.json ()
            .then (json => {
                this.waiting=false;
                this.success = false;
                this.message = json.error; //Affichage du message d'erreur du serveur
              }
            )}
          })
          .catch (() => { //Cas où le serveur ne répond pas
            this.waiting=false;
            this.success= false;
            this.message = "Désolé, le serveur ne répond pas ! Veuillez réessayer ultérieurement";
          })
      }
      
      //Si la taille du fichier est > 20Mb, on n'envoie même pas la requête au serveur
      else if (fileToSend.size > 20*1000*1000) {
        this.waiting=false;
        this.success = false;
        this.message = "La taille maximale du fichier doit être de 20Mb";
      }

      //Cas où il y a un fichier dans la demande. La requête comprendra un fichier et un objet JSON
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
            this.$router.push({ name: 'posts' }); //En cas de succès, on est renvoyé sur la page des posts
          }
          else {res.json ()
          .then (json => {
            this.waiting=false;
            this.success = false;
            this.message = json.error; //Affichage du message d'erreur du serveur
            }
          )}
        })
        .catch (() => { //Cas où le serveur ne répond pas
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
