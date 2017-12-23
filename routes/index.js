const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('pages/index', { title: 'Home page', user: req.session.user });
});

router.get('/logout', function (req, res, next) {
  req.session.destroy(function () { // (err)
    res.redirect('/');
  });
});

module.exports = router;
