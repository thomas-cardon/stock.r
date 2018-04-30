const path = require('path');
const mongoose = require('mongoose');

global.generate = function(a,b){for(b=a='';a++<36;b+=a*51&52?(a^15?8^Math.random()*(a^20?16:4):4).toString(16):'-');return b} // Génère un UUID aléatoire
// Principe UUID: 1 chance sur 1 million de retrouver le même UUID aléatoirement

const express = require('express');

let app = express();
let bodyParser = require('body-parser');
let MongoStore = require('connect-mongo')(require('express-session'));

let http = require('http').Server(app);
let io = require('socket.io')(http);

let moment = require('moment');
moment().format();

let session = require('express-session')({
  saveUninitialized: false,
  resave: true,
  secret: generate(),
  store: new MongoStore({ mongooseConnection: mongoose.connection })
});

let sharedsession = require("express-socket.io-session");

app.use(session);

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// On définit le moteur de rendu sur Pug
io.use(sharedsession(session, {
    autoSave:true
}));

/*
* Body Parser nous permet d'afficher nativement les objets qui nous sont envoyés
*/
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/assets', express.static(path.join(__dirname, 'server/assets')));

async function load() {
  let Storage = await require('samss').getStorage('FS', 'file.json').load();
  await Storage.default().add('mongoose-address', 'mongodb://192.168.1.31/barcodes').end();

  await mongoose.connect(Storage.get('mongoose-address'));

  mongoose.model('User', require('./models/User')); // Modèle utilisateur
  mongoose.model('Product', require('./models/Product')); // Produit
  mongoose.model('ProductOutput', require('./models/ProductOutput')); // Sorties de produits (demandes)
  mongoose.model('ActivityLog', require('./models/ActivityLog')); // Enregistrements d'activité

  /*
  * Cette méthode enregistre les activités dans la collection ActivityLog.
  */
  app.use(function (req, res, next) {
    let log = { ip: req.ip, line: `[${moment().format('DD/MM/YYYY - hh:mm:ss')}] ${req.protocol.toUpperCase()} ${req.originalUrl}` };
    if (req.session.userId) log.user = req.session.userId;

    new ActivityLog(log).save();
    console.log(log.line);
    next();
  });

  /*
  * Si l'utilisateur à un identifiant d'utilisateur enregistré dans sa session, le serveur le redirige vers l'endpoint /dashboard du routeur /users (=/users/dashboard)
  * Sinon, il lui envoie la page de connexion
  */
  app.get('/', (req, res) => {
    if (req.session.userId) res.redirect('/dashboard');
    else res.sendFile(__dirname + '/server/login.html');
  }); // Redirige les gens sur la page de connexion

  app.use('/users', require('./controllers/routes/users'));
  app.use('/dashboard', require('./controllers/routes/dashboard'));

  const ActivityLog = mongoose.model('ActivityLog');

  /*
  * Cette méthode arrive à la fin du middleware, ce qui veut dire qu'aucune méthode n'a répondu à la requête. Donc on considère que c'est une erreur 404 à rediriger vers Error Handler
  */
  app.use(function (req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;

    next(err);
  });

  // Error Handler
  app.use(function (err, req, res, next) {
    let log = { ip: req.ip, line: `[${moment().format('DD/MM/YYYY - hh:mm:ss')}] ${req.protocol.toUpperCase()} ${err.message}` };
    if (req.session.userId) log.user = req.session.userId;

    new ActivityLog(log).save().then(() => { // Enregistre l'erreur
      if (!err.status) err.status = 500;

      res.status(err.status);
      res.render('error', {
        error: err
      });
    }).catch(console.error);
  });

  io.on('connection', function(socket) {
    require('./controllers/sockets/dashboard')(socket);
  });

  http.listen(process.argv[3] || 7800, process.argv[2] || '0.0.0.0');
}

load().then(() => console.log(`Started Barcodes server on: ${(process.argv[2] || '0.0.0.0') + ':' + (process.argv[3] || 7800)}. Reminder: Work in progress.`));
