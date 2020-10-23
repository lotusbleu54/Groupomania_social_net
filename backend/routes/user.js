const express = require('express');
const router = express.Router();

//Import du middleware multer pour la gestion des images
const multer = require('../middleware/multer-config');

//Import du middleware auth pour sécuriser les routes
const auth = require('../middleware/auth');

const userCtrl = require('../controllers/user');

router.post('/signup', multer, userCtrl.createAccountLimiter, userCtrl.signup);
router.post('/login', userCtrl.apiLimiter, userCtrl.login);
router.get('/:id', auth, userCtrl.getUserInfo);
router.put('/:id', multer, userCtrl.modifyUser); //Permet de modifier l'avatar
router.delete('/:id', auth, userCtrl.deleteUser); //Permet d'effacer un utilisateur au besoin

module.exports = router;