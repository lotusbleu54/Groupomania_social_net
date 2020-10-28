const express = require('express');
const router = express.Router();

//Import du middleware multer pour la gestion des images
const multer = require('../middleware/multer-config');

//Import du middleware authSupUser pour sécuriser les routes de modification ou suppression user
const authSupUser = require('../middleware/authsupuser');

const userCtrl = require('../controllers/user');

router.post('/signup', multer, userCtrl.createAccountLimiter, userCtrl.signup);
router.post('/login', userCtrl.apiLimiter, userCtrl.login);
router.get('/:id', authSupUser, userCtrl.getUserInfo);
router.put('/:id', authSupUser, multer, userCtrl.modifyUser); //Permet de modifier l'avatar
router.delete('/:id', authSupUser, userCtrl.deleteUser); //Permet d'effacer un utilisateur

module.exports = router;