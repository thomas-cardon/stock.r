const express = require('express');
const path = require('path');

let router = express.Router();

let User = require('mongoose').model('User');
let Product = require('mongoose').model('Product');

router.get('/', function (req, res, next) {
  // sendFile(path.resolve(`${__dirname}/../../server/${req.session.userRank >= 1000 ? 'superuser' : 'dashboard'}.html`))
  if (req.session.userId) res.render('dashboard/dash', {
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
  else {
    var err = new Error('Vous n\'êtes pas autorisés à entrer ici.');
    err.status = 400;
    return next(err);
  }
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
