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