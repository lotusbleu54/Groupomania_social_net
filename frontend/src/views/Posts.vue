<template>
  <div class="AddPost">
    <header class="header">
      <div id="logo"><img alt="Vue logo" src="../assets/logo.png"></div>
      <div id="add">
        <router-link to="/addpost"> <i class="far fa-plus-square fa-2x"></i> <br> Créer un Post </router-link>
      </div>
      <nav id="nav">
        <ul>
          <li @click = "displayMenu"><i class="fas fa-user-circle fa-3x"></i></li>
          <li class = "invisible"><router-link :to="'/user/'+id">Mon profil</router-link></li>
          <li class = "invisible disconnection" @click = "disconnection"> Déconnexion </li>
        </ul>
      </nav>
    </header>
    <h1 v-if="pseudo">Bonjour {{pseudo}}, voici les derniers posts</h1>
    <div id="postsDiv"></div>
    <div class="loader" v-show="waiting===true"></div>
    <p id="erreur" v-show="success===false"> Echec de la requête : {{message}} </p>
  </div>
</template>

<script>

export default {

  //data actualisées au chargement de la page ainsi qu'au cours de certains événements
  data: function() {
    return {
      success: true, //affichage d'un message d'erreur si passe à false
      waiting: false, //spinner affiché si variable passe à true
      message :"", //message d'erreur
      id: "", //id de l'utilisateur connecté
      token: "", //token de connection
      pseudo:"", //pseudo de l'utilisateur connecté
      Posts: [] //array contenant l'ensemble des posts après requête db
    }
  },

  //Chargement automatique dès que le js est monté
  mounted() {
    const userInfo = JSON.parse(localStorage.getItem('userInfo')); //on récupère les infos de connection
    if (userInfo) { //On vérifie si l'utilisateur s'est connecté, sinon on le renvoie vers la page login
    this.pseudo = userInfo.pseudo;
    this.id = userInfo.id;
    this.token = userInfo.token;

    //On cache les menus "Mon profil" et "Déconnection" tant que l'utilisateur ne clique pas sur l'icône
    const menu = document.getElementsByClassName("invisible");
    for (let i = 0; i < menu.length; i++) {
      menu[i].setAttribute("style","display:none");
    }

    this.getAllPosts(); //Appel de la fonction qui charge l'ensemble des posts
    }

    else this.$router.push({ name: 'login' });

  },

  methods: {

    getAllPosts() {
      //Appel à l'API
      const options = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.token}`
        }
      };
      this.waiting = true;
      fetch("http://localhost:3000/api/posts", options)
      //Cas où la réponse est OK
      .then (res => {if (res.status == 200) {res.json ()
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
            //Pour chaque post, possibilité d'être redirigé sur la page détails
            newDiv.addEventListener('click', () => {this.$router.push("post/"+json[i].numero);})
            divToFill.appendChild(newDiv);

            //Titre du post
            let newH2 = document.createElement("h2");
            newH2.textContent = json[i].title;
            newDiv.appendChild(newH2);

            //Affichage du média s'il y en a un
            if (json[i].mediaUrl) {
            const mediaContainer = document.createElement("div");
            newDiv.appendChild(mediaContainer);
            const mediaExtension = json[i].mediaUrl.substr((json[i].mediaUrl.lastIndexOf('.') + 1));
              //Si c'est une vidéo
              if (mediaExtension === 'mp4') {
              const newVideo = document.createElement("video");
              newVideo.src = json[i].mediaUrl;
              newVideo.controls = true;
              newVideo.textContent = json[i].mediaUrl;
              mediaContainer.appendChild(newVideo);
              }
              //Sinon c'est forcément une image
              else {
              const newImage = document.createElement("img");
              newImage.src = json[i].mediaUrl;
              newImage.alt = json[i].mediaUrl;
              mediaContainer.appendChild(newImage);
              }
            }
            
            //Affichage de l'avatar en miniature
            const avatarContainer = document.createElement("p");
            newDiv.appendChild(avatarContainer);
            avatarContainer.textContent = `Par ${json[i].pseudo} `;
            const newImage = document.createElement("img");
            newImage.src = json[i].avatar;
            newImage.alt = json[i].avatar;
            newImage.width = 50;
            newImage.height = 50;
            newDiv.appendChild(newImage);

            //Affiche depuis quand le post est publié
            const publishedOn = document.createElement("p");
            //La réponse de la DB nous indique depuis combien d'heures/min/sec le post est publié sous le format hhh:mm:ss
            //On ne sélectionne que la partie "heures" pour la suite de la logique
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

          } //Fin de la boucle de création des posts

          //Disparition du spinner d'attente et pas de message d'erreur
          this.waiting=false;
          this.success = true;
          })

          //Si échec requête (par exemple code 401 "non autorisé") renvoi page d'accueil
        } else {res.json ().then (() => {this.$router.push({ name: 'login' });})}
      })
    
      //Cas où le serveur ne répond pas
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
    }

  } //Fin des méthodes
  
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

  &:hover { //Effet de loupe de de fondu quand on survole le post avec la souris
    transform: scale(1.1);
    opacity: 0.6;
    cursor:pointer;
  }
}

//L'affichage prend 90% de la page sur écran mobile
@media screen and (max-width: 600px) {
  .post {width:90%;}
}

//Limitation taille affichage vidéo et image
img, video {
  max-width:90%;
  max-height:250px;
}

</style>