<template>
  <div class="signup">
    <header class="header">
      <div id="logo">
        <img alt="Vue logo" src="../assets/logo.png">
      </div>
    </header>
    <h1> Bienvenue sur le forum interne de Groupomania ! </h1>
    <h2> Veuillez entrer les informations suivantes pour créer un compte </h2>
    <form id="formElement" @submit = "sendForm">
      <label for="mail">Adresse e-mail <span class="required">*</span> </label>
      <input @input = "checkForm" type="email" id="mail" name="email" required>
      <label for="pass">Mot de passe <span class="required">*</span> </label>
      <input @input = "checkForm" type="password" id="pass" name="password" minlength="8" required>
      <p>Le mot de passe doit inclure au moins 8 caractères dont au moins 1 minuscule, 1 majuscule, 1 chiffre, et 1 caractère spécial</p>
      <label for="pseudo">Pseudo <span class="required">*</span> </label>
      <input @input = "checkForm" type="text" id="pseudo" name="pseudo" required>
      <label for="avatar" class="custom-file-upload"><i class="fa fa-upload" aria-hidden="true"></i> Télécharger un avatar <span class="required">*</span></label>
      <input @input = "checkForm" @change = "loadImagePreview" type="file" id="avatar" name="avatar" required accept="image/*">
      <div class="image-preview" v-if="imageLoaded===true">
        <img src="" alt="aperçu de l'avatar" class="image-preview__image"> 
      </div>
      <input type="submit" id="userSignup" value="Enregistrer" disabled>
    </form>
    <div class="loader" v-show="waiting===true"></div>
    <p id="erreur" v-show="success===false"> Echec de l'inscription : {{message}} </p>
    <div id="no-account">
    <p> Déjà un compte ? <router-link to="/">Se connecter</router-link> </p>
    </div>
  </div>
</template>

<script>

export default {
  name: 'Signup',
  data: function() {
    return {
    imageLoaded: false,
    success: true,
    waiting: false,
    message :""
    }
  },
  methods: {
    checkForm() {
      if (document.getElementById("mail").checkValidity() 
      && document.getElementById("pass").checkValidity() 
      && document.getElementById("pseudo").checkValidity()
      && document.getElementById("avatar").checkValidity()) {
        document.getElementById("userSignup").disabled = false;
      }
      else document.getElementById("userSignup").disabled = true;
    },

    loadImagePreview() {
      const fileUploaded = document.getElementById("avatar").files[0];
      if (fileUploaded) {
        const reader = new FileReader();
        this.imageLoaded = true;
        reader.addEventListener("load", function() {
          document.getElementsByClassName('image-preview__image')[0].setAttribute("src", this.result);
        });
        reader.readAsDataURL(fileUploaded);
      }
      else {this.imageLoaded=false;}
    },

    sendForm(event) {
      event.preventDefault();
      const email= document.getElementById("mail").value;
      const password = document.getElementById("pass").value;
      const pseudo = document.getElementById("pseudo").value;
      const user = { "email": email, "password": password, "pseudo": pseudo };
      const fileToSend = event.target.avatar.files[0];
      if (fileToSend.size > 1*1000*1000) {
        this.waiting=false;
        this.success = false;
        this.message = "La taille maximale du fichier doit être de 1Mb";
      }
      else {
      let formData = new FormData();
      formData.append('user', JSON.stringify(user));
      formData.append('image', fileToSend);
      this.waiting = true;
      const options = {
        method: 'POST',
        body: formData,
        headers: {'Accept': 'application/json, text/plain, */*'}
      };
      fetch("http://localhost:3000/api/auth/signup", options)
        .then (res => {
          if (res.status == 201) {
            this.success=true;
            this.waiting=false;
            this.$router.push({ name: 'login' });
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

form > p {
  font-size:14px;
  font-style: italic;
  margin-top:0;
}

.image-preview {
  width:300px;
  min-height:100px;
  margin-top:15px;

  &__image {
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
    margin:10px;
}

#userSignup {
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