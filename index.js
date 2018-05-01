const path = require('path');
const mongoose = require('mongoose');

global.generate = function(a,b){for(b=a='';a++<36;b+=a*51&52?(a^15?8^Math.random()*(a^20?16:4):4).toString(16):'-');return b} // Génère un UUID aléatoire
// Principe UUID: 1 chance sur 1 million de retrouver le même UUID aléatoirement

const express = require('express');

let app = express();
let bodyParser = require('body-parser');
let MongoStore = require('connect-mongo')(require('express-session'));

let http = require('http').Server(app);

let { DateTime } = require('luxon');

let session = require('express-session')({
  saveUninitialized: false,
  resave: true,
  secret: generate(),
  store: new MongoStore({ mongooseConnection: mongoose.connection })
});

app.use(session);

// On définit le moteur de rendu sur Pug
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

/*
* Body Parser nous permet d'afficher nativement les objets qui nous sont envoyés
*/
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/assets', express.static(path.join(__dirname, 'server/assets')));

let Storage;
async function preload() {
  Storage = await require('samss').getStorage('FS', 'file.json').load();
  await Storage.default().add('mongoose-address', 'mongodb://192.168.1.31/barcodes').end();

  await mongoose.connect(Storage.get('mongoose-address'));

  mongoose.model('User', require('./models/User')); // Modèle utilisateur
  mongoose.model('Product', require('./models/Product')); // Produit
  mongoose.model('ActivityLog', require('./models/ActivityLog')); // Enregistrements d'activité
}

async function load() {
  /*
  * Cette méthode enregistre les activités dans la collection ActivityLog.
  */
  app.use(function (req, res, next) {
    let log = { ip: req.ip, line: `[${DateTime.local().setLocale('fr').toLocaleString(DateTime.DATE_MED)}] ${req.protocol.toUpperCase()} ${req.originalUrl}` };
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
    else res.render('users/signin');
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
    let log = { ip: req.ip, line: `[${DateTime.local().setLocale('fr').toLocaleString(DateTime.DATE_MED)}] ${req.protocol.toUpperCase()} ${err.message}` };
    if (req.session.userId) log.user = req.session.userId;

    new ActivityLog(log).save().then(() => { // Enregistre l'erreur
      if (!err.status) err.status = 500;

      res.status(err.status);
      res.render('error', {
        error: err
      });
    }).catch(console.error);
  });

  http.listen(process.argv[3] || 7800, process.argv[2] || '0.0.0.0');
}

async function populate(max = 1000) {
  let axios = require('axios');
  let User = mongoose.model('User');
  let Product = mongoose.model('Product');

  let getUser = () => axios.get('https://api.mockaroo.com/api/4e6eb7d0?count=1000&key=392a8490');
  let getProducts = () => axios.get('https://api.mockaroo.com/api/fb899ee0?count=1000&key=392a8490');
  let getDemands = () => axios.get('https://api.mockaroo.com/api/9873f750?count=1000&key=392a8490');

  /*
  * Les promises permettent de gérer les données plus facilement en asynchrone. Promise#all et axios#all permettent la gestion en parallèle
  */
  axios.all([getUser(), getProducts(), getDemands()]).then(axios.spread((u, p, d) => {
    let users = u.data;
    let products = p.data;
    let demands = d.data;

    users.forEach(user => new User(user).save().then(() => console.log(`Saved user: ${user.username}`)));
    products.forEach(product => {
      product.demands = [];

      /*
      * Génère des valeurs aléatoires fonctionnant avec les utilisateurs et produits existants
      * La boucle for permet de prendre 20 demandes dans tout le tableau à n'importe quel endroit
      */
      for (let i = Math.floor(Math.random() * 979) + 1; i < Math.floor(Math.random() * 20) + 1; i++) {
        let d = demands[i], randomStatus = ['AWAITING_VALIDATION', 'VALIDATED', 'CANCELLED', 'DONE'];

        d.name = d.qty + ' ' + product.plurializedName;
        d.issuedBy = users[i].id;
        d.status = randomStatus[Math.floor(Math.random()*randomStatus.length)];

        product.demands.push(d);
      }

      new Product(product).save().then(() => console.log(`Saved product: ${product.name}`))
    });
  }));
}

preload().then(() => {
  if (process.argv[2] === 'populate') {
    console.log('Started populating the database');
    populate().catch(err => {
      console.error(err);
      process.exit(1);
    });
  }
  else load().then(() => console.log(`Started Barcodes server on: ${(process.argv[2] || '0.0.0.0') + ':' + (process.argv[3] || 7800)}. Reminder: Work in progress.`));
});
