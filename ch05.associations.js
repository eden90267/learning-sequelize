// Associations - 關聯

// Sequelize 中有四種類型的關聯
// 1. BelongsTo
// 2. HasOne
// 3. HasMany
// 4. BelongsToMany

var Sequelize = require('sequelize');
var sequelize = require('./models');

// 基本概念

// Source & Target
// 這裡我們在 User 和 Project 之間添加一個 hasOne 關聯

const User = sequelize.define('User', {
  name: Sequelize.STRING,
  email: Sequelize.STRING
});

const Project = sequelize.define('Project', {
  name: Sequelize.STRING
});

User.hasOne(Project);

// User: source, Project: target

// 外鍵
// 當你在模型中創建關聯時，會自動創建帶約束的外鍵引用
const Task = sequelize.define('task', {title: Sequelize.STRING});
const User = sequelize.define('user', {username: Sequelize.STRING});

User.hasMany(Task); // 將會添加 userId 到 Task 模型
Task.belongsTo(User); // 也將會添加 userId 到 Task 模型

// 將生成以下 SQL：

/**
 CREATE TABLE IF NOT EXISTS "users" (
 "id" SERIAL,
 "username" VARCHAR(255),
 "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
 "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
 PRIMARY KEY ("id")
 );

 CREATE TABLE IF NOT EXISTS "tasks" (
 "id" SERIAL,
 "title" VARCHAR(255),
 "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
 "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
 "userId" INTEGER REFERENCES "users" ("id") ON DELETE
 SET
 NULL ON UPDATE CASCADE,
 PRIMARY KEY ("id")
 );
 */

// 默认情况下，如果引用的用户被删除，userId 将被设置为 NULL，如果更新了 userId，则更新 userId
// 这些选项可以通过将 onUpdate 和 onDelete 选项传递给关联调用来覆盖。 验证选项是 RESTRICT, CASCADE, NO ACTION, SET DEFAULT, SET NULL

// 對於 1:1 和 1:m 關聯，默認選項是 SET NULL 用於刪除，CASCADE 用於更新。對於 n:m，兩者默認值是 CASCADE。這意味著，如果您從 n:m 關聯的一側刪除或更新一行，則引用的連接表中的所有行也將被刪除或更新。


// 下劃線參數

// Sequelize 允許為模型設置 underscored 選項。當 true 時，這個選項會將所有屬性的 field 選項設置為名稱的下劃線版本。這也是用於關聯生成的外鍵
const Task = sequelize.define('task', {
  title: Sequelize.STRING
}, {
  underscored: true
});

const User = sequelize.define('user', {
  username: Sequelize.STRING
}, {
  underscored: true
});

// 将 userId 添加到 Task 模型，但字段将被设置为 `user_id`
// 这意味着列名将是 `user_id`
User.hasMany(Task);

// 也会将 userId 添加到 Task 模型，但字段将被设置为 `user_id`
// 这意味着列名将是 `user_id`
Task.belongsTo(User);

/**
 CREATE TABLE IF NOT EXISTS "users" (
 "id" SERIAL,
 "username" VARCHAR(255),
 "created_at" TIMESTAMP WITH TIME ZONE NOT NULL,
 "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL,
 PRIMARY KEY ("id")
 );

 CREATE TABLE IF NOT EXISTS "tasks" (
 "id" SERIAL,
 "title" VARCHAR(255),
 "created_at" TIMESTAMP WITH TIME ZONE NOT NULL,
 "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL,
 "user_id" INTEGER REFERENCES "users" ("id") ON DELETE
 SET
 NULL ON UPDATE CASCADE,
 PRIMARY KEY ("id")
 );
 */

// 注入到模型中的下劃線選項屬性仍然是駱駝式的，但 field 選項設置為其下劃線版本


// 循環依賴 & 禁用約束

// 在表之間添加約束意味著當使用 sequelize.sync 時，表必須以特定順序在數據庫中創建表。如果 Task 具有對 User 的引用，users 表必須在創建 tasks 表之前創建。這有時會導致循環引用，那麼 sequelize 將無法找到要同步的順序。
// 想像一下文檔和版本的場景。一個文檔可以有多少版本，並且為了方便起見，文檔引用了它的當前版本。

const Document = sequelize.define('document', {
  author: Sequelize.STRING
});
const Version = sequelize.define('version', {
  timestamp: Sequelize.DATE
});

Document.hasMany(Version); // 这将 documentId 属性添加到 version
Document.belongsTo(Version, {
  as: 'Current',
  foreignKey: 'currentVersionId'
}); // 这将 currentVersionId 属性添加到 document

// 但是，上面的代碼將導致以下錯誤：
// Cyclic dependency found. documents is dependent of itself. Dependency chain: documents -> versions => documents.

// 為了減緩這一點，我們可以向其中一個關鍵傳遞 constraints: false
Document.hasMany(Version);
Document.belongsTo(Version, {
  as: 'Current',
  foreignKey: 'currentVersionId',
  constraints: false
});

// 這將可以讓我們正確同步表：

/**
 CREATE TABLE IF NOT EXISTS "documents" (
 "id" SERIAL,
 "author" VARCHAR(255),
 "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
 "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
 "currentVersionId" INTEGER,
 PRIMARY KEY ("id")
 );

 CREATE TABLE IF NOT EXISTS "versions" (
 "id" SERIAL,
 "timestamp" TIMESTAMP WITH TIME ZONE,
 "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
 "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
 "documentId" INTEGER REFERENCES "documents" ("id") ON DELETE
 SET
 NULL ON UPDATE CASCADE,
 PRIMARY KEY ("id")
 );
 */


// 無限制地執行外鍵引用

// 有時你可能想引用另一個表，而不添加任何約束或關聯。在這種情況下，您可以手動將參考屬性添加到您的模式定義中，並標記它們之間的關係。

const Trainer = sequelize.define('trainer', {
  firstName: Sequelize.STRING,
  lastName: Sequelize.STRING
});

// Series 將有一個 trainerId = Trainer.id 外參考鍵
// 之後我們調用 Trainer.hasMany(series)
const Series = sequelize.define('series', {
  title: Sequelize.STRING,
  subTitle: Sequelize.STRING,
  description: Sequelize.TEXT,
  // 用 `Trainer` 设置外键关系（hasMany）
  trainerId: {
    type: Sequelize.INTEGER,
    references: {
      model: Trainer,
      key: 'id'
    }
  }
});

// Video 将有 seriesId = Series.id 外参考键
// 之后我们调用 Series.hasOne(Video)
const Video = sequelize.define('video', {
  title: Sequelize.STRING,
  sequence: Sequelize.INTEGER,
  description: Sequelize.TEXT,
  // 用 `Series` 設置關係 (hasOne)
  seriesId: {
    type: Sequelize.INTEGER,
    references: {
      model: Series, // 可以是表名的字符串，也可以是 Sequelize 模型
      key: 'id'
    }
  }
});

Series.hasOne(Video);
Trainer.hasMany(Series);


// 一對一關聯