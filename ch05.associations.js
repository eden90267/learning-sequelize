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
const Task = sequelize.define('task', { title: Sequelize.STRING });
const User = sequelize.define('user', { username: Sequelize.STRING });

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

