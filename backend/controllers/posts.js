const fs = require('fs');
const db = require('../db');

//Fonction d'ajout d'un nouveau post (requête POST)
exports.createPost = (req, res, next) => {
  if (req.file) {
    const postObject = JSON.parse(req.body.post);
    const mediaUrl = `${req.protocol}://${req.get('host')}/medias/${req.file.filename}`;
    const postQuery = `INSERT INTO Posts VALUES (NULL,"${postObject.userId}","${postObject.title}","${postObject.description}","${mediaUrl}","${postObject.url}", NOW())`;
    db.query(postQuery, function (err, result) {
      if (!err) {
        res.status(201).json({ message: 'Post créé !' })
      }
      else throw err;     
      });
  }
  else {
    const postQuery = `INSERT INTO Posts VALUES (NULL,"${req.body.userId}","${req.body.title}","${req.body.description}","","${req.body.url}", NOW())`;
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
  let getAllQuery = "SELECT users.pseudo, users.avatar_url, posts.title, posts.media_url, posts.numero, TIMEDIFF(NOW(),posts.date) as date FROM posts INNER JOIN users ON posts.user_id = users.id ORDER BY `date` ASC";
  db.query(getAllQuery, function (err, result) {
    if (err) throw err;
    else {
      if(result.length > 0) {
        const Posts = [];
        for (let i = 0; i < result.length; i++) {
          Posts.push({
            pseudo: result[i].pseudo,
            avatar: result[i].avatar_url,
            title: result[i].title,
            mediaUrl: result[i].media_url,
            numero: result[i].numero,
            date: result[i].date
          })
        }
        res.status(200).json(Posts);
      }
      else {res.status(200).json([]);}
    }
  })
}

//Fonction d'envoi au front de l'objet sauce demandé (requête GET)
exports.getOnePost = (req, res, next) => {
  let getOneQuery = `SELECT users.pseudo, users.avatar_url, posts.title, posts.media_url, posts.numero, posts.link, posts.description, TIMEDIFF(NOW(),Posts.date) as date FROM posts INNER JOIN users ON posts.user_id = users.id WHERE posts.numero =${req.params.id}`;
  db.query(getOneQuery, function (err, result) {
    if (err) throw err;
    else {
      if(result.length > 0) {
        res.status(200).json({
            pseudo: result[0].pseudo,
            avatar: result[0].avatar_url,
            title: result[0].title,
            description: result[0].description,
            link:result[0].link,
            mediaUrl: result[0].media_url,
            numero: result[0].numero,
            date: result[0].date
          })
        }
      else {res.status(401).json({ error: 'Pas de post trouvé !' });}
    }
  })
}

//Fonction d'envoi au front de l'objet sauce demandé (requête GET)
exports.deletePost = (req, res, next) => {
  let deletePostQuery = "DELETE FROM posts where numero = " + req.params.id;
  db.query(deletePostQuery, function (err, result) {
    if (err) res.status(400).json({error: err.message});
    else res.status(200).json({message: 'Post supprimé !'});
  })
}

//Fonction de modification de l'objet sauce (requête PUT)
exports.modifyPost = (req, res, next) => {
  if (req.file) {
    const postObject = JSON.parse(req.body.post);
    const infoMediaUrlQuery = "SELECT media_url FROM posts where numero = "+ req.params.id;
    const mediaUrl = `${req.protocol}://${req.get('host')}/medias/${req.file.filename}`;
    db.query(infoMediaUrlQuery, function (err, result) {
      if (err) {res.status(400).json({ error : err.code });}
      else {
        const oldMediaUrl = result[0].media_url.split('/medias/')[1];
        const putQuery = `UPDATE Posts SET title = "${postObject.title}", description = "${postObject.description}", media_url = "${mediaUrl}", link = "${postObject.url}" where numero = ${req.params.id}`;
        db.query(putQuery, function (err, result) {
          if (!err) {
            fs.unlink(`medias/${oldMediaUrl}`, () => {res.status(200).json({ message: 'Post modifié !'});})
          }
          else res.status(400).json({ error : err.code })     
        });
      }
    })
  }
  else {
    const putQuery = `UPDATE Posts SET title = "${req.body.title}", description = "${req.body.description}", media_url = "${req.body.mediaUrl}" , link = "${req.body.url}" where numero = ${req.params.id}`;
    if (req.body.mediaUrl==false) {
      const infoMediaUrlQuery = "SELECT media_url FROM posts where numero = "+ req.params.id;
      db.query(infoMediaUrlQuery, function (err, result) {
        if (err) {res.status(400).json({ error : err.code });}
        else {
          const oldMediaUrl = result[0].media_url.split('/medias/')[1];
          fs.unlink(`medias/${oldMediaUrl}`, () => {
            db.query(putQuery, function (err, result) {
              if (!err) {res.status(200).json({ message: 'Post modifié !'})}
              else res.status(400).json({ error : err.code })     
            });
          })
        }
      })
    }
    else {
    db.query(putQuery, function (err, result) {
      if (!err) {
        res.status(200).json({ message: 'Post modifié !'})
      }
      else res.status(400).json({ error : err.code })     
      });
    }
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
        