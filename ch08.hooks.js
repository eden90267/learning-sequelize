// Hooks - 鉤子

// Hook（也称为生命周期事件）是执行 sequelize 调用之前和之后调用的函数。例如，如果要在保存模型之前始终设置值，可以添加一个 beforeUpdate hook。

const Sequelize = require('sequelize');
const sequelize = require('./models');

const Op = Sequelize.Op;
const DataTypes = Sequelize.DataTypes;


// 操作清單

/**

 (1)
 beforeBulkCreate(instances, options)
 beforeBulkDestroy(options)
 beforeBulkUpdate(options)
 (2)
 beforeValidate(instance, options)
 (-)
 validate
 (3)
 afterValidate(instance, options)
 - or -
 validationFailed(instance, options, error)
 (4)
 beforeCreate(instance, options)
 beforeDestroy(instance, options)
 beforeUpdate(instance, options)
 beforeSave(instance, options)
 beforeUpsert(values, options)
 (-)
 create
 destroy
 update
 (5)
 afterCreate(instance, options)
 afterDestroy(instance, options)
 afterUpdate(instance, options)
 afterSave(instance, options)
 afterUpsert(created, options)
 (6)
 afterBulkCreate(instances, options)
 afterBulkDestroy(options)
 afterBulkUpdate(options)

 */


// 聲明 Hook

// Hook 的參數透過引用傳遞。這意味著您可以更改值，這將反應在 insert/update 語句中。Hook 可能包含異步動作 - 在這種情況下，Hook 函數應該返回一個 promise。

// 目前有三種以編程方式添加 hook 的方法

// 方法 1. 透過 .define() 方法
const User = sequelize.define('user', {
  username: DataTypes.STRING,
  mood: {
    type: DataTypes.ENUM,
    values: ['happy', 'sad', 'natural']
  }
}, {
  hooks: {
    beforeValidate: (user, options) => {
      user.mood = 'happy';
    },
    afterValidate: (user, options) => {
      user.username = 'Toni';
    }
  }
});

// 方法 2. 透過 .hook() 方法 (或其別名 .addHook() 方法)
User.hook('beforeValidate', (user, options) => {
  user.mood = 'happy';
});
User.addHook('afterValidate', 'someCustomName', (user, options) => {
  return sequelize.Promise.reject(new Error("I'm afraid I can't let you do that!"));
});

// 方法 3. 透過直接方法
User.beforeCreate((user, options) => {
  return hashPassword(user.password).then(hashedPw => {
    user.password = hashedPw;
  });
});
User.afterValidate('myHookAfter', (user, options) => {
  user.username = 'Toni';
});


// 移除 Hook

// 只能刪除有名稱參數的 hook

const Book = sequelize.define('book', {
  title: DataTypes.STRING
});

Book.addHook('afterCreate', 'notifyUsers', (book, options) => {
  // ...
});

Book.removeHook('afterCreate', 'notifyUsers');

// 你可以有很多同名的 hook。調用 .removeHook() 將會刪除它們。


// 全局/通用 Hook

// 全局 hook 是所有模型的 hook。他們可以定義您想要的所有模型的行為，並且對插件特別有用。它們可以用兩種方式來定義，它們的語意略有不同：

// Sequelize.options.define (默認 hook)

const sequelize = new Sequelize('', '', '', {
  define: {
    hooks: {
      beforeCreate: () => {
        // 做些什麼
      }
    }
  }
});

// 這將為所有模型添加一個默認 hook，如果模型沒有定義自己的 beforeCreate hook，那麼它將會運行。

const User = sequelize.define('user');
const Project = sequelize.define('project', {}, {
  hooks: {
    beforeCreate: () => {
      //  做些其它什么
    }
  }
});

User.create();    // 运行全局 hook
Project.create(); // 运行其自身的 hook (因为全局 hook 被覆盖)

// Sequelize.addHook (常駐 hook)

sequelize.addHook('beforeCreate', () => {
  // 做些什麼
});

// 這個 hook 總是在創建之前運行，無論模型是否指定的自己的 beforeCreate hook：

const User = sequelize.define('user');
const Project = sequelize.define('project', {}, {
  hooks: {
    beforeCreate: () => {
      // 做些其它什么
    }
  }
});

User.create() // 运行全局 hook
Project.create() //运行其自己的 hook 之后运行全局 hook

// 本地 hook 總是在全局 hook 之前運行

// 實例 Hook

// 當你編輯單個對象時，以下 hook 將觸發

/**
 beforeValidate
 afterValidate or validationFailed
 beforeCreate / beforeUpdate  / beforeDestroy
 afterCreate / afterUpdate / afterDestroy
 */

// 定義
User.beforeCreate(user => {
  if (user.accessLevel > 10 && user.username !== 'Boss') {
    throw new Error('您不能授予该用户10级以上的访问级别！');
  }
});

// 此示例將返回錯誤：
User.create({
  username: 'Not a Boss',
  accessLevel: 20
}).catch(err => {
  console.log(err); // 您不能授予该用户 10 级以上的访问级别！
});

// 以下示例将返回成功：
User.create({
  username: 'Boss',
  accessLevel: 20
}).then(user => {
  console.log(user); // 用户名为 Boss 和 accessLevel 为 20 的用户对象
});


// 模型 Hook

// 有时，您将一次编辑多个记录，方法是使用模型上的 bulkCreate、update 或 destroy 方法。 当您使用以下方法之一时，将会触发以下内容：

/**
 beforeBulkCreate(instances, options)
 beforeBulkUpdate(options)
 beforeBulkDestroy(options)
 afterBulkCreate(instances, options)
 afterBulkUpdate(options)
 afterBulkDestroy(options)
 */

