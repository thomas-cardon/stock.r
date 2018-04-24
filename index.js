const Koa = require('koa'), bodyParser = require('koa-bodyparser');
const mongoose = require('mongoose');

let app = new Koa();

function generate(a,b){for(b=a='';a++<36;b+=a*51&52?(a^15?8^Math.random()*(a^20?16:4):4).toString(16):'-');return b} // Génère un UUID aléatoire
// Principe UUID: 1 chance sur 1 million de retrouver le même UUID aléatoirement

const User = mongoose.model('User', {
  id: { type: String, default: generate() },
  firstName: String,
  lastName: String,
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

// const: variable intouchable

mongoose.connect('mongodb://192.168.1.31/barcodes').then(() => {
  app.use(bodyParser());

  // x-response-time - Affiche le temps de réponse dans la réponse

  app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    ctx.set('X-Response-Time', `${ms}ms`);
  });

  // Affiche la requête dans la console

  app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    console.log(`${ctx.method} ${ctx.url} - ${ms}`);
  });

  app.use(async (ctx, next) => {
    if (!ctx.accepts('json')) return ctx.throw(422, 'JSON only');
    await next();
  });

  let users = require('./routes/v1/users');
  let me = require('./routes/v1/me');

  app.use(users.routes()).use(users.allowedMethods());
  app.use(me.routes()).use(me.allowedMethods());

  app.listen(process.argv[3] || 7800, process.argv[2] || '0.0.0.0');

  console.log(`Started Barcodes server on: ${(process.argv[2] || '0.0.0.0') + ':' + (process.argv[3] || 7800)}. Reminder: Work in progress.`);
});
