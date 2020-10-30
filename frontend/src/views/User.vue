<template>
  <div class="User">
    <header class="header">
      <div id="logo">
        <img alt="Vue logo" src="../assets/logo.png">
      </div>
      <nav id="nav">
        <ul>
          <li class="disconnection" @click = "disconnection"> Déconnexion </li>
        </ul>
      </nav>
    </header>
    <h1 v-if="pseudo">Bonjour {{pseudo}}, voici les détails du profil</h1>
    <div id="profilDiv"></div>

    <router-link to="/posts"> <button class = "button button__back"> <i class="fas fa-undo"></i> Retourner aux posts </button> </router-link>
    <button class="button button__modify modifyAvatar" v-if="id==urlId" @click="modifyUser"> Modifier mon avatar </button>
    <button class="button button__delete deleteAvatar" v-if="id==urlId" @click="deleteUser"> Supprimer mon compte </button>
    <div class="loader" v-show="waiting===true"></div>
    <p id="erreur" v-show="success===false"> Echec de la requête : {{message}} </p>
  </div>
</template>

<script>

export default {
    data: function() {
        return {
            success: true, //affichage d'un message d'erreur si passe à false
            waiting: false, //spinner affiché si variable passe à true
            message :"", //message d'erreur
            id: "", //id de l'utilisateur connecté
            token: "", //token de connection
            pseudo:"", //pseudo de l'utilisateur connecté
            urlId:""
        }
    },

    //Chargement automatique dès que le js est monté
    mounted() {
        this.urlId=window.location.href.substr((window.location.href.lastIndexOf("/") + 1));
        const userInfo = JSON.parse(localStorage.getItem('userInfo')); //on récupère les infos de connection
        if (userInfo) { //On vérifie si l'utilisateur s'est connecté, sinon on le renvoie vers la page login
            this.id = userInfo.id;
            this.pseudo = userInfo.pseudo;
            this.token = userInfo.token;

            this.getUserInfo();
        }

        else this.$router.push({ name: 'login' });
    },

    methods: {

        getUserInfo() {
            
            //Appel à l'API
            const options = {
                method: 'GET',
                headers: {
                'Authorization': `Bearer ${this.token}`
                }
            };
            this.waiting = true;

            fetch(`http://localhost:3000/api/auth/${this.urlId}`, options)
            .then (res => {
            if (res.status == 200) {res.json ()
                .then (json => {
                    this.waiting=false;
                    const divToFill = document.getElementById('profilDiv');

                    //Affichage profil avec email et avatar
                    let newP = document.createElement("p");
                    newP.textContent = "Adresse e-mail : "+json.email;
                    divToFill.appendChild(newP);
                    let newP2 = document.createElement("p");
                    newP2.textContent = "Avatar : ";
                    divToFill.appendChild(newP2);
                    let imageContainer = document.createElement("div");
                    divToFill.appendChild(imageContainer);
                    let newImg = document.createElement("img");
                    newImg.src = json.avatarUrl;
                    newImg.alt = json.avatarUrl;
                    newImg.setAttribute("id", "avatarImage");
                    imageContainer.appendChild(newImg);
                })
            }

            //Sinon on est renvoyé vers la page login
            else {res.json ().then (() => {this.$router.push({ name: 'login' });})}
        })
        .catch (() => {
            this.waiting=false;
            this.success= false;
            this.message = "Désolé, le serveur ne répond pas ! Veuillez réessayer ultérieurement";
        })
    },

    //Effacement des données de connection et redirection vers la page login
    disconnection() {
        localStorage.clear();
        this.$router.push({ name: 'login' });
    },

    //Suppression totale de l'utilisateur
    deleteUser() {
        const options = {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${this.token}`
            }
        };
        //Demande de confirmation
        let confirmation = confirm("Etes-vous certain de vouloir supprimer votre compte ?");
        if (confirmation == true) {
            this.waiting = true;
            fetch(`http://localhost:3000/api/auth/${this.id}`, options)
                .then (res => {
                    if (res.status == 200) {res.json ()
                        .then (() => {
                            this.waiting=false;
                            alert("Le compte a bien été supprimé");
                            this.$store.commit('CONNECT_USER', ["","",""]);
                            this.$router.push({ name: 'signup' });
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
    },

    //Modification de l'avatar
    modifyUser() {
        document.getElementsByClassName("modifyAvatar")[0].setAttribute("style","display:none");
        document.getElementsByClassName("deleteAvatar")[0].setAttribute("style","display:none");
        const divToFill= document.getElementById('profilDiv');
        const newDiv = document.createElement("div");
        divToFill.appendChild(newDiv);
        const newLabel = document.createElement("label");
        newLabel.setAttribute("for", "avatar");
        newLabel.classList.add("custom-file-upload");
        newLabel.innerHTML = '<i class="fa fa-upload" aria-hidden="true"></i> Télécharger un nouvel avatar';
        newDiv.appendChild(newLabel);
        const newInput = document.createElement("input");
        newInput.setAttribute("type", "file");
        newInput.setAttribute("name", "avatar");
        newInput.setAttribute("id", "avatar");
        newInput.setAttribute("accept", "image/*");
        newInput.setAttribute("required", true);
        newDiv.appendChild(newInput);

        const newDiv2 = document.createElement("div");
        divToFill.appendChild(newDiv2);
        const newConfirmButton = document.createElement("button");
        newConfirmButton.classList.add("confirm", "button", "button__modify");
        newConfirmButton.textContent = "Confirmer la modification";
        newDiv2.appendChild(newConfirmButton);

        //Fonction à réaliser en cas de click sur le bouton de modification de l'avatar
        newConfirmButton.addEventListener('click', () => {
        const fileToSend = document.getElementById("avatar").files[0];
            //Pas d'envoi si image > 1Mb
            if (fileToSend && fileToSend.size > 1*1000*1000) {
                this.waiting=false;
                this.success = false;
                this.message = "La taille maximale du fichier doit être de 1Mb";
            }

            //méthode put avec le nouvel avatar
            else if (fileToSend) {
                let formData = new FormData();
                formData.append('image', fileToSend);
                this.waiting = true;
                const options = {
                    method: 'PUT',
                    body: formData,
                    headers: {'Accept': 'application/json, text/plain, */*',
                        'Authorization': `Bearer ${this.token}`}
                };
                fetch(`http://localhost:3000/api/auth/${this.id}`, options)
                    .then (res => {
                        if (res.status == 200) {res.json ()
                            .then (() => {
                                this.waiting=false;
                                alert("L'avatar a bien été modifié");
                                this.$router.push({ name: 'posts' });
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
        })

            //Bouton de retour en arrière sur la modification de l'avatar
            const newCancelButton = document.createElement("button");
            newCancelButton.classList.add("cancel", "button", "button__delete");
            newCancelButton.textContent = "Annuler la modification";
            newDiv2.appendChild(newCancelButton);

            //Fonction appelée en cas de click sur ce bouton
            newCancelButton.addEventListener('click', () => {
                document.getElementsByClassName("modifyAvatar")[0].setAttribute("style","display:inline");
                document.getElementsByClassName("deleteAvatar")[0].setAttribute("style","display:inline");
                newDiv.remove();
                newDiv2.remove();
                newCancelButton.remove();
                newConfirmButton.remove();
            })

            //En cas de chargement d'une image, affichage de l'aperçu
            newInput.addEventListener('change', () => {
                const fileUploaded = document.getElementById("avatar").files[0];
                    if (fileUploaded) {
                        const reader = new FileReader();
                        this.imageLoaded = true;
                        reader.addEventListener("load", function() {
                            document.getElementById('avatarImage').setAttribute("src", this.result);
                        });
                        reader.readAsDataURL(fileUploaded);
                    }
                    else {this.imageLoaded=false;}
            })
            
        },
    }
}

</script>