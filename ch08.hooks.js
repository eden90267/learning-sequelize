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

// 如果要為每個單獨的紀錄觸發 hook，連同批量 hook，您可以將 personalHooks: true 傳遞給調用
Model.destroy({ where: {accessLevel: 0}, individualHooks: true});
// 将选择要删除的所有记录，并在每个实例删除之前 + 之后触发

Model.update({username: 'Toni'}, { where: {accessLevel: 0}, individualHooks: true});
// 将选择要更新的所有记录，并在每个实例更新之前 + 之后触发