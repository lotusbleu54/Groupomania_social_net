const jwt = require('jsonwebtoken');
const db = require('../db');

//Token caché
require('dotenv').config();

/*Même fonction que auth sauf qu'ici on cherche à savoir si l'utilisateur est l'administrateur 
ou la personne qui a créé le commentaire qu'on cherche à supprimer*/

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.TOKEN);
    const userId = decodedToken.userId;
    const findUserEmailQuery = `select email from users where id = ${userId}`;
    db.query(findUserEmailQuery, function (err, result) {
      if (!err) {
        if (result[0].email ===process.env.DB_ADMIN_EMAIL) {next();}
        else {
          const findUserIdQuery = `select user_id as userId from comments where numero = ${req.params.id}`;
          db.query(findUserIdQuery, function (err, result) {
            if (!err) {
              if ((req.body.userId && req.body.userId !== userId) || result[0].userId !== userId) {
                res.status(401).json({error: 'Requête non authorisée'});
              }
              else {next();}
            }
            else res.status(400).json({error: 'Mauvaise requête'}); 
          })
        }
      }
      else {
        res.status(400).json({error: 'Mauvaise requête'});
      }
    })
  }
  catch {res.status(401).json({error: 'Requête non authorisée'})}  
};