const multer = require('multer');
const { nextTick } = require('process');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'video/mp4': 'mp4'
};

const maxSize = 20 * 1000 * 1000; //Max 20Mb

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
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|mp4)$/)) {
    return callback(new Error('Seules les images de type jpg, png ou gif et les vidéos de format mp4 sont autorisés.'), false);
  }
callback(null, true);
}

module.exports = (req, res, next) => {
    const upload = multer({storage: storage, limits: maxSize, fileFilter: fileFilter}).single('media');
    upload(req, res, function (err) {
      if (err) {
      // A Multer error occurred when uploading.
      res.status(403).json({error: err.message});
      }
      else {next();}
    })
  }