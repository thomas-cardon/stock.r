let router = require('express').Router();
let User = require('mongoose').model('User');
let ActivityLog = require('mongoose').model('ActivityLog');

router.post('/login', function (req, res, next) {
  if (!req.body.emailOrUsername || !req.body.password) return;
  User.authenticate(req.body.emailOrUsername, req.body.password).then(user => {
    if (!user) {
      let err = new Error('Mauvais mot de passe!');
      err.status = 404;
      return next(err);
    }

    req.session.userId = user.id;
    req.session.userRank = user.rank;

    res.redirect('/dashboard');
  }).catch(console.error);
});

router.get('/profile/:id', async function (req, res, next) {
  if (req.session.userRank < 1000) {
    let err = new Error('Vous n\'êtes pas autorisés à entrer ici.');
    err.status = 400;
    return next(err);
  }

  try {
    let users = await User.find({ id: req.params.id }).lean().exec();

    if (users.length === 0) {
      let err = new Error('Aucun utilisateur trouvé.');
      err.status = 404;
      return next(err);
    }

    users[0].password = undefined; // Security measures

    res.render('users/profile', {
      user: users[0],
      logs: await ActivityLog.find({ user: users[0].id }).limit(30).lean().exec(),
      top: {
        title: 'Tableau de bord',
        title2: 'Profil utilisateur',
        buttons: [{
          id: 'editUser',
          name: 'Modifier',
          class: 'btn-outline-secondary'
        },
        {
          id: 'disableUser',
          name: 'Désactiver',
          class: 'btn-outline-secondary'
        }]
      },
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
          icon: 'shopping-cart'
        },
        {
          name: 'Paramètres',
          href: '/dashboard/settings',
          icon: 'settings'
          }]
        }
      });
  }
  catch(err) {
    next(err);
  }
});

router.get('/logout', function (req, res, next) {
  if (req.session) {
    // Delete session object
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

module.exports = router;
