const express = require('express');
const router = express.Router();

//Import du middleware auth pour sécuriser les routes
const auth = require('../middleware/auth');
//Import du middleware authsup pour n'autoriser que l'admin ou l'utilisateur qui a créé le post à le modifier ou supprimer
const authsup = require('../middleware/authsup');
//Import du middleware authsupcomment pour n'autoriser que l'admin ou l'utilisateur qui a créé le commentaire à le supprimer
const authsupcomment = require('../middleware/authsupcomment');
//Import du middleware multer pour la gestion des images et vidéos
const multerVideo = require('../middleware/multer-config-video');

//Controlleur des routes définies plus bas
const postsCtrl = require('../controllers/posts');

router.post('/', auth, multerVideo , postsCtrl.createPost);
router.get('/', auth, postsCtrl.getAllPosts);
router.get('/:id', auth, postsCtrl.getOnePost);
router.delete('/:id', authsup, postsCtrl.deletePost);
router.put('/:id', authsup, multerVideo, postsCtrl.modifyPost);
router.post('/:id/comment', auth, postsCtrl.commentPost);
router.get('/:id/comment', auth, postsCtrl.getPostComments);
router.delete('/:id/comment', authsupcomment, postsCtrl.deleteComment);
router.post('/:id/like', auth, postsCtrl.likePost);

module.exports = router;