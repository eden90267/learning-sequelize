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
// - 你想要覆蓋到 migrations, models, seeders 或 config 文件夾的路徑
// - 你想要重命名 config.json 成為別的名字比如 database.json

// 還有更多的，让我们看一下如何使用这个文件进行自定义配置。

// 對於初學者，可以在項目的根目錄中創建一個空文件

// $ touch .sequelizerc

// 現在可以使用示例配置。

const path = requelize('path');

module.exports = {
  'config': path.resolve('config', 'database.json'),
  'models-path': path.resolve('db', 'models'),
  'seeders-path': path.resolve('db', 'seeders'),
  'migrations-path': path.resolve('db', 'migrations')
};

// 透過這個配置你告訴 CLI：

// - 使用 config/database.json 文件来配置设置
// - 使用 db/models 作为模型文件夹
// - 使用 db/seeders 作为种子文件夹
// - 使用 db/migrations 作为迁移文件夹


// 動態配置

// 配置文件是默认的一个名为 config.json 的 JSON 文件。 但有时你想执行一些代码或访问环境变量，这在 JSON 文件中是不可能的。

// Sequelize CLI 可以从 “JSON” 和 “JS” 文件中读取。 这可以用 .sequelizerc 文件设置。 让我们来看一下

// 首先，您需要在项目的根文件夹中创建一个 .sequelizerc 文件。 该文件应该覆盖 JS 文件的配置路径。 推荐这个

const path = requelize('path');

module.exports = {
  'config': path.resolve('config', 'config.js')
}

// 一个 config/config.js 文件的例子

const fs = require('fs');

module.exports = {
  development: {
    username: 'database_dev',
    password: 'database_dev',
    database: 'database_dev',
    host: '127.0.0.1',
    dialect: 'mysql'
  },
  test: {
    username: 'database_test',
    password: null,
    database: 'database_test',
    host: '127.0.0.1',
    dialect: 'mysql'
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOSTNAME,
    dialect: 'mysql',
    dialectOptions: {
      ssl: {
        ca: fs.readFileSync(__dirname + '/mysql-ca-master.crt')
      }
    }
  }
};


// 使用 Babel

// 现在你已经知道如何使用 .sequelizerc 文件。 接下来让我们看看如何用这个文件通过 sequelize-cli 的设置来使用 babel。 这里允许您使用 ES6/ES7 语法编写 migration 和 seeder。

// 首先安裝 babel-register

// $ npm i babel-register --save-dev

// 現在 .sequelizerc 文件：

require("babel-register");

const path = requelize('path');

module.exports = {
  'config': path.resolve('config', 'config.json'),
  'models-path': path.resolve('db', 'models'),
  'seeders-path': path.resolve('db', 'seeders'),
  'migrations-path': path.resolve('db', 'migrations')
};

// 现在 CLI 将能够从 migration/seeder 等运行 ES6/ES7 代码。请记住，这取决于你的 .babelrc 的配置。更多内容请查阅 babeljs.io。


// 使用環境變量

// 使用 CLI，您可以直接訪問 config/config.js 內的環境變量。您可以使用 .sequelizerc 來告訴 CLI 使用 config/config.js 進行配置，然後你可以使用正確的環境變數來曝露文件。

module.exports = {
  development: {
    username: 'database_dev',
    password: 'database_dev',
    database: 'database_dev',
    host: '127.0.0.1',
    dialect: 'mysql'
  },
  test: {
    username: process.env.CI_DB_USERNAME,
    password: process.env.CI_DB_PASSWORD,
    database: process.env.CI_DB_NAME,
    host: '127.0.0.1',
    dialect: 'mysql'
  },
  production: {
    username: process.env.PROD_DB_USERNAME,
    password: process.env.PROD_DB_PASSWORD,
    database: process.env.PROD_DB_NAME,
    host: process.env.PROD_DB_HOSTNAME,
    dialect: 'mysql'
  }
};


// 指定方言選項

// 有時你想指定一個 dialectOption，如果它是一個通用配置，你可以將其添加到 config/config.json 中。 有时你想执行一些代码来获取 dialectOptions，你应该为这些情况使用动态配置文件。

/**
 {
   "production": {
     "dialect":"mysql",
     "dialectOptions": {
       "bigNumberStrings": true
     }
   }
 }
 */


