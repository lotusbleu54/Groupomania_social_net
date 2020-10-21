const fs = require('fs');
const db = require('../db');

//Fonction d'ajout d'un nouveau post (requête POST)
exports.createPost = (req, res, next) => {
  if (req.file) {
    const postObject = JSON.parse(req.body.post);
    const mediaUrl = `${req.protocol}://${req.get('host')}/medias/${req.file.filename}`;
    const postQuery = "INSERT INTO Posts VALUES (NULL,'" + postObject.userId + "','" + postObject.title + "','" + postObject.description + "','" + postObject.url + "','"+ mediaUrl + "', NOW())";
    db.query(postQuery, function (err, result) {
      if (!err) {
        res.status(201).json({ message: 'Post créé !' })
      }
      else throw err;     
      });
  }
  else {
    const postQuery = "INSERT INTO Posts VALUES (NULL,'" + req.body.userId + "','" + req.body.title + "','" + req.body.description + "','" + req.body.url + "', NULL, NOW())";
    db.query(postQuery, function (err, result) {
      if (!err) {
        res.status(201).json({ message: 'Post créé !' })
      }
      else throw err;     
      });
  }
}

//Fonction d'envoi au front de toutes les sauces (requête GET)
exports.getAllPosts = (req, res, next) => {
  let getAllQuery = "SELECT user2.pseudo, user2.avatar_url, posts.title, posts.media_url, posts.date FROM posts INNER JOIN user2 ON posts.user_id = user2.id ORDER BY `date` DESC";
  db.query(getAllQuery, function (err, result) {
    if (err) throw err;
    else {
      if(result.length > 0) {
        const Posts = [];
        for (let i = 0; i < result.length; i++) {
          Posts.push({
            Pseudo: result[i].pseudo,
            Avatar: result[i].avatar_url,
            title: result[i].title,
            mediaUrl: result[i].media_url,
            date: result[i].date
          })
        }
        res.status(200).json(Posts);
      }
      else {res.status(401).json({ error: 'Pas de post trouvé !' });}
    }
  })
}

//Fonction d'envoi au front de l'objet sauce demandé (requête GET)
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({_id: req.params.id})
  .then((sauce) => {res.status(200).json(sauce);})
  .catch((error) => {res.status(404).json({error});});
}

//Fonction de modification de l'objet sauce (requête PUT)
exports.modifySauce = (req, res, next) => {
  if (req.file) { //Cas où l'image est modifiée
    const sauceObject = { //Création d'un nouvel objet sauce avec les nouveaux champs et l'url de la nouvelle image
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    }
    Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      const filename = sauce.imageUrl.split('/images/')[1]; 
      //On cherche à retrouver le nom du fichier image précédent pour le supprimer
      fs.unlink(`images/${filename}`, () => { //Une fois l'image précédente supprimée, on met à jour la sauce dans la DB
      Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
      .then(() => res.status(200).json({ message: 'Sauce modifiée !'}))
      .catch(error => res.status(400).json({ error }));
      })
    })
    .catch(error => res.status(500).json({ error }));
  }
  else { //Cas où l'image n'est pas modifiée
    Sauce.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Sauce modifiée !'}))
    .catch(error => res.status(400).json({ error }));
  }
}

//Fonction de suppression d'une sauce (requête DELETE)
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
  .then((sauce) => {
    const filename = sauce.imageUrl.split('/images/')[1];
    fs.unlink(`images/${filename}`, () => { //Suppression de l'image
        Sauce.deleteOne({ _id: req.params.id }) //Effacement dans la DB
          .then(() => res.status(200).json({ message: 'Sauce supprimée !'}))
          .catch(error => res.status(400).json({ error }));
      });
    })
  .catch(error => res.status(500).json({ error }));
}

//Traitement des requpetes portant sur les likes de sauces (requête POST)
exports.likeSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id}) //Recherche de la sauce dans la DB
    .then((sauce) => { //On récupère les likes et dislikes de la sauce avant mise à jour
        var likes = sauce.likes;
        var dislikes = sauce.dislikes;
        var usersLiked = sauce.usersLiked;
        var usersDisliked = sauce.usersDisliked;
        //Cas où l'utilisateur like une sauce qu'il n'a pas déjà liké
        if (req.body.like==1 && !(usersLiked.includes(req.body.userId))) {
          likes+=1;
          usersLiked.push(req.body.userId);
        }
        //Cas où l'utilisateur dislike une sauce qu'il n'a pas déjà disliké
        else if (req.body.like==-1 && !(usersDisliked.includes(req.body.userId))) {
          dislikes+=1;
          usersDisliked.push(req.body.userId);
        }
        //Cas où l'utilisateur "dé-like" une sauce
        else if (req.body.like == 0 && usersLiked.includes(req.body.userId)) {
          likes-=1;
          var index = usersLiked.indexOf(req.body.userId);
              if (index > -1) {usersLiked.splice(index, 1);}
        }
        //Cas où l'utilisateur "dé-dislike" une sauce
        else if (req.body.like == 0 && usersDisliked.includes(req.body.userId)) {
          dislikes-=1;
          var index = usersDisliked.indexOf(req.body.userId);
              if (index > -1) {usersDisliked.splice(index, 1);}
        }
      //Mise à jour de la DB pour la partie like/dislike
      Sauce.updateOne({ _id: req.params.id }, {
        likes:likes,
        dislikes:dislikes,
        usersLiked:usersLiked,
        usersDisliked:usersDisliked,
        _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Like pris en compte'}))
        .catch(error => res.status(400).json({ error }))
    })
    .catch((error) => {res.status(404).json({error});});
}
        