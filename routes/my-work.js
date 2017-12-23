const path = require('path');
const fs = require('fs');
const express = require('express');
const router = express.Router();

// const validator = require('validator');
const check = require('express-validator/check');
const filter = require('express-validator/filter');

// const formidable = require('formidable');
const crypto = require('crypto');
const multer = require('multer');
// const upload = multer({ dest: 'public/upload/' });
const upload = multer({
  storage: multer.diskStorage({
    destination: 'public/upload/', // './uploads/',
    filename: function (req, file, cb) {
      crypto.pseudoRandomBytes(16, function (err, raw) {
        if (err) return cb(err);
        cb(null, raw.toString('hex') + path.extname(file.originalname));
      });
    }
  })
});

// const path = require('path');
const lowdb = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync(('data/db.json'));
const db = lowdb(adapter);

// route /my-work
router.route('/')
  .get(function (req, res, next) {
    const projects = db.get('projects').value();

    res.render('pages/my-work', {
      user: req.session, // todo - use object req.session.user
      projects: projects
    });
  })
  .post(upload.single('file'), [
    check.check('projectName', 'Заполните название проекта!')
      .trim().isLength({ min: 1 }),
    check.check('projectUrl', 'Заполните url адрес проекта!')
      .trim().isLength({ min: 1 })
      .isURL().withMessage('Неверный формат url адреса!'),
    check.check('text', 'Заполните описание проекта!')
      .trim().isLength({ min: 1 })
  ], function (req, res, next) {
    // проверяем разрешение на создание
    if (!req.session.isAdmin) {
      return res.status(403).json({
        mes: 'Доступ запрещён',
        status: 'Error'
      });
    }

    if (req.file.originalname === '' || req.file.size === 0) {
      return res.status(400).json({
        mes: 'Картинка не загружена',
        status: 'Error'
      });
    }

    const errors = check.validationResult(req);
    if (!errors.isEmpty()) {
      fs.unlinkSync(path.join(process.cwd(), req.file.path));

      let errorsArray = errors.array().map(item => { return item.msg; });
      return res.status(400).json({
        mes: errorsArray.join('; '), // 'Описание ошибки'
        status: 'Error'
        // errors||detail: errors.mapped()
      });
    }

    const data = filter.matchedData(req);
    const rec = {
      title: data.projectName,
      image: req.file.path.replace(/\\/g, '/').replace(/^public\//, ''),
      url: data.projectUrl,
      description: data.text
    };
    db.get('projects')
      .push(rec)
      .write();

    res.json({
      mes: 'Проект успешно загружен',
      status: 'OK'
    });
  });

module.exports = router;
