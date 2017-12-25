const path = require('path');
const fs = require('fs');

const router = require('koa-router')();
const koaBody = require('koa-body');

const db = require('../data/index');

router.get('/my-work', async (ctx, next) => {
  const projects = db.get('projects').value();

  await ctx.render('pages/my-work', {
    user: ctx.session.user,
    projects: projects
  });
});

router.post('/my-work', koaBody({ multipart: true, formidable: { uploadDir: 'public/upload', keepExtensions: true } }), async (ctx, next) => {
  ctx.checkBody('projectName')
    .trim().notEmpty('Заполните название проекта!');
  ctx.checkBody('projectUrl')
    .trim().notEmpty('Заполните url адрес проекта!')
    .isUrl('Неверный формат url адреса!');
  ctx.checkBody('text')
    .trim().notEmpty('Заполните описание проекта!');
  // todo - lib bug: строчка 554, файл validate.js - когда появляется хотя бы одна ошибка в контексте,
  // то hasError() возвращает true и trim() не вызывается

  const data = ctx.request.body.fields;
  const file = ctx.request.body.files && ctx.request.body.files.file;

  // проверяем разрешение на создание
  if (!ctx.session.user || !ctx.session.user.isAdmin) {
    ctx.status = 403;
    ctx.body = {
      mes: 'Доступ запрещён',
      status: 'Error'
    };
    // return;
  } else if (ctx.errors) {
    let errorsArray = ctx.errors.map(item => { return Object.values(item)[0]; }); // <field>: <value>

    ctx.status = 400;
    ctx.body = {
      mes: errorsArray.join('; '), // 'Описание ошибки'
      status: 'Error'
    };
    // return; // прерываем выполнение функции!!!
  } else if (file.name === '' || file.size === 0) {
    ctx.status = 400;
    ctx.body = {
      mes: 'Картинка не загружена',
      status: 'Error'
    };
    // return;
  }

  // todo - проверить на статус 200, 201 (по умолчанию koa задаёт ctx.status=404)
  // если ошибка - удаляем файл и возвращаем ответ
  if ([400, 403].indexOf(ctx.status) !== -1) {
    fs.unlinkSync(path.join(process.cwd(), file.path));
    return;
  }

  // если ошибок нет - сохраняем данные в бд (файл загружен уже в middleware)
  const rec = {
    title: data.projectName,
    image: file.path.replace(/\\/g, '/').replace(/^public\//, ''),
    url: data.projectUrl,
    description: data.text
  };
  db.get('projects')
    .push(rec)
    .write();

  ctx.body = {
    mes: 'Проект успешно загружен',
    status: 'OK'
  };
});

module.exports = router;
