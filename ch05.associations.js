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

// 透過單個外鍵連接的兩個模型之間的關聯

// BelongsTo
// 在 source model 上存在一對一關係的外鍵的關聯
// Player 透過 player 的外鍵作為 Team 的一部分
const Player = sequelize.define('player', {/* attributes */});
const Team  = sequelize.define('team', {/* attributes */});

Player.belongsTo(Team); // 将向 Player 添加一个 teamId 属性以保存 Team 的主键值

// 外鍵

// 默認情況是目标模型名称和目标主键名称生成 belongsTo 关系的外键。
// 默认的样式是 camelCase，但是如果源模型配置为 underscored: true ，那么将使用字段 snake_case 创建 foreignKey

const User = this.sequelize.define('user', {/* attributes */})
const Company  = this.sequelize.define('company', {/* attributes */});

// 将 companyId 添加到 user
User.belongsTo(Company);

const User = this.sequelize.define('user', {/* attributes */}, {underscored: true})
const Company  = this.sequelize.define('company', {
  uuid: {
    type: Sequelize.UUID,
    primaryKey: true
  }
});

// 将用字段 company_uuid 添加 companyUuid 到 user
User.belongsTo(Company);

// 在已定义 as 的情况下，将使用它代替目标模型名称。
const User = this.sequelize.define('user', {/* attributes */})
const UserRole  = this.sequelize.define('userRole', {/* attributes */});

User.belongsTo(UserRole, {as: 'role'}); // 将 role 添加到 user 而不是 userRole

// 在所有情况下，默认外键可以用 foreignKey 选项覆盖。 当使用外键选项时，Sequelize 将按原样使用：
const User = this.sequelize.define('user', {/* attributes */});
const Company  = this.sequelize.define('company', {/* attributes */});

User.belongsTo(Company, {foreignKey: 'fk_company'}); // 将 fk_company 添加到 User

// 目標鍵

// 目標鍵是源模型上的外鍵行指向目標模型上的行。默認情況下，belongsTo 關係的目標鍵將是目標模型的主鍵。要定義自定義行，請使用 targetKey 選項。

const User = this.sequelize.define('user', {/* attributes */})
const Company  = this.sequelize.define('company', {/* attributes */});

User.belongsTo(Company, {foreignKey: 'fk_companyname', targetKey: 'name'}); // 添加 fk_companyname 到 User


// HasOne

// HasOne 關聯是在 target model 上存在一對一關係的外鍵的關聯

const User = sequelize.define('user', {/* ... */});
const Project = sequelize.define('project', {/* ... */});

// 单向关联
Project.hasOne(User);

/*
  在此示例中，hasOne 将向 User 模型添加一个 projectId 属性 ！

  此外，Project.prototype 将根据传递给定义的第一个参数获取 getUser 和 setUser 的方法。
  如果启用了 underscore 样式，则添加的属性将是 project_id 而不是 projectId。

  外键将放在 users 表上。

  你也可以定义外键，例如 如果您已经有一个现有的数据库并且想要处理它：
*/
Project.hasOne(User, {foreignKey: 'initiator_id'});

/*
  因为 Sequelize 将使用模型的名称（define的第一个参数）作为访问器方法，
  还可以将特殊选项传递给hasOne：
*/
Project.hasOne(User, {as: 'Initiator'});
// 现在你可以获得 Project.getInitiator 和 Project.setInitiator

// 或者讓我們來定義一些自己的參考
const Person = sequelize.define('person', {/* ... */});

Person.hasOne(Person, {as: 'Father'});
// 這會將屬性 FatherId 添加到 Person

// also possible:
Person.hasOne(Person, {as: 'Father', foreignKey: 'DadId'});
// 這會將屬性 FatherId 添加到 Person

// 這兩種情況下，你都可以：
Person.setFather
Person.getFather

// 如果你需要連結表兩次，你可以連結同一張表
Team.hasOne(Game, {as: 'HomeTeam', foreignKey : 'homeTeamId'});
Team.hasOne(Game, {as: 'AwayTeam', foreignKey : 'awayTeamId'});
Game.belongsTo(Team);

