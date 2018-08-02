// Migrations - 遷移

// 就像您使用 Git/SVN 來管理源代碼的更改一樣，您可以使用遷移來跟蹤資料庫的更改。透過遷移，您可將現有資料庫轉移到另一個狀態，反之亦然：這些狀態轉換將保存在遷移文件中，它們描述了如何進入新狀態以及如何還原更改以恢復舊狀態。

// 您將需要 Sequelize CLI。CLI 支持遷移和項目引導


// 命令行介面

// $ npm i --save sequelize-cli

// 引導

// 要創建一個空項目，你需要執行 init 命令
// $ node_modules/.bin/sequelize init

// 這將創建以下資料夾

// - config，包含配置文件，它告訴 CLI 如何連接資料庫
// - models，包含您的項目的所有模型
// - migrations，包含所有遷移文件
// - seeders，包含所有種子文件

// 結構

// 在繼續進行之前，我們需要告訴 CLI 如何連接資料庫。可打開 config/config.json：

/**
{
  "development": {
    "username": "root",
    "password": null,
    "database": "database_development",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "test": {
    "username": "root",
    "password": null,
    "database": "database_test",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "production": {
    "username": "root",
    "password": null,
    "database": "database_production",
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
}
 */

// 如果資料庫還不存在，你可調用 db:create 命令。透過正確訪問，它將為您創建該資料庫


// 創建第一個模型 (和遷移)

// 一旦您正確配置了 CLI 配置件，您就可以首先創建遷移。它就像執行一個簡單的命令一樣簡單。

// model:generate 命令。此命令需要兩個選項
// - name，模型的名稱
// - attribute，模型的屬性列表

// 讓我們創建一個名叫 User 的模型
// $ node_modules/.bin/sequelize model:generate --name User --attributes firstName:string,lastName:string,email:string

// 這將發生以下事情
// - 在 models 文件夾中創建一個 user 模型文件
// - 在 migrations 文件夾中創建一個名字像 XXXXXXXXXXXXXX-create-user.js 的遷移文件

// 注意：Sequelize 將只使用模型文件，它只是表描述。另一邊，遷移文件是該模型的更改，或更具體的是說 CLI 所使用的表。處理遷移，如提交或日誌，以進行資料庫的某些更改。


// 進行遷移

// 直到這一步，CLI 沒有將任何東西插入資料庫。我們剛剛為我們的第一個模型 user 創建了必須的模型和遷移文件。現在要在資料庫中實際創建該表，需要運行 db:migrate 命令。

// $ node_modules/.bin/sequelize db:migrate

// 此命令將執行這些步驟

// - 將在資料庫中確保一個名為 SequelizeMeta 的表。此表用於記錄在當前資料庫上運行的遷移
// - 開始尋找尚未運行的任何遷移文件。這可以透過檢查 SequelizeMeta 表。在這個例子中，它將運行我們在最後一步中創建的 XXXXXXXXXXXXXX-create-user.js 遷移
// - 創建一個名為 Users 的表，其中包含其遷移文件中指定的所有行

// 撤銷遷移

// 現在我們的表已創建並保存在資料庫中。透過遷移，只需運行命令即可恢復為舊狀態

// 您可以使用 db:migrate:undo，這個命令將會恢復最近的遷移

// $ node_modules/.bin/sequelize db:migrate:undo

// 透過使用 db:migrate:undo:all 命令撤銷所有遷移，可以恢復到初始狀態。你還可以透過將其名稱傳遞到 --to 選項中來恢復到特定的遷移。

// $ node_modules/.bin/sequelize db:migrate:undo:all --to XXXXXXXXXXXXXX-create-posts.js


// 創建第一個種子

// 假設我們希望在默認情況下將一些資料插入到幾個表中。如果我們跟進前面的例子，我們可以考慮為 User 表創建演示用戶。

// 要管理所有數據遷移，你可以使用 seeders。種子文件是資料的一些變化，可用於使用樣本資料或測試資料填充資料庫表。

// 讓我們創建一個種子文件，它會將一個演示用戶添加到我們的 User 表中。

// $node_modules/.bin/sequelize seed:generate --name demo-user

// 這個命令將會在 seeders 文件夹中创建一个种子文件。文件名看起来像是 XXXXXXXXXXXXXX-demo-user.js，它遵循相同的 up/down 语义，如迁移文件。

// 现在我们应该编辑这个文件，将演示用户插入User表。

'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('User', [{
      firstName: 'John',
      lastName: 'Doe',
      email: 'demo@demo.com'
    }]);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {});
  }
};


// 運行種子

// 在上一步中，你创建了一个种子文件。但它还没有保存到資料庫。为此，我们需要运行一个简单的命令。

// $node_modules/.bin/sequelize db:seed:all

// 這將執行該種子文件，您將有一個掩飾用戶插入 User 表。

// 注意：seeders 執行不會存儲在任何使用 SequelizeMeta 表的遷移的地方。如果你想覆蓋這個，請閱讀存儲部分


// 撤銷種子

// Seeders 如果使用了任何存儲那麼就可以被撤消。有兩個可用的命令：

// 如果你想撤銷最近的種子
// $ node_modules/.bin/sequelize db:seed:undo

// 如果你想要撤銷指定的種子
// $ node_modules/.bin/sequelize db:seed:undo --seed name-of-seed-as-in-data

// 如果你想撤銷所有種子
// $ node_modules/.bin/sequelize db:seed:undo:all


// 高級專題

// 遷移框架

// 以下框架顯示了一個典型的遷移文件
module.exports = {
  up: (queryInterface, Sequelize) => {
    // 转变为新状态的逻辑
  },

  down: (queryInterface, Sequelize) => {
    // 恢复更改的逻辑
  }
};

// 傳統的 queryInterface 物件可以用來修改資料庫。Sequelize 物件存儲可用的資料類型，如 STRING 或 INTEGER。函數 up 或 down 應該返回一個 Promise。讓我們看例子：

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Person', {
      name: Sequelize.STRING,
      isBetaMember: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Person');
  }
}


// .sequelizerc 文件

// 這是一個特殊的配置文件，它允許您指定通常作為參數傳遞給 CLI 的各種選項。讚某些情況下，你可以使用它。

-