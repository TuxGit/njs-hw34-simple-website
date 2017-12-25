const router = require('koa-router')();

const nodemailer = require('nodemailer');
const config = require('../etc/config.json');

router.get('/contact-me', async (ctx, next) => {
  await ctx.render('pages/contact-me', {
    user: ctx.session.user
  });
});

router.post('/contact-me', async (ctx, next) => {
  ctx.checkBody('name')
    .trim().notEmpty('Поле Имя должно быть заполнено');
  ctx.checkBody('email')
    .trim().notEmpty('Поле Email должно быть заполнено')
    .isEmail('Укажите правильный Email адрес');
  ctx.checkBody('message')
    .trim().len(10, 'Сообщение должно содержать более 10 символов');
  // todo - lib bug: строчка 554, файл validate.js - когда появляется хотя бы одна ошибка в контексте,
  // то hasError() возвращает true и trim() не вызывается

  if (ctx.errors) {
    let errorsArray = ctx.errors.map(item => { return Object.values(item)[0]; }); // <field>: <value>

    ctx.status = 400;
    ctx.body = {
      mes: errorsArray.join('; '), // 'Описание ошибки'
      status: 'Error'
    };
    return; // прерываем выполнение функции!!!
  }

  const data = ctx.request.body;
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
  return transporter.sendMail(mailOptions) // возвращаем Promise из функции, чтобы koa дождался!!!
    .then(function (info) {
      ctx.body = {
        mes: 'Сообщение отправлено!',
        status: 'OK'
      };
    })
    .catch(function (error) {
      ctx.status = 503;
      ctx.body = {
        mes: `При отправке письма произошла ошибка!: ${error}`,
        status: 'Error'
      };
    });
});

module.exports = router;
