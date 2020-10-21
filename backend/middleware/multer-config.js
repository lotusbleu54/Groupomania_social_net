const multer = require('multer');
const { nextTick } = require('process');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

const maxSize = 1 * 1000 * 1000; //Max 1Mb

//Définition de l'emplacement de stockage et du nom du fichier
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'medias');
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_');
    const nameWithoutExt = name.split('.')[0];
    const extension = MIME_TYPES[file.mimetype];
    callback(null, nameWithoutExt + Date.now() + '.' + extension);
  }
});

const fileFilter = function (req, file, callback) {
  if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
    return callback(new Error('Seules les images de type jpg ou png sont autorisées.'), false);
  }
callback(null, true);
}

module.exports = (req, res, next) => {
    const upload = multer({storage: storage, limits: maxSize, fileFilter: fileFilter}).single('image');
    upload(req, res, function (err) {
      if (err) {
      // A Multer error occurred when uploading.
      console.log(err.message);
      res.status(403).json({error: err.message});
      }
      else {next();}
    })
  }
/*
module.exports = multer({
  storage: storage,
  limits: { fileSize: maxSize }, //Limite de la taille du fichier ajoutée ici
  fileFilter: (req, file, callback) => {// Ne permet que l'ajout d'images de type jp(e)g ou png
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
        return callback(new Error('Only jpg or png images are allowed.'), false);
    }
    callback(null, true);
  }
})
.single('image'); //N'accepte qu'un seul fichier à la fois
*/