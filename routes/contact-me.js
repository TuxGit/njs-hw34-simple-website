const express = require('express');
const router = express.Router();

const nodemailer = require('nodemailer');
const config = require('../etc/config.json');

const check = require('express-validator/check');
const filter = require('express-validator/filter');

// router.get('/contact-me', function(req, res, next) {
//   res.render('pages/contact-me', { title: 'Express' });
// });

// route /contact-me
router.route('/')
  .get(function (req, res, next) {
    res.render('pages/contact-me', { isAdmin: req.session.login });
  })
  .post([
    // check.check('name').exists(),
    check.check('name', 'Поле Имя должно быть заполнено')
      .trim().isLength({ min: 1 }),
    check.check('email', 'Поле Email должно быть заполнено')
      .trim().isLength({ min: 1 })
      .isEmail().withMessage('Укажите правильный Email адрес'),
    check.check('message', 'Сообщение должно содержать более 10 символов')
      .trim().isLength({ min: 10 })
  ], function (req, res, next) {
    // req.body.name, req.body.email, req.body.message
    const errors = check.validationResult(req);
    if (!errors.isEmpty()) {
      let errorsArray = errors.array().map(item => { return item.msg; });

      res.status(400).json({
        mes: errorsArray.join('; '), // 'Описание ошибки'
        status: 'Error'
        // errors||detail: errors.mapped()
      });
    }

    const data = filter.matchedData(req);
    // отправка письма
    // 1. инициализируем модуль для отправки писем и указываем данные из конфига
    const transporter = nodemailer.createTransport(config.mail.smtp);
    const mailOptions = {
      // from: `"${data.name}" <${data.email}>`,
      from: `"WebSite" <${config.mail.smtp.auth.user}>`,
      to: config.mail.smtp.auth.user,
      subject: config.mail.subject,
      text:
        `Имя отправителя: ${data.name}` + '\n' +
        `Email для отбратной связи: ${data.email}` + '\n\n' +
        data.message.trim().slice(0, 500)
    };
    // 2. отправляем почту
    transporter.sendMail(mailOptions, function (error, info) {
      // если есть ошибки при отправке - сообщаем об этом
      if (error) {
        return res.json({
          mes: `При отправке письма произошла ошибка!: ${error}`,
          status: 'Error'
        });
      }
      res.json({
        mes: 'Сообщение отправлено!',
        status: 'OK'
      });
    });
  });

module.exports = router;
