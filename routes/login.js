const express = require('express');
const router = express.Router();

// const path = require('path');
const lowdb = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync(('data/db.json'));
const db = lowdb(adapter);

const isAnon = (req, res, next) => {
  // проверяем, является ли пользователь гостём (требуется ли показывать форму входа)
  if (!req.session.login) {
    return next();
  }
  // если нет, то перебросить пользователя на главную страницу сайта
  res.redirect('/');
};

// router.get('/login', function(req, res, next) {
//   res.render('pages/login', { title: 'Express' });
// });

// route /login
router.route('/')
  .get(isAnon, function (req, res, next) {
    res.render('pages/login', { isAdmin: req.session.isAdmin });
  })
  .post(function (req, res, next) {
    const user = db.get('users')
      .find({ login: 'admin' })
      .value();

    if (!user || user.password !== req.body.password) {
      // отправляем ошибку
      res.status(400).json({
        mes: 'Логин и/или пароль введены неверно!',
        status: 'Error'
      });
    } else {
      // обновляем сессию
      req.session.isAdmin = user.isAdmin;
      req.session.login = user.login;
      // отправляем ответ
      res.json({
        mes: 'Aвторизация успешна!',
        status: 'OK'
      });
    }
  });

module.exports = router;