// 生產用途

// 有關在生產環境中使用 CLI 和遷移設置的一些提示

// 1. 使用環境變量進行配置設置。這是透過動態配置更好地實現的。樣品生產安全設置可能看起來像

const fs = require('fs');

module.exports = {
  development: {
    username: 'database_dev',
    password: 'database_dev',
    database: 'database_dev',
    host: '127.0.0.1',
    dialect: 'mysql'
  },
  test: {
    username: 'database_test',
    password: null,
    database: 'database_test',
    host: '127.0.0.1',
    dialect: 'mysql'
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOSTNAME,
    dialect: 'mysql',
    dialectOptions: {
      ssl: {
        ca: fs.readFileSync(__dirname + '/mysql-ca-master.crt')
      }
    }
  }
};

// 我們的目標是為各種資料庫秘密使用環境變量，而不是意外檢查它們來源控制。


// 存儲

// 我們使用三種類型的存儲：sequelize、json 和 none
// - sequelize：將遷移和種子存儲在 sequelize 資料庫的表中
// - json：將遷移和種子存儲在 json 文件上
// - none：不存儲任何遷移/種子

// 遷移存儲

// 默认情况下，CLI 将在您的数据库中创建一个名为 SequelizeMeta 的表，其中包含每个执行迁移的条目。
// 要更改此行为，可以在配置文件中添加三个选项。
// 使用 migrationStorage 可以选择要用于迁移的存储类型。
// 如果选择 json，可以使用 migrationStoragePath 指定文件的路径，或者 CLI 将写入 sequelize-meta.json 文件。
// 如果要将数据保存在数据库中，请使用 sequelize，但是要使用其他表格，可以使用 migrationStorageTableName。

/**
 {
   "development": {
     "username": "root",
     "password": null,
     "database": "database_development",
     "host": "127.0.0.1",
     "dialect": "mysql",

     // 使用不同的存储类型. Default: sequelize
     "migrationStorage": "json",

     // 使用不同的文件名. Default: sequelize-meta.json
     "migrationStoragePath": "sequelizeMeta.json",

     // 使用不同的表名. Default: SequelizeMeta
     "migrationStorageTableName": "sequelize_meta"
   }
 }
 */

// 注意：不推荐使用 none 存储作为迁移存储。如果您决定使用它，请注意将会没有任何移动记录或没有运行的记录。

// 種子存儲

// 默认情况下，CLI 不会保存任何被执行的种子。
// 如果您选择更改此行为(!)，则可以在配置文件中使用 seederStorage 来更改存储类型。
// 如果选择 json，可以使用 seederStoragePath 指定文件的路径，或者 CLI 将写入文件 sequelize-data.json。
// 如果要将数据保存在数据库中，请使用 sequelize，您可以使用 seederStorageTableName 指定表名，否则将默认为 SequelizeData。

/**
 {
   "development": {
     "username": "root",
     "password": null,
     "database": "database_development",
     "host": "127.0.0.1",
     "dialect": "mysql",
     // 使用不同的存储空间. Default: none
     "seederStorage": "json",
     // 使用不同的文件名. Default: sequelize-data.json
     "seederStoragePath": "sequelizeData.json",
     // 使用不同的表名 Default: SequelizeData
     "seederStorageTableName": "sequelize_data"
   }
 }
 */


// 配置連接字符串

// 作為 --config 選項的替代方法，可以使用定義資料庫的配置文件，您可以使用 --url 選項傳遞連接字符串。例如：

// $ node_modules/.bin/sequelize db:migrate --url 'mysql://root:password@mysql_host.com/database_name'

// 透過 SSL 連接

// 確保 ssl 在 dialectOptions 和基本配置中指定。

/**
 {
     "production": {
         "dialect":"postgres",
         "ssl": true,
         "dialectOptions": {
             "ssl": true
         }
     }
 }
 */

// 程序化使用

// Sequelize 有一個姐妹庫：https://github.com/sequelize/umzug，用以編程方式處理遷移任務的執行和紀錄


// 查詢界面

// 使用 queryInterface 对象描述之前，您可以更改数据库模式。 查看完整的公共方法列表，它支持 QueryInterface API：http://docs.sequelizejs.com/class/lib/query-interface.js~QueryInterface.html