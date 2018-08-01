// Transactions - 事務

const Sequelize = require('sequelize');
const sequelize = require('./models');

// Sequelize 支持兩種使用事務的方法：

// 1. 一個將根據 promise 鍵的結果自動提交或回滾事務，(如果啟用) 用回調將該事務傳遞給所有調用
// 2. 而另一個 leave committing，回滾並將事務傳遞給用戶

// 主要區別在於託管事務使用一個回調，對非託管事務而言期望 promise 返回一個 promise 的結果。


// 托管事務 (auto-callback)

// 托管事務自動處理提交或回滾事務。你可以透過將回調傳遞給 sequelize.transaction 來啟動托管事務。

// 注意回傳傳遞給 transaction 的回調是否是一個 promise 鍵，並且沒有明確地調用 t.commit() 或 t.rollback()。如果返回鍊中的所有 promise 都已成功解決，則事務被提交。如果一個或幾個 promise 被拒絕，事務將回滾。

return sequelize.transaction(function (t) {

  // 在這裡鏈接您的所有查詢。確保你返回他們
  return User.create({
    firstName: 'Abraham',
    lastName: 'Lincoln'
  }, {transaction: t}).then(function (user) {
    return user.setShooter({
      firstName: 'John',
      lastName: 'Boothe'
    }, {transaction: t});
  })
}).then(function (result) {
  // 事務已被提交
  // result 是 promise 鏈返回到事務回調的結果
}).catch(function (err) {
  // 事務已被回滾
  // err 是拒絕 promise 鍵返回到事務回調的錯誤
});


// 拋出錯誤到回滾

// 使用託管事務時，你應該 永不 手動提交或回滾事務。如果所有查詢都成功，但你仍然希望回滾事務 (例如因為驗證失敗)，則應該拋出一個錯誤來斷開和拒絕鏈接。

return sequelize.transaction(function (t) {
  return User.create({
    firstName: 'Abraham',
    lastName: 'Lincoln'
  }, {transaction: t}).then(function (user) {
    throw new Error(); // 查询成功，但我们仍然想回滚！
  })
});


// 自動將事務傳遞給所有查詢

// 在上面例子中，事務仍然是手動傳遞的，透過傳遞 {transaction: t} 作為第二個參數。要自動將事務傳遞給所有查詢，你必須安裝 continuation local storage (CLS) 模組，並在您自己的代碼中實例化一個命名空間：

const cls = require('continuation-local-storage'),
  namespace = cls.createNamespace('my-very-own-namespace');

// 要啟用 CLS，您必須透過使用 sequelize 構造函數的靜態方法來告訴 Sequelize 要使用的命名空間：

Sequelize.useCLS(namespace);

new Sequelize(/* ... */);

// 请注意， useCLS() 方法在 构造函数 上，而不是在 sequelize 的实例上。
// 这意味着所有实例将共享相同的命名空间，并且 CLS 是全部或全无方式 - 你不能仅在某些实例中启用它。

// CLS 的工作方式就像一個用於回調的本地線程存儲。這在實踐中意味著不同的回調鏈可以透過使用CLS 命名空間來訪問局部變量。
// 當啟用 CLS 時，創建新事務時，Sequelize 將在命名空間上設置 transaction 屬性。由於回調鏈中設置的變數對該鏈是私有的，因此可以存在多個併發事務。

sequelize.transaction(function (t1) {
  namespace.get('transaction') === t1; // true
});

sequelize.transaction(function (t2) {
  namespace.get('transaction') === t2; // true
});

// 在大多数情况下，你不需要直接访问 namespace.get('transaction')，因为所有查询都将自动在命名空间中查找事务：

sequelize.transaction(function (t1) {
  // 启用 CLS 后，将在事务中创建用户
  return User.create({ name: 'Alice' });
});

// 在使用 Sequelize.useCLS() 后，从 sequelize 返回的所有 promise 将被修补以维护 CLS 上下文。 CLS 是一个复杂的课题 - cls-bluebird 的文档中有更多细节，用于使 bluebird promise 的补丁与CLS一起工作。

// 注意：当使用 cls-hooked 软件包的时候，CLS 仅支持 async/await. 即使，cls-hooked 依靠 *试验性的 API* async_hooks


// 並行 / 部分事務

// 你可以在一系列查詢中執行併發事務，或者將某些事務從任何事務中排除。使用 {transaction: } 選項來控制查詢所屬的事務：

// 警告：SQLite 不能同時支持多個事務

// 不啟用 CLS

