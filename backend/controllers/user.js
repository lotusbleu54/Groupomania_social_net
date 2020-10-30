const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const fs = require('fs');
const passwordRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!\?@\.#\$%\^&\*])(?=.{8,})");
// Mot de passe fort avec au moins 8 caractères dont au moins 1 minuscule, 1 majuscule, 1 chiffre, et 1 caractère spécial

//Limiter la création de trop de comptes et trop de tentatives de connection
const rateLimit = require("express-rate-limit");
const { json } = require('body-parser');

exports.apiLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // Fenêtre de 5 minutes
    max: 10, //3 tentatives de connections max depuis cette IP
    message: {error: "Trop de tentatives de connection depuis cette IP, veuillez réessayer ultérieurement"}
  });

exports.createAccountLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // Fenêtre d'1 heure
    max: 20, // 2 comptes créés max depuis cette IP
    message: {error : "Trop de tentatives de créations de compte depuis cette IP, veuillez réessayer ultérieurement"}
  });

// Récupère les infos du formulaire, enregistre l'url de l'avatar, vérifie que l'utilisateur n'existe pas déjà, teste la sécurité du mot de passe
exports.signup = (req, res, next) => {
    const userObject = JSON.parse(req.body.user);
    const imageUrl = `${req.protocol}://${req.get('host')}/medias/${req.file.filename}`;
    if (passwordRegex.test(userObject.password)) { //Si la sécurité du mot de passe correspond au critère demandé
      bcrypt.hash(userObject.password, 10) //Algorythme de hashage du mot de passe
      .then((hash) => {
        //Le hash est sauvegardé dans la base et non le mot de passe en clair
        let signupQuery = "INSERT INTO users VALUES (NULL,'" + userObject.email + "','" + hash + "','" + userObject.pseudo + "','"+imageUrl+"')";
        db.query(signupQuery, function (err, result) {
          if (!err) {
            res.status(201).json({ message: 'Utilisateur créé !' })
          }
          else if (err.code==='ER_DUP_ENTRY') {
            res.status(401).json({ error: "L'utilisateur ou le pseudo existe déjà !" })
          }
          else throw err;     
          });
      })
      .catch(error => res.status(500).json({ error }));
    }
    else {
      res.status(400).json({error: "Le mot de passe n'est pas assez sécurisé"});
    }
}

//Vérifie que l'utilisateur existe et que le mdp est correct puis renvoie un token de connection avec l'id et le pseudo
exports.login = (req, res, next) => {
  let loginQuery = "SELECT * FROM users where email = '" + req.body.email + "'";
  db.query(loginQuery, function (err, result) {
    if (err) throw err;
    else {
      if(result.length > 0) {
        bcrypt.compare(req.body.password, result[0].password)
        .then((valid) => {
          if (!valid) {return res.status(401).json({ error: 'Mot de passe incorrect !' });}
          else {res.status(200).json({ //Retourne le User Id, le pseudo et le Token
              id: result[0].id,
              pseudo: result[0].pseudo,
              token: jwt.sign({ userId: result[0].id },process.env.TOKEN,{ expiresIn: '24h' })
          });}
        })
        .catch(error => res.status(500).json({ error }));
      }
      else {res.status(401).json({ error: 'Utilisateur non trouvé !' });}
    }
});
}

//Permet de récupérer les infos de l'utilisateur (avatar et email)
exports.getUserInfo = (req, res, next) => {
  let getUserInfoQuery = 'SELECT email, avatar_url FROM users where id = '+ db.escape(req.params.id);
  db.query(getUserInfoQuery, function (err, result) {
    if (err) throw err;
    else {
      if(result.length > 0) {
        res.status(200).json({
            email: result[0].email,
            avatarUrl: result[0].avatar_url,
          })
        }
      else {res.status(401).json({ error: "L'utilisateur n'a pas été trouvé !" });}
    }
  })
}

//Permet de modifier l'avatar d'un user
exports.modifyUser = (req, res, next) => {
  const avatarUrl = `${req.protocol}://${req.get('host')}/medias/${req.file.filename}`;
  const infoAvatarQuery = "SELECT avatar_url FROM users where id = "+ req.params.id;
  db.query(infoAvatarQuery, function (err, result) {
    if (err) {res.status(400).json({ error : err.code });}
    else {
      const oldAvatarUrl = result[0].avatar_url.split('/medias/')[1];
      const modifyAvatarQuery = "UPDATE users SET avatar_url = '"+avatarUrl+"' WHERE id = "+ req.params.id;
      db.query(modifyAvatarQuery, function (err, result) {
        if (err) {res.status(400).json({ error : err.code });}
        else {
          fs.unlink(`medias/${oldAvatarUrl}`, () => {res.status(200).json({ message: 'Avatar modifié !'});})
        }
      })
    }
  })
}

//Permet d'effacer un user de la base
exports.deleteUser = (req, res, next) => {
  const deleteAvatarQuery = "SELECT avatar_url FROM users where id = "+ req.params.id;
  db.query(deleteAvatarQuery, function (err, result) {
    if (err) {res.status(400).json({ error : err.code });}
    else {
      const filename = result[0].avatar_url.split('/medias/')[1];
      fs.unlink(`medias/${filename}`, () => {
        let deleteQuery = "DELETE FROM users where id = " + req.params.id;
          db.query(deleteQuery, function (err, result) {
            if (err) {res.status(400).json({ error : err.code });}
            else {res.status(200).json({ message: 'Utilisateur supprimé !'});}
        })
      })
    }
  })
}