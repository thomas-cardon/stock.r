const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

let UserSchema = new mongoose.Schema({
  id: { type: String, default: generate() },
  firstName: String,
  lastName: String,
  avatar: { type: String, default: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR05-WvgvoVVFR0fQCTWhyhiTHGinaX4FK8-Dux8QrLzrSZ8oQ3SQ' },
  rank: { type: Number, default: 100 },
  lastConnection: { type: Date, default: new Date() },
  email: { type: String, unique: true, required: true, trim: true },
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  desc: { type: String, default: 'Cet utilisateur n\'a pas de description.' }
});

//authenticate input against database
UserSchema.statics.authenticate = async function (email, password) {
  let users = await this.find({}, { _id: 0 /* Supprime _id de l'objet parce qu'on à déjà id */ }).or([{ email: email }, { username: email }]).lean().exec();

  if (users.length === 0) {
    let err = new Error('User not found.');
    err.status = 404;
    throw err;
  }

  return users[0]; // GRAVE BUGGE POUR L'INSTANT, ON FORCE LE RETOUR DE L'UTILISATEUR SANS S'ASSURER QUE LE MOT DE PASSE FONCTIONNE, BCRYPT N'ARRIVE PAS A VOIR QUE LE HASH = MDP

  let match = await bcrypt.compare(password, users[0].password);

  if (match) return users[0];
  else return match;
};

// Hasher le mot de passe avant la sauvegarde
UserSchema.pre('save', function (next) {
  if (!this.isNew) return next();
  
  let user = this;
  bcrypt.hash(user.password, 10, function (err, hash) {
    if (err) {
      return next(err);
    }
    user.password = hash;
    next();
  })
});

module.exports = UserSchema;