// 即使它被稱為 HasOne 關聯，對於大多數 1:1 關係，你通常需要 BelongsTo 關聯，因為 BelongsTo 將會在 hasOne 將添加到目標的源上添加 foreignKey

// 源鍵

// 源關鍵是源模型中的屬性，它的目標模型指向外鍵屬性。默認情況下，hasOne 關係的源鍵將是源模型的主要屬性。要使用自定義屬性，請使用 sourceKey 選項。

const User = this.sequelize.define('user', {/* 属性 */})
const Company  = this.sequelize.define('company', {/* 属性 */});

// 将 companyName 属性添加到 User
// 使用 Company 的 name 属性作为源属性
Company.hasOne(User, {foreignKey: 'companyName', sourceKey: 'name'});


// HasOne 和 BelongsTo 之間的區別

// 在 Sequelize 1:1 關係中可以使用 HasOne 和 BelongsTo 進行設置。它們適用於不同的場景。我們用一個例子來研究這個差異：

// 假設兩個表可以鏈接 Player 和 Team。讓我們定義他們的模型。

const Player = this.sequelize.define('player', {/* attributes */})
const Team  = this.sequelize.define('team', {/* attributes */});

// 將 Player 作為 source 而 Team 作為 target
Player.belongsTo(Team);
// or
Team.hasOne(Player);

// HasOne 和 BelongsTo 將關聯鍵插入到不同的模型中。HasOne 在 target 模型中插入關鍵鍵，而 BelongsTo 將關聯鍵。

// 下面是一個示例，說明了 BelongsTo 和 HasOne 的用法。

const Player = this.sequelize.define('player', {/* attributes */});
const Coach = this.sequelize.define('coach', {/* attributes */});
const Team  = this.sequelize.define('team', {/* attributes */});

// 假设我们的 Player 模型有关于其团队的信息为 teamId 行。关于每个团队的 Coach 的信息作为 coachId 行存储在 Team 模型中。这两种情况都需要不同种类的1：1关系，因为外键关系每次出现在不同的模型上。

// 当关于关联的信息存在于 source 模型中时，我们可以使用 belongsTo。
Player.belongsTo(Team); // `teamId` 将被添加到 Player / Source 模型中

// 当关于关联的信息存在于 target 模型中时，我们可以使用 hasOne。
Coach.hasOne(Team); // `coachId` 将被添加到 Team / Target 模型中


// 一對多關聯 (hasMany)

// 一對多關聯將一個來源與多個目標連接起來。而多個目標接到同一個特定的源

const User = sequelize.define('user', {/* ... */})
const Project = sequelize.define('project', {/* ... */})

// 好。 现在，事情变得更加复杂（对用户来说并不真实可见）。
// 首先我们来定义一个 hasMany 关联
Project.hasMany(User, {as: 'Workers'});

// 这会将projectId 属性添加到 User。 根据您强调的设置，表中的行将被称为 projectId 或 project_id。
// Project 的实例将获得访问器 getWorkers 和 setWorkers。

// 有時您可能需要在不同的行上關聯紀錄，您可以使用 sourceKey 選項：

const City = sequelize.define('city', { countryCode: Sequelize.STRING });
const Country = sequelize.define('country', { isoCode: Sequelize.STRING });

Country.hasMany(City, {foreignKey: 'countryCode', sourceKey: 'isoCode'});
City.belongsTo(Country, {foreignKey: 'countryCode', targetKey: 'isoCode'});


// 多對多關聯

// 多对多关联用于将源与多个目标相连接。 此外，目标也可以连接到多个源
Project.belongsToMany(User, {through: 'UserProject'});
User.belongsToMany(Project, {through: 'UserProject'});

// 這將創建一個名為 UserProject 的新模型，具有等效的外鍵 projectId 和 userId。屬性是否為 camelcase 取决于由表（在这种情况下为 User 和 Project）连接的两个模型

// 定義 through 為 required。Sequelize 以前會嘗試自動生成名稱名稱，但並不總是導致最合乎邏輯的設置。

// 這將添加方法 getUsers, setUsers, addUser, addUsers 到 Project，還有 getProjects, setProjects, addProject, 和 addProjects 到 User

