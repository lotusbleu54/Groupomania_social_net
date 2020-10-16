<template>
  <div id="login">
    <header class="header">
      <div id="logo">
        <img alt="Vue logo" src="../assets/logo.png">
      </div>
      <div id="nav">
        <router-link to="/">Se connecter</router-link> |
        <router-link to="/signup">Créer un compte</router-link>
      </div>
    </header>
    <h1> Bienvenue sur le forum interne de Groupomania ! </h1>
    <h2> Veuillez entrer vos identifiants pour vous connecter </h2>
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
    success: true,
    waiting: false,
    message :""
    }
  },
  methods: {
    checkForm() {
      if (document.getElementById("mail").checkValidity() && document.getElementById("pass").checkValidity()) {
        document.getElementById("userLogin").disabled = false;
      }
      else document.getElementById("userLogin").disabled = true;
    },

    sendForm(event) {
      event.preventDefault();
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
          this.message = "Désolé, le serveur ne répond pas !";
        })
      }
  }
}
</script>

<style lang="scss">
header {
  display: flex;
  justify-content: space-between;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #381302;

    &.router-link-exact-active {
      color: #FD2A00;
    }
  }
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

#formElement {
  margin: 20px auto;
  display:flex;
  flex-direction: column;
  padding: 5px;
  max-width: 300px;
}
label {
  margin-top:5px;
  font-size:20px;
}
input {
  margin:10px;
  height:24px;
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