const mongoose = require('mongoose');
const path = require('path');

function generate(a,b){for(b=a='';a++<36;b+=a*51&52?(a^15?8^Math.random()*(a^20?16:4):4).toString(16):'-');return b} // Génère un UUID aléatoire
// Principe UUID: 1 chance sur 1 million de retrouver le même UUID aléatoirement

const User = mongoose.model('User', {
  id: { type: String, default: generate() },
  firstName: String,
  lastName: String,
  username: String,
  password: String, // Hash sécurisé
  avatar: { type: String, default: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR05-WvgvoVVFR0fQCTWhyhiTHGinaX4FK8-Dux8QrLzrSZ8oQ3SQ' },
  rank: { type: Number, default: 100 },
  lastConnection: { type: Date, default: new Date() }
});

const Product = mongoose.model('Product', {
  id: { type: String, default: generate() },
  name: String,
  qty: Number,
  price: Number,
  location: String,
  logs: Array
});

const express = require('express');

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use('/assets', express.static(path.join(__dirname, 'server/assets')));


let Storage = require('samss').getStorage('FS', 'file.json');

async function load() {
  let Storage = await require('samss').getStorage('FS', 'file.json').load();
  await Storage.default().add('mongoose-address', 'mongodb://192.168.1.31/barcodes').end();

  await mongoose.connect(Storage.get('mongoose-address'));

  /*await new User({ // A N'EXECUTER QU'UNE FOIS SINON CA VA CREER DES UTILISATEURS A CHAQUE LANCEMENT
    firstName: 'Thomas',
    lastName: 'Cardon',
    username: 'Ryzzzen',
    password: 'zzz000',
    rank: 1000
  }).save();

  await new User({
    firstName: 'Sarah',
    lastName: 'Duault',
    username: 'Sealrack',
    password: 'zzz000',
    rank: 1000
  }).save();*/

  app.get('/', (req, res) => res.sendFile(__dirname + '/server/index.html'));

  require('socketio-auth')(io, {
    authenticate: function (socket, data, callback) {
      console.dir(arguments);

      //get credentials sent by the client
      var username = data.username;
      var password = data.password;

      User.find({ username: username }).exec().then(users => {
        if (users.length > 0) return callback(null, user.password == password);
        else return callback(new Error("User not found"));
      }).catch(err => callback(new Error(err)));
    },
    postAuthenticate: function (socket, data) {
      console.dir(arguments);

      var username = data.username;

      User.find({ username: username }).exec().then(users => {
        socket.client.user = users[0];
      });
    },
    timeout: 1000
  });

  http.listen(process.argv[3] || 7800, process.argv[2] || '0.0.0.0');
}

load().then(() => console.log(`Started Barcodes server on: ${(process.argv[2] || '0.0.0.0') + ':' + (process.argv[3] || 7800)}. Reminder: Work in progress.`));
