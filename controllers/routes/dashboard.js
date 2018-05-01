const express = require('express');
const path = require('path');

let router = express.Router();

let User = require('mongoose').model('User');
let Product = require('mongoose').model('Product');

router.get('/', async function (req, res, next) {
  if (!req.session.userId) return res.redirect('/');

  let q = [{ 'demands.issuedBy': req.session.userId }, { 'demands.for': req.session.userId }];

  /*
  * Si le rang est considéré comme Admin, alors il rajoute une query qui envoie tous les produits ayant une demande existante n'étant pas terminée.
  * $ne -> "Not equals"
  */

  if (req.session.userRank >= 1000) q.push({ 'demands.0': { $exists: true }, status: { $ne: 'DONE' } });

  let products = await Product.find().or(q).sort('-date').limit(4).lean().exec(), stats;
  if (req.session.userRank >= 1000) {
    q.push({ 'demands.0': { $exists: true }, status: { $ne: 'DONE' } });
    stats = {};
  }

  return res.render('dashboard/dash', {
    products: products,
    stats: stats,
    top: {
      title: 'Tableau de bord',
      title2: 'Dernières demandes',
      buttons: [{
        id: 'optout',
        name: 'Demander un produit',
        class: 'btn-outline-secondary'
      },
      {
        id: 'generateBill',
        name: 'Générer une facture',
        class: 'btn-outline-secondary'
      }]
    },
    sidebar: {
      buttons: [{
        name: 'Tableau de bord',
        href: '/dashboard',
        icon: 'home',
        active: true
      },
      {
        name: 'Demandes',
        href: '#',
        icon: 'file'
      },
      {
        name: 'Produits',
        href: '/dashboard/products',
        icon: 'shopping-cart'
      },
      {
        name: 'Paramètres',
        href: '/dashboard/settings',
        icon: 'settings'
      }]
    }
  });
});

router.get('/products', async function (req, res, next) {
  if (req.session.userId && req.session.userRank >= 1000) res.render('dashboard/products', {
    top: false,
    products: await Product.find().sort('-date').exec(),
    sidebar: {
      buttons: [{
        name: 'Tableau de bord',
        href: '/dashboard',
        icon: 'home'
      },
      {
        name: 'Demandes',
        href: '#',
        icon: 'file'
      },
      {
        name: 'Produits',
        href: '/dashboard/products',
        icon: 'shopping-cart',
        active: true
      },
      {
        name: 'Paramètres',
        href: '/dashboard/settings',
        icon: 'settings'
      }]
    }
  });
  else {
    var err = new Error('Vous n\'êtes pas autorisés à entrer ici.');
    err.status = 400;
    return next(err);
  }
});

module.exports = router;
