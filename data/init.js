const path = require('path');
const lowdb = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync(path.join(__dirname, 'db.json'));
const db = lowdb(adapter);

const defaultData = {
  users: [
    { login: 'admin', password: 'admin', is_admin: true }
  ],
  projects: [
    { title: 'loftblog.ru', image: 'img/work/loftblog.jpg', url: 'http://loftblog.ru/', description: 'Сайт с уроками по web разработке' },
    { title: 'itloft.ru', image: 'img/work/itloft.jpg', url: 'http://itloft.ru/', description: 'Сайт агенства интернет решений itloft' },
    { title: 'loftschool.com', image: 'img/work/loftschool.png', url: 'http://loftschool.com/', description: 'Школа онлайн образования' }
  ]
};

// Set defaults data
db.defaults(defaultData)
  .write();
