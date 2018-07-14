// 實例

var Sequelize = require('sequelize');
var sequelize = require('./models');

const Project = sequelize.define('project', {/*...*/});
const User = sequelize.define('user', {/*...*/});
const Task = sequelize.define('task', {/*...*/});

Project.sync().then(() => {

  // 構建非持久性實例
  // 使用 build - 該方法將返回一個未保存的對象，你要明確地保存它
  Project.create({
    title: 'my awesome project',
    description: 'woot woot. this will make me a rich man'
  }).then(project => {
    // 變量可訪問新創建的 project
  });

});

User.sync().then(() => {
  // 也可用 create 方法定義哪些屬性可以設置。如果你創建基於可由用戶填寫的表單的資料庫條目，這將非常方便。例如，使用這種方式，你可以限制 User 模型，僅設置 username 和 address，而不是 admin 標誌：
  User.create({username: 'barfooz', isAdmin: true}, {fields: ['username']}).then(user => {
    console.log(user.get({plain: true})); // {username: 'barfooz', isAdmin: false} // isAdmin 默認值是 false
  });
});

Task.sync().then(() => {
  // 更新 / 保存 / 持久化一個實例
  // 方法 1
  task.title = 'a very different title now';
  task.save().then(() => {
  });
  // 方法 2
  task
    .update({
      title: 'a very different'
    })
    .then(() => {
    });
  task.title = 'foooo';
  task.description = 'baaaaaar';
  task.save({fields: ['title']}).then(() => {

  });

  Task.create({title: 'a task'}).then(task => {
    return task.destory();
  }).then(() => {
    // task 對象已被銷毀
  });

  // 如果 paranoid 選項為 true，則不會刪除該對象，而將 deletedAt 行設置為當前時間戳。
  // 要強制刪除，可以將 force:true 傳遞給 destroy 調用：
  task.destroy({force: true});
});


// 批量操作
// 除了更新單個實例之外，你還可以一次創建、更新和刪除多個實例。調用你需要的方法

// - Model.bulkCreate
// - Model.update
// - Model.destroy

// 由於你使用多個模型，回調將不會返回 DAO 實例。BulkCreate 將返回一個模型實例 / DAO 的陣列，但是它們不同於 create，沒有 autoIncrement 屬性的結果值，update 和 destroy 將返回受影響的行數。

User.sync().then(() => {
  // 首先看下 bulkCreate
  User.bulkCreate([
    {username: 'barfooz', isAdmin: true},
    {username: 'foo', isAdmin: true},
    {username: 'bar', isAdmin: false},
  ]).then(() => { // 注意：這裡沒有憑據，然而現在你需要...
    return User.findAll();
  }).then(users => {
    console.log(users);
  });
});

Task.sync().then(() => {
  // 一次更新幾行：
  Task.blukCreate([
    {subject: 'programming', status: 'executing'},
    {subject: 'reading', status: 'executing'},
    {subject: 'programming', status: 'finished'}
  ]).then(() => {
    return Task.update(
      {status: 'inactive'},
      {where: {subject: 'programming'}}
    )
  }).spread((affectedCount, affectedRows) => {
    // .update 在陣列中返回兩個值，因此我們使用 .spread
    // 請注意，affectedRows 只支持以 returning: true 的方式來進行定義

    // affectedCount 將會是 2
    return Task.findAll();
  }).then(tasks => {
    console.log(tasks);
  });

  // 然後刪除他們
  Task.bulkCreate([
    {subject: 'programming', status: 'executing'},
    {subject: 'reading', status: 'executing'},
    {subject: 'programming', status: 'finished'}
  ]).then(() => {
    return Task.destroy({
      where: {
        subject: 'programming'
      },
      truncate: true // 浙江忽略 where 並用 truncate table 替代
    });
  }).then(affectedRows => {
    // affectedRows 將是 2
    return Task.findAll();
  }).then(tasks => {
    console.log(tasks); // 顯示 tasks 內容
  });
});

// 如果你直接從 user 接受值，則限制要實際插入的列可能會更好。
// bulkCreate() 接受一個選項對象作為第二個參數。該對象可以有一個 fields 參數 (一個陣列)，讓它知道你想要明確構建哪些欄位
User.bulkCreate([
  {username: 'foo'},
  {username: 'bar', admin: true}
]);