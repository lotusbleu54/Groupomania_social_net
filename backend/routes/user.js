const express = require('express');
const router = express.Router();

//Import du middleware multer pour la gestion des images
const multer = require('../middleware/multer-config');

const userCtrl = require('../controllers/user');

router.post('/signup', multer, userCtrl.createAccountLimiter, userCtrl.signup);
router.post('/login', userCtrl.apiLimiter, userCtrl.login);
//router.get('/:id', userCtrl.getUserInfo);
//router.put('/:id', userCtrl.modifyUser); //Permet de modifier l'avatar
router.delete('/:id', userCtrl.deleteUser); //Permet d'effacer un utilisateur au besoin

module.exports = router;