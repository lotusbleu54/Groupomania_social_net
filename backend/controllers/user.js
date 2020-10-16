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

exports.signup = (req, res, next) => {
    const userObject = JSON.parse(req.body.user);
    const imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
    if (passwordRegex.test(userObject.password)) { //Si la sécurité du mot de passe correspond au critère demandé
      bcrypt.hash(userObject.password, 10) //Algorythme de hashage du mot de passe
      .then((hash) => {
        //Le hash est sauvegardé dans la base et non le mot de passe en clair
        let signupQuery = "INSERT INTO User2 VALUES (NULL,'" + userObject.email + "','" + hash + "','" + userObject.pseudo + "','"+imageUrl+"')";
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

exports.login = (req, res, next) => {
  let loginQuery = "SELECT * FROM User2 where email = '" + req.body.email + "'";
  console.log(loginQuery);
  db.query(loginQuery, function (err, result) {
    if (err) throw err;
    else {
      if(result.length > 0) {
        bcrypt.compare(req.body.password, result[0].mdp)
        .then((valid) => {
          if (!valid) {return res.status(401).json({ error: 'Mot de passe incorrect !' });}
          else {res.status(200).json({ //Retourne le User Id et le Token
              userId: result[0].id,
              token: jwt.sign({ userId: result[0].id },process.env.TOKEN,{ expiresIn: '24h' })
          });}
        })
        .catch(error => res.status(500).json({ error }));
      }
      else {res.status(401).json({ error: 'Utilisateur non trouvé !' });}
    }
});
}

/*
    User.findOne({ email: req.body.email })
      .then(user => {
        if (!user) { //Cas où il n'y a pas d'utilisateur enregistré avec cette adresse e-mail
          return res.status(401).json({ error: 'Utilisateur non trouvé !' });
        }
        bcrypt.compare(req.body.password, user.password) //Comparaison des hashs pour voir si le mot de passe est valide
          .then((valid) => {
            if (!valid) {return res.status(401).json({ error: 'Mot de passe incorrect !' });}
            else {res.status(200).json({ //Retourne le User Id et le Token
                userId: user._id,
                token: jwt.sign({ userId: user._id },process.env.TOKEN,{ expiresIn: '24h' })
            });}
          })
          .catch(error => res.status(500).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
};
*/

//Permet d'effacer un user de la base
exports.deleteUser = (req, res, next) => {
  let deleteQuery = "DELETE FROM User where id = " + req.params.id;
  db.query(deleteQuery, function (err, result) {
    if (err) {res.status(400).json({ error : err.code });}
    else {res.status(200).json({ message: 'Utilisateur supprimé !'});}
  })
}