const path = require('path');

const Koa = require('koa');
const app = new Koa();
const views = require('koa-views');
const json = require('koa-json');
const onerror = require('koa-onerror');
const bodyparser = require('koa-bodyparser');
const logger = require('koa-logger');

const session = require('koa-session');
const validate = require('koa-validate');

const index = require('./routes/index');
const users = require('./routes/users');
const loginRouter = require('./routes/login');
const contactMeRouter = require('./routes/contact-me');

// error handler
onerror(app);

// middlewares
app.keys = ['some secret hurr dasdas'];
app.use(session({
  key: 'koa:sess', /** (string) cookie key (default is koa:sess) */
  /** (number || 'session') maxAge in ms (default is 1 days) */
  /** 'session' will result in a cookie that expires when session/browser is closed */
  /** Warning: If a session cookie is stolen, this cookie will never expire */
  maxAge: 86400000,
  overwrite: true, /** (boolean) can overwrite or not (default true) */
  httpOnly: true, /** (boolean) httpOnly or not (default true) */
  signed: true, /** (boolean) signed or not (default true) */
  rolling: false /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. default is false **/
}, app));

// bind validate module
validate(app);

app.use(bodyparser({
  enableTypes: ['json', 'form', 'text']
}));
app.use(json());
app.use(logger());
app.use(require('koa-static')(path.join(__dirname, 'public')));

app.use(views(path.join(__dirname, 'views'), {
  extension: 'pug'
}));

// logger
app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

// routes
app.use(index.routes(), index.allowedMethods());
app.use(users.routes(), users.allowedMethods());
app.use(loginRouter.routes(), loginRouter.allowedMethods());
app.use(contactMeRouter.routes(), contactMeRouter.allowedMethods());

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx);
});

module.exports = app;
