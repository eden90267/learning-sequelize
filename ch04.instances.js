// Instances - 實例

var Sequelize = require('sequelize');
var sequelize = require('./models');

const Project = sequelize.define('project', {/*...*/});
const User = sequelize.define('user', {/*...*/});
const Task = sequelize.define('task', {
  title: Sequelize.STRING,
  rating: {type: Sequelize.TINYINT, defaultValue: 3}
});
const Person = sequelize.define('person', {/*...*/});


sequelize.sync().then(() => {

  // 構建非持久性實例
// 使用 build - 該方法將返回一個未保存的物件，你要明確地保存它
  const project = Project.build({
    title: 'my awesome project',
    description: 'woot woot. this will make me a rich man'
  });
  // const task = Task.build({
  //   title: 'specify the project idea',
  //   description: 'bla',
  //   deadline: new Date()
  // });
  // 内置實例在定义时会自动获取默认值
  const task = Task.build({title: 'very important task'})

  task.title;  // ==> 'very important task'
  task.rating; // ==> 3

  // 要將其存儲在資料庫中，請使用 save 方法並捕獲事件
  project.save().then(() => {
    // 回调
  });
  task.save().catch(error => {
    // 呃
  });
  // 可使用鏈式構建和保存物件
  Task.build({title: 'foo', description: 'bar', deadline: new Date()})
    .save()
    .then(antherTask => {
      // 您现在可以使用变量 anotherTask 访问当前保存的任务
    })
    .catch(error => {
      // Ooops，做一些错误处理
    });


  // 創建持久性實例
  // .create() 完全省略了 .build() + .save()，一旦調用就自動存儲實例的資料

  Task.create({title: 'foo', description: 'bar', deadline: new Date()}).then(task => {

  });

  // 也可用 create 方法定義哪些屬性可以設置。如果你創建基於可由用戶填寫的表單的資料庫條目，這將非常方便。例如，使用這種方式，你可以限制 User 模型，僅設置 username 和 address，而不是 admin 標誌：
  User.create({username: 'barfooz', isAdmin: true}, {fields: ['username']}).then(user => {
    console.log(user.get({plain: true})); // {username: 'barfooz', isAdmin: false} // isAdmin 默認值是 false
  });


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

  // 透過傳遞行名陣列，調用 save 時也可以定義哪些屬性應該被保存。當你基於先前定義的物件設置屬性時，這是有用的。
  // 例如，你透過 Web 應用程序的形式獲取對象的值。此外，這在 update 內部使用。它就像這樣：
  task.title = 'foooo';
  task.description = 'baaaaaar';
  task.save({fields: ['title']}).then(() => {
    // title 现在将是 “foooo”，而 description 与以前一样
  });
  // 使用等效的 update 调用如下所示:
  task.update({title: 'foooo', description: 'baaaaaar'}, {fields: ['title']}).then(() => {
    //  title 现在将是 “foooo”，而 description 与以前一样
  });
  // 當你調用 save 而不改變任何屬性的時候，這個方法什麼都不執行


  // 銷毀/刪除持久性實例
  // destroy
  Task.create({title: 'a task'}).then(task => {
    return task.destory();
  }).then(() => {
    // task 對象已被銷毀
  });

  // 如果 paranoid 選項為 true，則不會刪除該對象，而將 deletedAt 行設置為當前時間戳。
  // 要強制刪除，可以將 force:true 傳遞給 destroy 調用：
  task.destroy({force: true});


  // 批量操作
  // 除了更新單個實例之外，你還可以一次創建、更新和刪除多個實例。調用你需要的方法

  // - Model.bulkCreate
  // - Model.update
  // - Model.destroy

  // 由於你使用多個模型，回調將不會返回 DAO 實例。BulkCreate 將返回一個模型實例 / DAO 的陣列，但是它們不同於 create，沒有 autoIncrement 屬性的結果值，update 和 destroy 將返回受影響的行數。

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

  // 如果你直接從 user 接受值，則限制要實際插入的行可能會更好。
  // bulkCreate() 接受一個選項對象作為第二個參數。該對象可以有一個 fields 參數 (一個陣列)，讓它知道你想要明確構建哪些欄位
  User.bulkCreate([
    {username: 'foo'},
    {username: 'bar', admin: true}
  ], {fields: ['username']}).then(() => {
    // admin 將不會被構建
  });
});