sequelize.transaction(function (t1) {
  return sequelize.transaction(function (t2) {
    // 启用CLS，这里的查询将默认使用 t2
    // 通过 `transaction` 选项来定义/更改它们所属的事务。
    return Promise.all([
      User.create({name: 'Bob'}, {transaction: null}),
      User.create({name: 'Bob'}, {transaction: t1}),
      User.create({name: 'Bob'}), // 默認為 t2
    ])
  })
});


// 隔離等級

// 啟動事務時可能使用的隔離等級：

Sequelize.Transaction.ISOLATION_LEVELS.READ_UNCOMMITTED;
Sequelize.Transaction.ISOLATION_LEVELS.READ_COMMITTED;
Sequelize.Transaction.ISOLATION_LEVELS.REPEATABLE_READ;
Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE;

// 默認，sequelize 使用資料庫的隔離級別。如果要使用不同的隔離級別，請傳入所需級別作為第一個參數：

return sequelize.transaction({
  isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE
}, function (t) {
  // 你的事務
});

// 注意：在 MSSQL 的情況下，SET ISOLATION LEVEL 查詢不被記錄，指定的 isolationLevel 直接傳遞到 tedious


// 非託管事務 (then-callback)

// 非托管事务强制您手动回滚或提交交易。 如果不这样做，事务将挂起，直到超时。
// 要启动非托管事务，请调用 sequelize.transaction() 而不用 callback（你仍然可以传递一个选项对象），并在返回的 promise 上调用 then。 请注意，commit() 和 rollback() 返回一个 promise。

return sequelize.transaction().then(function (t) {
  return User.create({
    firstName: 'Bart',
    lastName: 'Simpson'
  }, {transaction: t}).then(function (user) {
    return user.addSibling({
      firstName: 'Lisa',
      lastName: 'Simpson'
    }, {transaction: t});
  }).then(function () {
    return t.commit()
  }).catch(function (err) {
    return t.rollback();
  })
});

// 參數

// 可以使用 options 對象作為第一個參數來調用 transaction 方法，這允許配置事務。

return sequelize.transaction({/* options */});

// 以下選項 (使用默認值) 可用：

// {
//   autocommit: true,
//   isolationLevel: 'REPEATABLE_READ',
//   deferrable: 'NOT DEFERRABLE' // postgres 的默认设置
// }

// 在为 Sequelize 实例或每个局部事务初始化时，isolationLevel可以全局设置：

// 全局
new Sequelize('db', 'user', 'pw', {
  isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE
});

// 局部
sequelize.transaction({
  isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE
});

// deferrable 选项在事务开始后触发一个额外的查询，可选地将约束检查设置为延迟或立即。 请注意，这仅在 PostgreSQL 中受支持。

sequelize.transaction({
  // 推迟所有约束：
  deferrable: Sequelize.Deferrable.SET_DEFERRED,

  // 推迟具体约束：
  deferrable: Sequelize.Deferrable.SET_DEFERRED(['some_constraint']),

  // 不推迟约束：
  deferrable: Sequelize.Deferrable.SET_IMMEDIATE
})


// 使用其他 Sequelize 方法

// transaction 选项与其他大多数选项一起使用，通常是方法的第一个参数。对于取值的方法，如 .create, .update(), .updateAttributes() 等。应该传递给第二个参数的选项。 如果不确定，请参阅 API 文档中的用于确定签名的方法。


// 後提交 hook

// transaction 對象允許跟蹤是否提交以及何時提交
// 可以將 afterCommit hook 添加到託管和非託管事務對象

sequelize.transaction(t => {
  t.afterCommit((transaction) => {
    // 你的邏輯片段
  })
});

sequelize.transaction().then(t => {
  t.afterCommit((transaction) => {
    // 你的邏輯片段
  })

  return t.commit();
});

// 传递给 afterCommit 的函数可以有选择地返回一个 promise，在创建事务的 promise 链解析之前这个 promise 会被解析。
// - afterCommit 如果事务回滚，hook 不会 被提升。
// - afterCommit hook 不像标准 hook， 不会 修改事务的返回值。

// 您可以将 afterCommit hook 与模型 hook 结合使用，以了解实例何时在事务外保存并可用

model.afterSave((instance, options) => {
  if (options.transaction) {
    // 在事务内保存完成，等到事务被提交以通知监听器实例已被保存
    options.transaction.afterCommit(() => {/* Notify */
    });
    return;
  }
  // 在事务之外保存完成，对于调用者来说可以安全地获取更新后的模型通知
});


// 鎖定

// 可以使用锁执行 transaction 内的查询
return User.findAll({
  limit: 1,
  lock: true,
  transaction: t1
});

// 事務內的查詢可以跳過鎖定的列
return User.findAll({
  limit: 1,
  lock: true,
  skipLocked: true,
  transaction: t2
});