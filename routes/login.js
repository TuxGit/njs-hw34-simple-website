const router = require('koa-router')();

const db = require('../data/index');

router.get('/logout', async (ctx, next) => {
  ctx.session = null;
  ctx.redirect('/');
});

// router.prefix('/login');
// router.get('/', async (ctx, next) => { ... });

router.get('/login', async (ctx, next) => {
  if (!ctx.session.user || !ctx.session.user.login) {
    await ctx.render('pages/login', {
      // title: 'Hello Koa 2!',
      user: ctx.session.user
    });
  } else {
    ctx.redirect('/');
  }
});

router.post('/login', async (ctx, next) => {
  // ctx.req.body => undefined!
  const user = db.get('users')
    .find({ login: ctx.request.body.login })
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