// 有時，您可能需要在關聯中使用它們時重命名模型。讓我們透過使用別名 (as) 選項將 users 定義為 workers 而 projects 定義為 tasks。我們還將手動定義要使用的外鍵：
User.belongsToMany(Project, {as: 'Tasks', through: 'worker_tasks', foreignKey: 'userId'});
Project.belongsToMany(User, {as: 'Workers', through: 'worker_tasks', foreignKey: 'projectId'});

// foreignKey 將允許你在 through 關係中設置 source model 鍵
// otherKey 將允許你在 through 關係中設置 target model 鍵
User.belongsToMany(Project, {as: 'Tasks', through: 'worker_tasks', foreignKey: 'userId', otherKey: 'projectId'});

// 當然你也可以使用 belongsToMany 定義自我引用
Person.belongsToMany(Person, {as: 'Children', through: 'PersonChildren'}); // 這將創建存儲物件的 ID 的表 PersonChildren。

// 如果您想要連接表中的其他屬性，則可以在定義關聯之前為連接表定義一個模型，然後再說明它應該使用該模型進行連接，而不是創建一個新的關聯：
const User = sequelize.define('user', {});
const Project = sequelize.define('project', {});
const UserProjects = sequelize.define('userProjects', {
  status: DataTypes.STRING
});

User.belongsToMany(Project, {through: UserProjects});
Project.belongsToMany(User, {through: UserProjects});

// 要向 user 添加一個新 project 並設置其狀態，您可將額外的 options.through 傳遞給 setter，其中包含連接表的屬性。
user.addProject(project, {through: {status: 'started'}});

// 默認情況下，上面的代碼會將 projectId 和 userId 添加到 UserProjects 表中，刪除任何先前定義的主鍵屬性 - 表將由兩個表的鍵的組合唯一標識，並且沒有其他主鍵行。要在 UserProjects 模型上強添加一個主鍵，您可以手動添加它。
const UserProjects = sequelize.define('userProjects', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  status: DataTypes.STRING
});

// 使用多對多你可以基於 through 關係查詢並選擇特定屬性。例如透過 through 使用 findAll
User.findAll({
  include: [{
    model: Project,
    through: {
      attribute: ['createdAt', 'startedAt', 'finishedAt'],
      where: {completed: true}
    }
  }]
});


// 命名策略

// 默认情况下，Sequelize将使用模型名称（传递给sequelize.define的名称），以便在关联时使用模型名称。例如，一个名为user的模型会将关联模型的实例中的 get / set / add User 函数和加入一个名为 .user 的属性，而一个名为 User 的模型会添加相同的功能，和一个名为 .User 的属性（注意大写U）。

// 正如我们已经看到的，你可以使用 as 来关联模型。 在单个关联（has one 和 belongs to），别名应该是单数，而对于许多关联（has many）它应该是复数。 Sequelize然后使用[inflection] 0库将别名转换为其单数形式。 但是，这可能并不总是适用于不规则或非英语单词。 在这种情况下，您可以提供复数和单数形式的别名：

User.belongsToMany(Project, {as: {singular: 'task', plural: 'tasks'}});
// Notice that inflection has no problem singularizing tasks, this is just for illustrative purposes.

// 如果你知道模型将始终在关联中使用相同的别名，则可以在创建模型时提供它

const Project = sequelize.define('project', attributes, {
  name: {
    singular: 'task',
    plural: 'tasks',
  }
});

User.belongsToMany(Project);

// 这将为用户实例添加 add/set/get Tasks 方法。

// 记住，使用 as 来更改关联的名称也会改变外键的名称。当使用 as 时，也可以指定外键是最安全的。

Invoice.belongsTo(Subscription);
Subscription.hasMany(Invoice);

// 不使用 as，这会按预期添加 subscriptionId。
// 但是，如果您要发送 Invoice.belongsTo(Subscription, { as: 'TheSubscription' })，那么您将同时拥有 subscriptionId 和 theSubscriptionId，因为 sequelize 不够聪明，无法确定调用是相同关系的两面。
// foreignKey 修正了這個問題：
Invoice.belongsTo(Subscription, {as: 'TheSubscription', foreignKey: 'subscription_id'});
Subscription.hasMany(Invoice, {foreignKey: 'subscription_id'});


