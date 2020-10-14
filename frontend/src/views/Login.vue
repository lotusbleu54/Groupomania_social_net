<template>
  <div id="login">
    <form id="formElement" @submit = "sendForm">
      <label for="mail">Adresse e-mail : </label>
      <input type="email" id="mail" name="email" required> <br>
      <label for="pass">Mot de passe : </label>
      <input type="password" id="pass" name="password" minlength="8" required> <br>
      <input type="submit" id="userLogin" value="Connexion">
    </form>
    <p v-show="success===false"> erreur : {{message}} </p>
  </div>
</template>

<script>

export default {
  data: function() {
    return {
    success: true,
    message :""
    }
  },
  methods: {
    sendForm(event) {
      event.preventDefault();
      let email= document.getElementById("mail").value;
      let password = document.getElementById("pass").value;
      const options = {
        method: 'POST',
        body: JSON.stringify({"email": email, "password": password}),
        headers: {'Content-Type': 'application/json'}
      };
      fetch("http://localhost:3000/api/auth/login", options)
        .then (res => {
          if (res.status == 200) {console.log("OK !");}
          else {res.json ()
          .then (json => {
            this.success = false;
            this.message = json.error;
            console.log (json.error);
            }
          )}
        })
      }
  }
}
</script>
