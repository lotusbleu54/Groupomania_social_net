//Chiffres, lettres, majuscules, minuscules, accents, chiffres et ponctuation basique autorisée
const inputsRegex = new RegExp("^[A-Za-zÀ-ÿ0-9'?!. ,;_-]+$");

//Définition du nombre de caractères min et max 
const commentMinLength = 3;
const commentMaxLength = 100;

module.exports = (req, res, next) => {
  try {
        if (req.body.comment.length <= commentMinLength || req.body.comment.length >= commentMaxLength || !(inputsRegex.test(req.body.comment)) ) {
            throw 'Invalid inputs !';
        } 
        else {next();} //Si pas d'erreur la validation est OK, les requêtes suivantes peuvent être effectuées
    }
  catch {res.status(400).json({error: new Error('Invalid request!')});}
}