// bulkCreate 最初是成為 主流/快速 插入紀錄的方法，但是有時你希望能夠同時插入多行而不犧牲模型驗證，即使你明確告訴 Sequelize 去篩選哪些行。你可以透過在 options 對象中添加一個 validate: true 屬性來實現。
const Tasks = sequelize.define('task', {
  name: {
    type: Sequelize.STRING,
    validate: {
      notNull: {
        args: true,
        msg: 'name cannot be null'
      }
    }
  },
  code: {
    type: Sequelize.STRING,
    validate: {
      len: [3, 10]
    }
  }
});

sequelize.sync().then(() => {

  Task.bulkCreate([
    {name: 'foo', code: '123'},
    {code: '1234'},
    {name: 'bar', code: 1}
  ], {validate: true}).catch(errors => {
    /* console.log(errors) 看起来像这样:
    [
      { record:
      ...
      name: 'SequelizeBulkRecordError',
      message: 'Validation error',
      errors:
        { name: 'SequelizeValidationError',
          message: 'Validation error',
          errors: [Object] } },
      { record:
        ...
        name: 'SequelizeBulkRecordError',
        message: 'Validation error',
        errors:
          { name: 'SequelizeValidationError',
          message: 'Validation error',
          errors: [Object] } }
    ]
    */
  });


  // 一個實例的值

  // 如果你紀錄一個實例，你會注意到有很多額外的東西。為了隱藏這些東西並將其減少到非常有趣的信息，您可以使用 get 屬性。使用選項 plain: true 調用它將只會返回一個實例的值。

  Person.create({
    name: 'Rambow',
    firstname: 'John'
  }).then(john => {
    console.log(john.get({plain: true}))
  });

  // 结果:

  // { name: 'Rambow',
  //   firstname: 'John',
  //   id: 1,
  //   createdAt: Tue, 01 May 2012 19:12:16 GMT,
  //   updatedAt: Tue, 01 May 2012 19:12:16 GMT
  // }

  // 提示：你還可以使用 JSON.stringify(instance) 將一個實例轉換為 JSON。基本上與 values 返回的相同。


  // 重載實例

  // 如果你需要讓你的實例同步，你可以使用 reload 方法。它將從資料庫中獲取當前資料，並覆蓋調用該方法的模型的屬性。
  Person.findOne({where: {name: 'john'}}).then(person => {
    person.name = 'jane';
    console.log(person.name);  // 'jane'

    person.reload().then(() => {
      console.log(person.name);// 'john'
    });
  });


  // 遞增

  // 為了增加實例的值而不發生併發問題，您可使用 increment

  // 首先，你可以定義一個欄位和要添加的值
  User.findById(1).then(user => {
    return user.increment('my-integer-field', {by: 2});
  }).then(user => {
    // Postgres 默認會返回更新的 user (除非透過設置禁用 {returning: false})
    // 在其他方言中，您將需要調用 user.reload() 來獲取更新的實例...
  });
  // 可定義多個欄位和要添加的值
  User.findById(1).then(user => {
    return user.increment(['my-integer-field', 'my-very-other-field'], {by: 2})
  }).then(/* ... */);
  // 最後，你可定義一個包含欄位及其遞增值的對象
  User.findById(1).then(user => {
    return user.increment({
      'my-integer-field': 2,
      'my-very-other-field': 3
    })
      .then(/* ... */);
  });


  // 遞減

  // 為了減少實例的值而不發生併發問題，您可使用 decrement

  // 首先，你可以定義一個欄位和要遞減的值
  User.findById(1).then(user => {
    return user.decrement('my-integer-field', {by: 2});
  }).then(user => {
    // Postgres 默認會返回更新的 user (除非透過設置禁用 {returning: false})
    // 在其他方言中，您將需要調用 user.reload() 來獲取更新的實例...
  });
  // 可定義多個欄位和要遞減的值
  User.findById(1).then(user => {
    return user.decrement(['my-integer-field', 'my-very-other-field'], {by: 2})
  }).then(/* ... */);
  // 最後，你可定義一個包含欄位及其遞減值的對象
  User.findById(1).then(user => {
    return user.decrement({
      'my-integer-field': 2,
      'my-very-other-field': 3
    })
      .then(/* ... */);
  });
});