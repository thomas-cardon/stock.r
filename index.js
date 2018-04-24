const mongoose = require('mongoose');
const path = require('path');

global.generate = function(a,b){for(b=a='';a++<36;b+=a*51&52?(a^15?8^Math.random()*(a^20?16:4):4).toString(16):'-');return b} // Génère un UUID aléatoire
// Principe UUID: 1 chance sur 1 million de retrouver le même UUID aléatoirement

const Product = mongoose.model('Product', {
  id: { type: String, default: generate() },
  name: String,
  qty: Number,
  price: Number,
  location: String,
  logs: Array
});

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(session({
  saveUninitialized: false,
  resave: true,
  secret: generate(),
  store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

/*
* Body Parser nous permet d'afficher nativement les objets qui nous sont envoyés
*/
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/assets', express.static(path.join(__dirname, 'server/assets')));

let Storage = require('samss').getStorage('FS', 'file.json');

async function load() {
  let Storage = await require('samss').getStorage('FS', 'file.json').load();
  await Storage.default().add('mongoose-address', 'mongodb://192.168.1.31/barcodes').end();

  await mongoose.connect(Storage.get('mongoose-address'));

  mongoose.model('User', require('./models/User')); // Modèle utilisateur
  app.get('/', (req, res) => res.sendFile(__dirname + '/server/login.html'));

  var routes = require('./routes/users');
  app.use('/users', routes);

  // catch 404 and forward to error handler
  app.use(function (req, res, next) {
    var err = new Error('File Not Found');
    err.status = 404;
    next(err);
  });

  // error handler
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.send(err);
  });

  http.listen(process.argv[3] || 7800, process.argv[2] || '0.0.0.0');
}

load().then(() => console.log(`Started Barcodes server on: ${(process.argv[2] || '0.0.0.0') + ':' + (process.argv[3] || 7800)}. Reminder: Work in progress.`));
