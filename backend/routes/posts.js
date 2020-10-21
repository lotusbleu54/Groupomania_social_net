const express = require('express');
const router = express.Router();

//Import du middleware auth pour sécuriser les routes
const auth = require('../middleware/auth');
//Import du middleware authsup pour n'autoriser que l'admin ou l'utilisateur qui a créé une sauce à la modifier ou supprimer
const authsup = require('../middleware/authsup');
//Import du middleware multer pour la gestion des images
const multerVideo = require('../middleware/multer-config-video');

const postsCtrl = require('../controllers/posts');

router.post('/', auth, multerVideo , postsCtrl.createPost);
router.get('/', postsCtrl.getAllPosts);
/*
router.get('/:id', auth, postsCtrl.getOnePost);
router.put('/:id', authsup, multer, postInputValidation, postsCtrl.modifyPost);
router.delete('/:id', authsup, postsCtrl.deletePost);
router.post('/:id/like', auth, postsCtrl.likePost);
router.post('/:id/comment', auth, commentInputValidation, postsCtrl.commentPost);
router.delete('/:id/comment', authsup, postsCtrl.deleteComment);
*/
module.exports = router;