<template>
  <div class="User">
    <header class="header">
      <div id="logo">
        <img alt="Vue logo" src="../assets/logo.png">
      </div>
      <div id="nav">
        <router-link to="/posts" v-if="pseudo"> <i class="fas fa-arrow-circle-left"></i> Retourner aux posts | &nbsp; </router-link>
        <button class="disconnection" @click = "disconnection" v-if="pseudo"> Déconnexion </button>
        <button class="disconnection" @click = "disconnection" v-else> Me connecter </button>
      </div>
    </header>
    <h1 v-if="pseudo">Bonjour {{pseudo}}, voici les détails de votre profil</h1>
    <div id="profilDiv"></div>

    <button class="modifyAvatar" v-if="id==urlId" @click="modifyUser"> Modifier mon avatar </button>
    <button class="deleteAvatar" v-if="id==urlId" @click="deleteUser"> Supprimer mon compte </button>
    <div class="loader" v-show="waiting===true"></div>
    <p id="erreur" v-show="success===false"> Echec de la requête : {{message}} </p>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
    data: function() {
        return {
            success: true,
            waiting: false,
            message :"",
            Posts: [],
            title: "",
            urlId: "",
        }
    },

    computed: {
        ...mapState(['id','pseudo', 'token'])
    },

    beforeMount() {

        const currentUrl = window.location.href;
        this.urlId = currentUrl.substr((currentUrl.lastIndexOf("/") + 1));
        const options = {
            method: 'GET',
            headers: {
            'Authorization': `Bearer ${this.token}`
            }
        };
        this.waiting = true;

        fetch(`http://localhost:3000/api/auth/${this.urlId}`, options)
            .then (res => {
            if (res.status == 200) {
                res.json ().then (json => {
                    this.waiting=false;
                    const divToFill = document.getElementById('profilDiv');
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

        deleteUser() {
            const options = {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${this.token}`
                }
            };
            let confirmation = confirm("Etes-vous certain de vouloir supprimer votre compte ?");
            if (confirmation == true) {
                this.waiting = true;

                fetch(`http://localhost:3000/api/auth/${this.urlId}`, options)
                    .then (res => {
                        if (res.status == 200) {res.json ().then (() => {
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
            newConfirmButton.setAttribute("class","confirm");
            newConfirmButton.textContent = "Confirmer la modification";
            newDiv2.appendChild(newConfirmButton);

            newConfirmButton.addEventListener('click', () => {
                const fileToSend = document.getElementById("avatar").files[0];
                if (fileToSend.size > 1*1000*1000) {
                    this.waiting=false;
                    this.success = false;
                    this.message = "La taille maximale du fichier doit être de 1Mb";
                }
                else {
                    let formData = new FormData();
                    formData.append('image', fileToSend);
                    this.waiting = true;
                    const options = {
                        method: 'PUT',
                        body: formData,
                        headers: {'Accept': 'application/json, text/plain, */*'}
                    };
                    fetch(`http://localhost:3000/api/auth/${this.urlId}`, options)
                        .then (res => {
                            if (res.status == 200) {res.json ().then (() => {
                                this.waiting=false;
                                alert("L'avatar a bien été modifié");
                                this.$router.push({ name: 'posts' });
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
            })

            const newCancelButton = document.createElement("button");
            newCancelButton.setAttribute("class","cancel");
            newCancelButton.textContent = "Annuler la modification";
            newDiv2.appendChild(newCancelButton);
            newCancelButton.addEventListener('click', () => {
                document.getElementsByClassName("modifyAvatar")[0].setAttribute("style","display:inline");
                document.getElementsByClassName("deleteAvatar")[0].setAttribute("style","display:inline");
                newDiv.remove();
                newDiv2.remove();
                newCancelButton.remove();
                newConfirmButton.remove();
            })

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