const express = require('express');
const path = require('path');

let router = express.Router();

let User = require('mongoose').model('User');

router.get('/', function (req, res, next) {
  User.findOne({ id: req.session.userId })
    .exec((error, user) => {
      if (error) return next(error);
      if (user) return res.sendFile(path.resolve(`${__dirname}/../../server/${user.rank >= 1000 ? 'superuser' : 'dashboard'}.html`));
      else {
        var err = new Error('Vous n\'êtes pas autorisés à entrer ici.');
        err.status = 400;
        return next(err);
      }
    });
});

module.exports = router;
