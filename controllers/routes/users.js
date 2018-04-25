const express = require('express');
let router = express.Router();
let User = require('mongoose').model('User');

router.post('/login', function (req, res, next) {
  console.dir(req.body);
  if (!req.body.emailOrUsername || !req.body.password) return;
  User.authenticate(req.body.emailOrUsername, req.body.password).then(user => {
    if (!user) {
      var err = new Error('Mauvais mot de passe!');
      err.status = 404;
      return next(err);
    }

    req.session.userId = user.id;
    res.redirect('/dashboard');
  }).catch(console.error);
});

router.get('/logout', function (req, res, next) {
  if (req.session) {
    // delete session object
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
