<template>
  <div id="login">
    <header class="header">
      <div id="logo">
        <img alt="Vue logo" src="../assets/logo.png">
      </div>
    </header>
    <h1> Bienvenue sur le forum interne de Groupomania ! </h1>
    <h2> Veuillez entrer vos identifiants pour vous connecter </h2>

    <!--Formulaire de connexion-->
    <form id="formElement" @submit = "sendForm">
      <label for="mail">Adresse e-mail : </label>
      <input @input = "checkForm" type="email" id="mail" name="email" required>
      <label for="pass">Mot de passe : </label>
      <input @input = "checkForm" type="password" id="pass" name="password" minlength="8" required>
      <input type="submit" id="userLogin" value="Connexion" disabled>
    </form>

    <div class="loader" v-show="waiting===true"></div>
    <p id="erreur" v-show="success===false"> {{message}} </p>
    <div id="no-account">
      <p> Pas encore de compte ? <router-link to="/signup">Créer un compte</router-link> </p>
    </div>
  </div>
</template>

<script>

export default {
  data: function() {
    return {
    success: true, //affichage d'un message d'erreur si passe à false
    waiting: false, //spinner affiché si variable passe à true
    message :"", //message d'erreur
    }
  },
  methods: {

    //Vérification en direct de la validité du formulaire. Le bouton "Envoyer" n'est clickable que si tous les champs sont OK
    checkForm() {
      if (document.getElementById("mail").checkValidity() && document.getElementById("pass").checkValidity()) {
        document.getElementById("userLogin").disabled = false;
      }
      else document.getElementById("userLogin").disabled = true;
    },

    //Fonction appelée lors de la soumission du formulaire
    sendForm(event) {
      event.preventDefault(); //On gère nous-mêmes l'appel backend
      this.waiting = true;
      let email= document.getElementById("mail").value;
      let password = document.getElementById("pass").value;
      const options = {
        method: 'POST',
        body: JSON.stringify({"email": email, "password": password}),
        headers: {'Content-Type': 'application/json'}
      };
      fetch("http://localhost:3000/api/auth/login", options)
        .then (res => {
          if (res.status == 200) {res.json ()
            .then (json => {
              this.success=true;
              this.waiting=false;
              const userInfo = {id: json.id, pseudo: json.pseudo, token: json.token};
              //En cas de réussite, on stocke les identifiants de connexion jusqu'à ce que l'utilisateur se déconnecte
              localStorage.setItem('userInfo', JSON.stringify(userInfo));
              this.$router.push({ name: 'posts' }); //Renvoi vers la page des posts
            })
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
</script>

<style lang="scss">

#formElement {
  margin: 20px auto;
  display:flex;
  flex-direction: column;
  padding: 5px;
  max-width: 300px;
}

#userLogin {
  margin:10px auto;
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
a {
    font-weight: bold;
    color: #381302;
}
#no-account {
  margin-bottom: 70px;
}
</style>