// 關聯對象

// 因為 Sequelize 做了很多神奇的事，所以你必須在設置關聯後調用 Sequelize.sync。這樣做將允許您進行以下操作：

Project.hasMany(Task);
Task.belongsTo(Project);

Project.create() // ...
Task.create() // ...
Task.create() // ...

// 保存它們，然後：
project.setTasks([task1, task2]).then(() => {
  // 已保存
});

// 好的，现在它们已经保存了...我怎么才能得到他们？
project.getTasks().then(associatedTasks => {
  // associatedTasks 是一个 tasks 的数组
});

// 您还可以将过滤器传递给 getter 方法。
// 它们与你能传递给常规查找器方法的选项相同。
project.getTasks({where: 'id > 10'}).then(tasks => {
  // id 大于 10 的任务
});

project.getTasks({attributes: ['title']}).then(tasks => {
  // 使用屬性 "title" 和 "id" 檢索任務
});

// 要删除创建的关联，您可以调用 set 方法而不使用特定的 ID：

// 刪除與 task1 的關聯
project.setTasks([task2]).then(associatedTasks => {
  // 你將只得到 task2
});

// 删除全部
project.setTasks([]).then(associatedTask => {
  // 你将得到空数组
});

// 或更直接地删除
project.removeTask(task1).then(() => {
  // 什麼都沒有
});

// 然後再次添加它們
project.addTask(task1).then(function () {
  // 它们又回来了
});

// 反之亦然你当然也可以这样做：

task2.setProject(null).then(() => {
  // 什麼都沒有
});

// 对于 hasOne/belongsTo 与其基本相同:
Task.hasOne(User, {as: "Author"});
Task.setAuthor(anAuthor);

// 可以通过两种方式添加与自定义连接表的关系的关联（继续前一章中定义的关联）：

// 在创建关联之前，通过向对象添加具有连接表模型名称的属性
project.UserProjects = {
  status: 'active'
};
u.addProject(project);

// 或者在添加关联时提供第二个options.through参数，其中包含应该在连接表中的数据
u.addProject(project, {through: {status: 'active'}});

// 关联多个对象时，可以组合上述两个选项。 在这种情况下第二个参数如果没有提供使用的数据将被视为默认对象

project1.UserProjects = {
  status: 'inactive'
};

u.setProjects([project1, project2], {through: {status: 'active'}});
// 上述代码将对项目1记录无效，并且在连接表中对项目2进行 active

// 当获取具有自定义连接表的关联的数据时，连接表中的数据将作为 DAO 实例返回：
u.getProjects().then(projects => {
  const project = projects[0];

  if (project.UserProjects.status === 'active') {
    // ... 做點什麼

    // 由於这是一个真正的DAO实例，您可以在完成操作之后直接保存它
    return project.UserProjects.save()
  }
});

// 如果您仅需要连接表中的某些属性，则可以提供具有所需属性的陣列：

// 这将仅从 Projects 表中选择 name，仅从 UserProjects 表中选择status
user.getProjects({attributes: ['name'], joinTableAttributes: ['status']});


// 檢查關聯

// 你還可以檢查對象是否已經與另一對象相關聯 (僅 n:m)。

// // 检查对象是否是关联对象之一：
Project.create({/**/}).then(project => {
  return User.create({/**/}).then(user => {
    return project.hasUser(user).then(result => {
      // 結果是 false
      return project.addUser(user).then(() => {
        return project.hasUser(user).then(result => {
          // 結果是 true
        })
      })
    })
  })
})

// 检查所有关联的对象是否如预期的那样：
// 我们假设我们已经有一个项目和两个用户
project.setUsers([user1, user2]).then(() => {
  return project.hasUsers([user1]);
}).then(result => {
  // 結果是 true
  return project.hasUsers([user1, user2]);
}).then(result => {
  // 結果是 true
});


// 高級概念

// 作用域