const router = require('koa-router')();

const db = require('../data/index');

// todo - if logged redirect to home page /
router.get('/login', async (ctx, next) => {
  await ctx.render('pages/login', {
    // title: 'Hello Koa 2!',
    user: ctx.session.user
  });
});

router.post('/login', async (ctx, next) => {
  // ctx.req.body => undefined!
  const user = db.get('users')
    .find({ login: ctx.request.body.login }) // todo!!! - Исправить в express версии bug!!!
    .value();

  if (!user || user.password !== ctx.request.body.password) {
    // отправляем ошибку
    ctx.status = 400;
    ctx.body = {
      mes: 'Логин и/или пароль введены неверно!',
      status: 'Error'
    };
  } else {
    // обновляем сессию
    // req.session.login = user.login;
    ctx.session.user = {
      isAdmin: user.is_admin,
      login: user.login
    };
    // отправляем ответ
    ctx.body = {
      mes: 'Aвторизация успешна!',
      status: 'OK'
    };
  }
});

module.exports = router;
