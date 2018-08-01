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

// 你可以在一系列查詢中執行併發事務，或者將某些事物從任何事務中排除。使用 {transaction: } 選項來控制查詢所屬的事務