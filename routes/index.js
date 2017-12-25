const router = require('koa-router')();

router.get('/', async (ctx, next) => {
  await ctx.render('pages/index', {
    user: ctx.session.user
  });
});

module.exports = router;
