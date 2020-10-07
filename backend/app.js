const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const helmet = require('helmet');  // plugin de sécurité pour les requêtes HTTP, les headers, protection XSS, détection du MIME TYPE...

//Import des routes
const postsRoutes = require('./routes/posts');
const userRoutes = require('./routes/user');

const app = express();

app.use(helmet()); // Exécution du plugin de sécurité

//Pour contourner les erreurs de CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

//Requêtes exploitables
app.use(bodyParser.json());

//Gestion de la ressource image de façon statique
app.use('/images', express.static(path.join(__dirname, 'images')));

//Routes de l'API
app.use('/api/posts', postsRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;
