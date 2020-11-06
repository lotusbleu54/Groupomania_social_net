const mysql = require('mysql');

//Données DB cachées
require('dotenv').config();

//Infos de connexion à la DB
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

//Affiche "Connected à la console si la connexion réussit"
connection.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});

module.exports = connection;