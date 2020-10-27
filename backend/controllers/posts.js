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
        let postInfo = {
            pseudo: result[0].pseudo,
            avatar: result[0].avatar_url,
            title: result[0].title,
            description: result[0].description,
            link:result[0].link,
            mediaUrl: result[0].media_url,
            numero: result[0].numero,
            date: result[0].date
          };
        let getLikesQuery = `SELECT users.pseudo as usersLike FROM users INNER JOIN likes ON likes.user_id = users.id WHERE likes.post_id =${req.params.id}`;
        db.query(getLikesQuery, function (err, result) {
          if (err) throw err;
          else { let usersLike = [];
            for (let i = 0; i < result.length; i++) {
              usersLike.push(result[i].usersLike);
              }
            const usersLikeObject = {usersLike: usersLike};
            postInfo = {...postInfo, ...usersLikeObject};
            
            let getDislikesQuery = `SELECT users.pseudo as usersDislike FROM users INNER JOIN dislikes ON dislikes.user_id = users.id WHERE dislikes.post_id =${req.params.id}`;
            db.query(getDislikesQuery, function (err, result) {
              if (err) throw err;
              else { let usersDislike = [];
                for (let i = 0; i < result.length; i++) {
                  usersDislike.push(result[i].usersDislike);
                  }
                const usersDislikeObject = {usersDislike: usersDislike};
                postInfo = {...postInfo, ...usersDislikeObject};
                res.status(200).json(postInfo);}
                })
          }
        })
      }

      else {res.status(401).json({ error: 'Pas de post trouvé !' });}
    }
  })
}

//Fonction d'envoi au front de l'objet sauce demandé (requête GET)
exports.getPostComments = (req, res, next) => {
  let getCommentQuery = `SELECT users.pseudo, comments.numero, comments.comment FROM comments INNER JOIN users ON comments.user_id = users.id WHERE comments.post_id =${req.params.id} ORDER BY comments.date DESC`;
  db.query(getCommentQuery, function (err, result) {
    if (err) throw err;
    else {
      if(result.length > 0) {
        const Comments = [];
        for (let i = 0; i < result.length; i++) {
          Comments.push({
            id: result[i].numero,
            pseudo: result[i].pseudo,
            comment: result[i].comment
          })
        }
        res.status(200).json(Comments);
      }
      else {res.status(200).json([]);}
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

//Fonction d'envoi au front de l'objet sauce demandé (requête GET)
exports.deleteComment = (req, res, next) => {
  let deleteCommentQuery = "DELETE FROM comments where numero = " + req.params.id;
  db.query(deleteCommentQuery, function (err, result) {
    if (err) res.status(400).json({error: err.message});
    else res.status(200).json({message: 'Commentaire supprimé !'});
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

//Fonction d'ajout d'un nouveau commentaire (requête POST)
exports.commentPost = (req, res, next) => {
  const postCommentQuery = `INSERT INTO comments VALUES (NULL,"${req.body.userId}","${req.params.id}","${req.body.comment}", NOW())`;
  db.query(postCommentQuery, function (err, result) {
    if (!err) {
      res.status(201).json({ message: 'Commentaire créé !' })
    }
    else throw err;     
    });
}

//Traitement des requetes portant sur les likes (requête POST)
exports.likePost = (req, res, next) => {
  if (req.body.like==2) {
    const eraseQuery = `delete from dislikes where post_id = ${req.params.id} and user_id = ${req.body.userId}`;
    db.query(eraseQuery, function (err, result) {
      if (!err) {
        const likeQuery = `insert into likes values (${req.params.id},${req.body.userId})`;
        db.query(likeQuery, function (err, result) {
          if (!err) {
            res.status(201).json({ message: 'Like pris en compte !' })
          }
          else throw err;     
          });
      }
      else throw err;     
      });
    }

  else if (req.body.like==1) {
    const likeQuery = `delete from likes where user_id = ${req.body.userId} and post_id = ${req.params.id}`;
    db.query(likeQuery, function (err, result) {
      if (!err) {
        res.status(201).json({ message: 'Like pris en compte !' })
      }
      else throw err;     
      });
    }
  
  else if (req.body.like==-1) {
    const dislikeQuery = `delete from dislikes where user_id = ${req.body.userId} and post_id = ${req.params.id}`;
    db.query(dislikeQuery, function (err, result) {
      if (!err) {
        res.status(201).json({ message: 'Like pris en compte !' })
      }
      else throw err;     
      });
    }
  
  else {
    const eraseQuery = `delete from likes where post_id = ${req.params.id} and user_id = ${req.body.userId}`;
    db.query(eraseQuery, function (err, result) {
      if (!err) {
        const dislikeQuery = `insert into dislikes values (${req.params.id},${req.body.userId})`;;
        db.query(dislikeQuery, function (err, result) {
          if (!err) {
          res.status(201).json({ message: 'Like pris en compte !' })
      }
      else throw err;     
      });
    }
    else throw err;
    })
  }
}
        