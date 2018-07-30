// Scopes - 作用域

// 作用域允許你定義常用查詢，以便以後輕鬆使用。作用域可以包括與常規查找器 where, include, limit 等所有相同的屬性。

const Sequelize = require('sequelize');
const sequelize = require('./models');

const Op = Sequelize.Op;


// 定義

// 作用域在模型定义中定义，可以是 finder 对象或返回 finder 对象的函数，除了默认作用域，该作用域只能是一个对象：

const Project = sequelize.define('project', {
  // 屬性
}, {
  defaultScope: {
    where: {
      active: true
    }
  },
  scopes: {
    deleted: {
      where: {
        deleted: true
      }
    },
    activeUsers: {
      include: [
        {model: User, where: {active: true}}
      ]
    },
    random: function () {
      return {
        where: {
          someNumber: Math.random()
        }
      }
    },
    accessLevel: function (value) {
      return {
        where: {
          accessLevel: {
            [Op.gte]: value
          }
        }
      }
    }
  }
});

// 通过调用 addScope 定义模型后，还可以添加作用域。这对于具有“包含”的作用域特别有用，其中在定义其他模型时可能不会定义 include 中的模型。

// 始終應用默認作用域。這意味著，通过上面的模型定义，Project.findAll() 将创建以下查询：
// SELECT * FROM projects WHERE active = true

// 可透過調用 .unscoped(), scope(null) 或透過調用另一個作用域來刪除默認作用域

Project.scope('deleted').findAll(); // 删除默认作用域
// SELECT * FROM projects WHERE deleted = true

// 還可以在作用域定義中包括作用域模型。这让你避免重复 include、attributes 或 where 定义。

// 使用上面的例子，并在包含的用户模型中调用 active 作用域（而不是直接在该 include 对象中指定条件）
// activeUsers: {
//   include: [
//     { model: User.scope('active')}
//   ]
// }


// 使用

// 透过在模型定义上调用 .scope 来应用作用域，传递一个或多个作用域的名称。.scope 返回一個全功能的模型實例，它具有所有常規的方法：.findAll、.update、.count、.destroy 等等。你可以保存这个模型实例并稍后再次使用：

const DeletedProjects = Project.scope('deleted');

DeletedProjects.findAll();
// 過一段時間

// 让我们再次寻找被删除的项目！
DeletedProjects.findAll();

// 作用域适用于 .find、.findAll、.count、.update、.increment 和 .destroy.

// 可以通过两种方式调用作为函数的作用域。如果作用域没有任何参数，它可以正常调用。如果作用域采用参数，则传递一个对象：
Project.scope('random', {method: ['accessLevel', 19]}).findAll();
// SELECT * FROM projects WHERE someNumber = 42 AND accessLevel >= 19


// 合併

// 透过将作用域陣列传递到 .scope 或透过将作用域作为连续参数传递，可以同时应用多个作用域。

// 這兩個是等價的
Project.scope('deleted', 'activeUsers').findAll();
Project.scope(['deleted', 'activeUsers']).findAll();
/**
 SELECT * FROM projects
 INNER JOIN users ON projects.userId = users.id
 AND users.active = true
 */

// 如果要將其他作用域與默認作用域一起應用，請將鍵 defaultScope 傳遞給 .scope：
Project.scope('defaultScope', 'deleted').findAll();
// SELECT * FROM projects WHERE active = true AND deleted = true

// 当调用多个作用域时，后续作用域的键将覆盖以前的作用域（类似于 _.assign ）。考虑两个作用域：

/**
 {
   scope1: {
     where: {
       firstName: 'bob',
       age: {
         [Op.gt]: 20
       }
     },
     limit: 2
   },
   scope2: {
     where: {
       age: {
         [Op.gt]: 30
       }
     },
     limit: 10
   }
 }
 */

// 調用 .scope('scope1', 'scope2') 將產生以下查詢
// WHERE firstName = 'bob' AND age > 30 LIMIT 10

// 注意 scope2 覆盖 limit 和 age，而 firstName 被保留。
// limit、offset、order、paranoid、lock 和 raw 被覆盖，而 where 和 include 被浅层合并。这意味着相同的键在同一个模型的对象以及随后的包含都将相互覆盖。

// 当将查找对象直接传递到作用域模型上的 findAll 时，适用相同的合并逻辑：
Project.scope('deleted').findAll({
  where: {
    firstName: 'john'
  }
});
// WHERE deleted = true AND firstName = 'john'

// 这里的 deleted 作用域与 finder 合并。如果我們要將 where: {firstName: 'join', deleted: false} 傳遞給 finder，那么 deleted 作用域将被覆盖。


// 關聯

// Sequelize 與關聯有兩個不同但相關的作用域概念。差異是微妙但重要的：

// - 關聯作用域：允許您在获取和设置关联时指定默认属性 - 在实现多态关联时很有用。 当使用 get、set、add 和 create 相关联的模型函数时，这个作用域仅在两个模型之间的关联上被调用
// - 關聯模型上的作用域：允许您在获取关联时应用默认和其他作用域，并允许您在创建关联时传递作用域模型。这些作用域都适用于模型上的常规查找和透过关联查找。