// 如果要為每個單獨的紀錄觸發 hook，連同批量 hook，您可以將 personalHooks:true 傳遞給調用

const Model = sequelize.define(/**/);

Model.destroy({ where: {accessLevel: 0}, individualHooks: true});
// 将选择要删除的所有记录，并在每个实例删除之前 + 之后触发

Model.update({username: 'Toni'}, { where: {accessLevel: 0}, individualHooks: true});
// 将选择要更新的所有记录，并在每个实例更新之前 + 之后触发

// Hook 方法的 options 參數將是提供給相應方法或其克隆和擴充版本的第二個參數

Model.beforeBulkCreate((records, {fields}) => {
  // records = 第一个参数发送到 .bulkCreate
  // fields = 第二个参数欄位之一发送到 .bulkCreate
});
Model.bulkCreate([
    {username: 'Toni'}, // 部分记录参数
    {username: 'Tobi'} // 部分记录参数
  ], {fields: ['username']} // 选项参数
);

Model.beforeBulkUpdate(({attributes, where}) => {
  // where - 第二个参数的克隆的欄位之一发送到 .update
  // attributes - .update 的第二个参数的克隆的欄位之一被用于扩展
});

Model.update({geneder: 'Male'} /* 屬性參數 */, {where: {username: 'Tom'}}); /* where 參數 */

Model.beforeBulkDestroy(({where, individualHooks}) => {
  // individualHooks - 第二個參數被擴展的克隆被覆蓋的默認值發送到 Model.destroy
  // where - 第二个参数的克隆的字段之一发送到 Model.destroy
});
Model.destroy({ where: {username: 'Tom'}} /*where 参数*/)

// 如果用 updates.OnDuplicate 參數使用 Model.bulkCreate(...)，那麼 hook 中對 updatesOnDuplicate 陣列中沒有給出的欄位所做的更改將不會被持久保留到資料庫。但是，如果這是您想要的，則可以更改 hook 中的 updatesOnDuplicate 選項。

// 使用 updatesOnDuplicate 選項批量更新現有用戶
User.bulkCreate([
  {id: 1, isMember: true},
  {id: 2, isMember: false}
], {
  updatesOnDuplicate: ['isMember']
});

User.beforeBulkCreate((users, options) => {
  for (const user of users) {
    if (user.isMember) {
      user.memberSince = new Date();
    }
  }

  options.updateOnDuplicate.push('memberSince');
});


// 關聯

// 在大多数情况下，hook 对于相关联的实例而言将是一样的，除了几件事情之外。

// 1. 当使用 add/set 函数时，将运行 beforeUpdate/afterUpdate hook。
// 2. 调用 beforeDestroy/afterDestroy hook 的唯一方法是与 onDelete: cascade 和参数 hooks: true 相关联。 例如：

const Projects = sequelize.define('projects', {
  title: DataTypes.STRING
});

const Tasks = sequelize.define('tasks', {
  title: DataTypes.STRING
});

Projects.hasMany(Tasks, {onDelete: 'cascade', hooks: true});
Task.belongsTo(Projects);

// 該代碼將在 Tasks 表上運行 beforeDestroy / afterDestroy。默認情況下，Sequelize 会尝试尽可能优化您的查询。 在删除时调用级联，Sequelize 将简单地执行一个

// DELETE FROM `table` WHERE associatedIdentifier = associatedIdentifier.primaryKey

// 然而，添加 hooks: true 会明确告诉 Sequelize，优化不是你所关心的，并且会在关联的对象上执行一个 SELECT，并逐个删除每个实例，以便能够使用正确的参数调用 hook。

// 如果你的關聯類型為 n:m，則在使用 remove 調用時，您可能有興趣在直通模型上觸發 hook。在內部，sequelize 使用 Model.destroy，致使在每個實例上調用的 bulkDestroy 而不是 before / afterDestroy hook。

// 這可以透過將 {individualHooks: true} 傳遞給 remove 調用來簡單地解決，從而導致每個 hook 都透過實例對象被刪除。


// 關於事務的注意事項

// 请注意，Sequelize 中的许多模型操作允许您在方法的 options 参数中指定事务。 如果在原始调用中 指定 了一个事务，它将出现在传递给 hook 函数的 options 参数中。例如：

// 這裏我們使用異步 hook 的 promise 風格，而不是回調：
User.hook('afterCreate', (user, options) => {
  // 'tranasction' 將在 options.transaction 中可用

  // 此操作將成為與原始 User.create 調用相同的事務的一部分
  return User.update({
    mood: 'sad'
  }, {
    where: {
      id: user.id
    },
    transaction: options.transaction
  });
});

sequelize.transaction(transaction => {
  User.create({
    username: 'someguy',
    mood: 'happy',
    transaction
  });
});

// 如果我们在上述代码中的 User.update 调用中未包含事务选项，则不会发生任何更改，因为在已提交挂起的事务之前，我们新创建的用户不存在于数据库中。


// 內部事務

// 要認識到 sequelize 可能會在某些操作 (如 Model.findOrCreate) 內部使用事務是非常重要的。如果你的 hook 函數執行依赖对象在資料库中存在的读取或写入操作，或者修改对象的存储值，就像上一节中的例子一样，你应该总是指定 { transaction: options.transaction }。

// 如果在处理操作的过程中已经调用了该 hook ，则这将确保您的依赖读/写是同一事务的一部分。 如果 hook 没有被处理，你只需要指定{ transaction: null } 并且可以预期默认行为。