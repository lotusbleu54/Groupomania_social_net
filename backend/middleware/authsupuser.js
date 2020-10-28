const jwt = require('jsonwebtoken');
const db = require('../db');

//Token caché
require('dotenv').config();

/*Même fonction que auth sauf qu'ici on cherche à savoir si l'utilisateur est l'administrateur 
ou la personne qui cherche à voir, modifier ou supprimer son compte */

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.TOKEN);
    const userId = decodedToken.userId;
    const findUserEmailQuery = `select email from users where id = ${userId}`;
    db.query(findUserEmailQuery, function (err, result) {
      if (!err) {
        if (result[0].email === process.env.DB_ADMIN_EMAIL || req.params.id == userId) {next();}
        else throw err;
        } 
    else throw err;
    })
  }
  catch {res.status(401).json({error: 'Requête non authorisée'})}  
};