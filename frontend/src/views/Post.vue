<template>
  <div class="Post">
    <header class="header">
        <div id="logo">
            <img alt="Vue logo" src="../assets/logo.png">
        </div>
        <div id="add">
        <router-link to="/addpost" v-if="pseudo"> <i class="far fa-plus-square fa-2x"></i> <br> Créer un Post </router-link>
        </div>
        <nav id="nav">
            <ul>
                <li @click = "displayMenu"><i class="fas fa-user-circle fa-3x"></i></li>
                <li class = "invisible"><router-link :to="'/user/'+id" v-if="pseudo">Mon profil</router-link></li>
                <li class = "invisible"><router-link to="/" href class="disconnection" @click = "disconnection" v-if="pseudo"> Déconnexion </router-link></li>
            </ul>
        </nav>
    </header>
    <h1 v-if="pseudo">Bonjour {{pseudo}}, voici les détails du Post</h1>
    <section>
    <div id="postDiv"></div>
    <div id="commentDiv">
        <label for="comment">Ajouter un commentaire :</label>
        <textarea type="text" id="comment" name="comment" minlength="1" maxlength="499"></textarea>
        <button type="button" class="button button__send" @click="postComment">Envoyer</button>
    </div>
    <div class="allComments"></div>
    <router-link to="/posts"> <button class = "button button__back"> <i class="fas fa-undo"></i> Retourner aux posts </button> </router-link>
    <button class = "button button__modify" v-if= "pseudo===postPseudo||pseudo==='SuperAdmin'" @click= "modifyPost"> Modifier le post </button>
    <button class ="button button__delete" v-if= "pseudo===postPseudo||pseudo==='SuperAdmin'" @click= "deletePost" ><i class="fas fa-trash"></i> Supprimer le post </button>
    <div class="loader" v-show="waiting===true"></div>
    <p id="erreur" v-show="success===false"> Echec de la requête : {{message}} </p>
    </section>
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
            postPseudo: "",
            numberOfComments: 0,
            userLike:false,
            userDislike:false
        }
    },

    computed: {
        ...mapState(['id','pseudo', 'token'])
    },

    mounted() {
        this.getPostDetails();
    },

    methods: {
        displayMenu() {
            const menu = document.getElementsByClassName("invisible");
            for (let i = 0; i < menu.length; i++) {
                if (menu[i].style.display == "none") {menu[i].setAttribute("style","display:block");}
                else {menu[i].setAttribute("style","display:none");}
            }
        },

        getPostDetails(){
            document.getElementById("postDiv").innerHTML='';
            this.userLike=false;
            this.userDislike=false;
            const menu = document.getElementsByClassName("invisible");
            for (let i = 0; i < menu.length; i++) {
                menu[i].setAttribute("style","display:none");
            }
            const optionsGetPost = {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.token}`
                }
            };
            const currentUrl = window.location.href;
            const postId = currentUrl.substr((currentUrl.lastIndexOf("/") + 1));
            this.waiting = true;

            fetch(`http://localhost:3000/api/posts/${postId}`, optionsGetPost)
            .then (res => {
                if (res.status == 200) {
                res.json ()
                    .then (json => {
                        this.waiting=false;
                        const divToFill = document.getElementById('postDiv');
                        let newH2 = document.createElement("h2");
                        newH2.textContent = json.title;
                        divToFill.appendChild(newH2);
                        if (json.description) {
                        let newP = document.createElement("p");
                        newP.textContent = json.description;
                        newP.setAttribute("id","postDescription");
                        divToFill.appendChild(newP);
                        }
                        if (json.mediaUrl) {
                        const mediaContainer = document.createElement("div");
                        divToFill.appendChild(mediaContainer);
                        const mediaExtension = json.mediaUrl.substr((json.mediaUrl.lastIndexOf('.') + 1));
                            if (mediaExtension === 'mp4') {
                            const newVideo = document.createElement("video");
                            newVideo.src = json.mediaUrl;
                            newVideo.controls = true;
                            newVideo.textContent = json.mediaUrl;
                            mediaContainer.appendChild(newVideo);
                            }
                            else {
                            const newImage = document.createElement("img");
                            newImage.src = json.mediaUrl;
                            newImage.alt = json.mediaUrl;
                            mediaContainer.appendChild(newImage);
                            }
                        }
                        if (json.link) {
                        let newP = document.createElement("p");
                        let newA = document.createElement("a");
                        newA.href = json.link;
                        newA.textContent = json.link;
                        newP.appendChild(newA);
                        divToFill.appendChild(newP);
                        }

                        //Pseudo et avatar
                        const avatarContainer = document.createElement("p");
                        divToFill.appendChild(avatarContainer);
                        avatarContainer.textContent = `Par ${json.pseudo} `;
                        this.postPseudo=json.pseudo;
                        const newImage = document.createElement("img");
                        newImage.src = json.avatar;
                        newImage.alt = json.avatar;
                        newImage.width = 50;
                        newImage.height = 50;
                        divToFill.appendChild(newImage);
                        
                        //Info indiquant de quand date le post
                        const publishedOn = document.createElement("p");
                        //L'info date reçue de la base indique "post publié il y a hhh:mm:ss " 
                        //On ne s'intéresse ici qu'au nombre d'heures depuis que la post a été publié
                        const hoursSincePost = parseInt(json.date.substring(0,json.date.indexOf(':')));
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
                        divToFill.appendChild(publishedOn);

                        const likesAndComments = document.createElement("div");
                        likesAndComments.setAttribute("id", "likesAndComments");

                        const likesDiv = document.createElement("div");
                        likesAndComments.appendChild(likesDiv);

                        const likeDiv = document.createElement("div");
                        likeDiv.setAttribute("class", "like");
                        likeDiv.innerHTML='<i class="far fa-thumbs-up fa-lg"></i>';
                        if (json.usersLike.indexOf(this.pseudo) != -1)
                         {likeDiv.style.color = "green";
                         this.userLike=true;}
                        if (json.usersLike.length>0) {
                            likeDiv.innerHTML+= " "+ json.usersLike.length;
                        }
                        likeDiv.addEventListener("click", this.postLike);
                        likesDiv.appendChild(likeDiv);

                        const dislikeDiv = document.createElement("div");
                        dislikeDiv.setAttribute("class", "like");
                        dislikeDiv.innerHTML='<i class="far fa-thumbs-down fa-lg"></i>';
                        if (json.usersDislike.indexOf(this.pseudo) != -1)
                         {dislikeDiv.style.color = "red";
                            this.userDislike=true;}
                        if (json.usersDislike.length>0) {
                            dislikeDiv.innerHTML+= " "+ json.usersDislike.length;
                        }
                        dislikeDiv.addEventListener("click", this.postDislike);
                        likesDiv.appendChild(dislikeDiv);

                        const numberComments = document.createElement("p");
                        numberComments.setAttribute("id", "numberOfComments");
                        
                        this.getAllComments();
                        
                        likesAndComments.appendChild(numberComments);
                        divToFill.appendChild(likesAndComments);

                    })
                }
                else {res.json ()
                .then (() => {
                    this.$router.push({ name: 'login' });
                    }
                )}
            })
            .catch (() => {
            this.waiting=false;
            this.success= false;
            this.message = "Désolé, le serveur ne répond pas ! Veuillez réessayer ultérieurement";
            })
        },

        postLike(){
            const postId = window.location.href.substr((window.location.href.lastIndexOf("/") + 1));
            this.waiting=true;
            console.log(this.userLike);
            if (this.userLike == true) {
                const optionsLike = {
                    method: 'POST',
                    body: JSON.stringify({"userId": this.id, "like": 1}),
                    headers: {'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`}
                };
                console.log(optionsLike);
                fetch(`http://localhost:3000/api/posts/${postId}/like`, optionsLike)
                    .then (res => {
                        if (res.status == 201) {
                            res.json ()
                                .then (() => {
                                    this.success=true;
                                    this.waiting=false;
                                    alert("Like pris en compte");
                                    this.getPostDetails();
                                })
                            }
                            else {res.json ()
                                .then (json => {
                                    this.waiting=false;
                                    this.success = false;
                                    this.message = json.error;
                                    })
                                }
                    })
                    .catch (() => {
                        this.waiting=false;
                        this.success= false;
                        this.message = "Désolé, le serveur ne répond pas ! Veuillez réessayer ultérieurement";
                        });
                
                }
            else {
                const optionsLike = {
                    method: 'POST',
                    body: JSON.stringify({"userId": this.id, "like": 2}),
                    headers: {'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`}
                };
                fetch(`http://localhost:3000/api/posts/${postId}/like`, optionsLike)
                    .then (res => {
                        if (res.status == 201) {
                            res.json ()
                                .then (() => {
                                    this.success=true;
                                    this.waiting=false;
                                    alert("Like pris en compte");
                                    this.getPostDetails();
                                })
                            }
                            else {res.json ()
                                .then (json => {
                                    this.waiting=false;
                                    this.success = false;
                                    this.message = json.error;
                                    })
                                }
                    })
                    .catch (() => {
                        this.waiting=false;
                        this.success= false;
                        this.message = "Désolé, le serveur ne répond pas ! Veuillez réessayer ultérieurement";
                        });
            }
        },

        postDislike() {
            const postId = window.location.href.substr((window.location.href.lastIndexOf("/") + 1));
            this.waiting=true;
            console.log(this.userDislike);
            if (this.userDislike == true) {
                const optionsDislike = {
                    method: 'POST',
                    body: JSON.stringify({"userId": this.id, "like": -1}),
                    headers: {'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`}
                };
                fetch(`http://localhost:3000/api/posts/${postId}/like`, optionsDislike)
                    .then (res => {
                        if (res.status == 201) {
                            res.json ()
                                .then (() => {
                                    this.success=true;
                                    this.waiting=false;
                                    alert("Dislike pris en compte");
                                    this.getPostDetails();
                                })
                            }
                            else {res.json ()
                                .then (json => {
                                    this.waiting=false;
                                    this.success = false;
                                    this.message = json.error;
                                    })
                                }
                    })
                    .catch (() => {
                        this.waiting=false;
                        this.success= false;
                        this.message = "Désolé, le serveur ne répond pas ! Veuillez réessayer ultérieurement";
                        });
            }
            else {
                const optionsDislike = {
                    method: 'POST',
                    body: JSON.stringify({"userId": this.id, "like": -2}),
                    headers: {'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`}
                };
                fetch(`http://localhost:3000/api/posts/${postId}/like`, optionsDislike)
                    .then (res => {
                        if (res.status == 201) {
                            res.json ()
                                .then (() => {
                                    this.success=true;
                                    this.waiting=false;
                                    alert("Dislike pris en compte");
                                    this.getPostDetails();
                                })
                            }
                            else {res.json ()
                                .then (json => {
                                    this.waiting=false;
                                    this.success = false;
                                    this.message = json.error;
                                    })
                                }
                    })
                    .catch (() => {
                        this.waiting=false;
                        this.success= false;
                        this.message = "Désolé, le serveur ne répond pas ! Veuillez réessayer ultérieurement";
                        });
            }
        },

        disconnection(event) {
            event.preventDefault();
            this.$store.commit('CONNECT_USER', ["","",""]);
            this.$router.push({ name: 'login' });
    },
        modifyPost() {
            const currentUrl = window.location.href;
            const postId = currentUrl.substr((currentUrl.lastIndexOf("/") + 1));
            this.$router.push({ path: `/modifypost/${postId}` })
    },

        getAllComments() {
            document.getElementsByClassName("allComments")[0].innerHTML='';
            const optionsGetComments = {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.token}`
                }
            };
            const postId = window.location.href.substr((window.location.href.lastIndexOf("/") + 1));
            this.waiting = true;
            fetch(`http://localhost:3000/api/posts/${postId}/comment`, optionsGetComments)
            .then (res => {
            if (res.status == 200) 
            {
                res.json ()
                    .then (json => {
                        this.waiting=false;
                        this.numberOfComments = json.length;
                        if (this.numberOfComments > 1)
                        {document.getElementById("numberOfComments").textContent= this.numberOfComments + " commentaires";}
                        else if (this.numberOfComments == 1)
                        {document.getElementById("numberOfComments").textContent= "1 commentaire";}
                        else {document.getElementById("numberOfComments").textContent= "Pas encore de commentaire";}
                        const divToFill = document.getElementsByClassName('allComments')[0];
                        if (json.length>0) {
                            const introP = document.createElement("p");
                            introP.setAttribute("id","commentsIntro");
                            introP.textContent= "Tous les commentaires :";
                            divToFill.appendChild(introP);
                            for (let i = 0; i < json.length; i++) {
                                const newP = document.createElement("p");
                                const newSpan = document.createElement("span");
                                newSpan.textContent = json[i].pseudo + " : " + json[i].comment;
                                newP.appendChild(newSpan);
                                divToFill.appendChild(newP);
                                if (this.pseudo == json[i].pseudo || this.pseudo == 'SuperAdmin') {
                                    const newButton = document.createElement("button");
                                    newButton.setAttribute("type","button");
                                    newButton.setAttribute("class", "deleteComment");
                                    newButton.innerHTML = '<i class="fas fa-trash fa-lg"></i>';
                                    newP.appendChild(newButton);

                                    newButton.addEventListener("click", () => {
                                        const optionsDeleteComment = {
                                            method: 'DELETE',
                                            headers: {
                                                'Authorization': `Bearer ${this.token}`
                                            }
                                        };
                                        this.waiting = true;
                                        fetch(`http://localhost:3000/api/posts/${json[i].id}/comment`, optionsDeleteComment)
                                        .then (res => {
                                            if (res.status == 200) {res.json ()
                                                .then (() => {
                                                this.waiting=false;
                                                alert("Le commentaire a bien été supprimé");
                                                newP.remove();
                                                this.numberOfComments--;
                                                document.getElementById("numberOfComments").textContent = this.numberOfComments + " commentaires";
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
                                    }) 
                                }
                            }
                        }
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

        deletePost() {
            let confirmation = confirm("Etes-vous certain de vouloir supprimer ce post ?");
            if (confirmation == true) {
                const optionsDeletePost = {
                    method: 'DELETE',
                    headers: {
                    'Authorization': `Bearer ${this.token}`
                    }
                };
                const currentUrl = window.location.href;
                const postId = currentUrl.substr((currentUrl.lastIndexOf("/") + 1));
                this.waiting = true;

                fetch(`http://localhost:3000/api/posts/${postId}`, optionsDeletePost)
                    .then (res => {
                        if (res.status == 200) {res.json ()
                            .then (() => {
                                this.waiting=false;
                                alert("Le post a bien été supprimé");
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
        },

        postComment() {
            const postId = window.location.href.substr((window.location.href.lastIndexOf("/") + 1));
            if (document.getElementById("comment").checkValidity()) {
                this.waiting = true;
                const post = {"userId": this.id, "comment": document.getElementById("comment").value};
                const optionsPostComment = {
                    method: 'post',
                    body:JSON.stringify(post),
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.token}`
                        }
                };
                fetch(`http://localhost:3000/api/posts/${postId}/comment`, optionsPostComment)
                    .then (res => {
                        if (res.status == 201) {
                            res.json ()
                                .then (() => {
                                    this.success=true;
                                    this.waiting=false;
                                    alert("Commentaire publié");
                                    this.getAllComments();
                                })
                            }
                            else {res.json ()
                                .then (json => {
                                    this.waiting=false;
                                    this.success = false;
                                    this.message = json.error;
                                    })
                                }
                    })
                    .catch (() => {
                        this.waiting=false;
                        this.success= false;
                        this.message = "Désolé, le serveur ne répond pas ! Veuillez réessayer ultérieurement";
                        });
            }
                
        }
    }
}

</script>

<style lang="scss">

section {
    width:60%;
    margin:auto;
}

#postDiv {
    text-align: center;
    box-shadow: 5px 5px 10px grey; //effet d'ombre
    margin:30px auto;
    background-color: #C9E6EB;
    padding:5px;
}

#postDescription {
    text-align: justify;
}

#commentDiv {
    margin:20px auto;
    
    & > textarea {
        margin:5px;
        width:90%;
    }
}

#commentsIntro {
    text-align: center;
}

.allComments > p {
    margin:15px;
    word-wrap: break-word;
}

.allComments > p:nth-child(2n) {
    text-align: left;
}

.allComments > p:nth-child(2n+1) {
    text-align: right;
}

p span {
    background-color: #C9E6EB;
    margin-right: 10px;
}

.deleteComment {
    background-color: #C9E6EB;
    cursor: pointer;
    border-radius: 8px;
    padding: 5px;
}

#likesAndComments {
    display:flex;
    justify-content: space-around;
}

.like {
    margin:8px;
    &:hover {
    cursor: pointer;
    }
}

.button {
    color: white;
    cursor: pointer;
    border-radius: 8px;
    margin: 15px 5px;
    padding: 10px;
    font-weight:bold;
    font-size: 16px;

    &__modify {
        background-color: #673ab7;
    }
    &__delete {
        background-color: red;
    }
    &__send {
        background-color: #FD2A00;
    }
    &__back {
        color:black;
        background-color: white;
    }
    & > a {
        text-decoration: none;
    }
}


img, video {
max-width:80%;
max-height:200px;
}
</style>