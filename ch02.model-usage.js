// Model usage - 模型使用

var Sequelize = require('sequelize');
var sequelize = require('./models');

// 資料檢索/查找器

// Finder 旨在從資料庫查詢資料。它們不返回簡單的對象，而是返回模型實例。因為 finder 方法返回模型實例，你可以按照實例的文檔所述，為結果調用任何模型實例成員。
// 這裡將探討 finder 方法可以做什麼：


// find - 搜索資料庫中的一個特定元素

// 搜索已知的ids
Project.findById(123).then(project => {
  // project 将是 Project的一个实例，并具有在表中存为 id 123 条目的内容。
  // 如果没有定义这样的条目，你将获得null
});
// 搜索屬性
Project.findOne({where: {title: 'aProject'}}).then(project => {
  // project 将是 Projects 表中 title 为 'aProject'  的第一个条目 || null
});
Project.findOne({
  where: {title: 'aProject'},
  attributes: ['id', ['name', 'title']]
}).then(project => {
  // project 将是 Projects 表中 title 为 'aProject'  的第一个条目 || null
  // project.title 将包含 project 的 name
})


// findOrCreate - 搜索特定元素或創建它 (如果不可用)

User
  .findOrCreate({where: {username: 'sdepold'}, defaults: {job: 'Technical Lead JavaScript'}})
  .spread((user, created) => {
    console.log(user.get({
      plain: true
    }));
    console.log(created);
  });
// findOrCreate 返回一個包含已找到或創建的對象的陣列，找到創建的對象和一個布林值，像這樣：
/*
[ {
    username: 'sdepold',
    job: 'Technical Lead JavaScript',
    id: 1,
    createdAt: Fri Mar 22 2013 21: 28: 34 GMT + 0100(CET),
    updatedAt: Fri Mar 22 2013 21: 28: 34 GMT + 0100(CET)
  },
  true ]
 */
// 上面例子中，".spread" 將陣列分成兩部分，並將它們作為參數傳遞給回調函數 (user 是返回陣列索引 0 的對象，created 則是 true)
// 若再重新執行上述程式碼，created 將會返回 false


// findAndCountAll - 在資料庫中搜索多個元素，返回資料和總計數

// 這是一個方便的方法，它結合了 findAll 和 count (見下文)，當處理與分頁相關的查詢時，這是有用的，你想用 limit 和 offset 檢索資料，但也需要知道總數與查詢匹配的紀錄數：

// 處理程序成功將始終接收具有兩個屬性的對象：
// - count：一個整數，總數紀錄匹配 where 語句和關聯的其他過濾器
// - rows：一個陣列對象，記錄在 limit 和 offset 範圍內匹配 where 語句和關聯的其他過濾器

const Op = Sequelize.Op;

Project.findAndCountAll({
  where: {
    title: {
      [Op.like]: 'foo%'
    }
  },
  offset: 10,
  limit: 2
})
  .then(result => {
    console.log(result.count);
    console.log(result.rows);
  });

// 它支持 include。只有標記為 required 的 include 將被添加到計數部分：

// 假設你想查找附有個人資料的所有用戶：
User.findAndCountAll({
  include: [
    {model: Profile, required: true}
  ],
  limit: 3
});

// 因為 Profile 的 include 有 required 設置，這將導致內部連接 (INNER JOIN)，並且只有具有 Profile 的用戶將被計數。如果我們從 include 中刪除 required，那麼有和沒有 profile 的用戶都將被計數。在 include 中添加一個 where 語句會自動使它成為 required：
User.findAndCountAll({
  include: [
    {model: Profile, where: {active: true}}
  ],
  limit: 3
});
// 上面的查詢只會對具有 active profile 的用戶進行計數，因為在將 where 語句添加 include 時，required 被隱式設置為 true。

// 傳遞給 findAndCountAll 的 options 對象與 findAll 相同。


// findAll - 搜索資料庫中的多個元素

Project.findAll().then(project => {

});

Project.all().then(projects => {

});

Project.findAll({where: {name: 'A Project'}}).then(projects => {

});

Project.findAll({where: {id: [1, 2, 3]}}).then(projects => {

});

Project.findAll({
  where: {
    id: {
      [Op.and]: {a: 5},           // 且 (a = 5)
      [Op.or]: [{a: 5}, {a: 6}],  // (a = 5 或 a = 6)
      [Op.gt]: 6,
      [Op.gte]: 6,
      [Op.lt]: 10,
      [Op.lte]: 10,
      [Op.ne]: 20,
      [Op.between]: [6, 10],
      [Op.notBetween]: [11, 15],
      [Op.in]: [1, 2],
      [Op.notIn]: [1, 2],
      [Op.like]: '%hat',
      [Op.notLike]: '%hat',
      [Op.iLike]: '%hat',         // 包含 '%hat' 不區分大小寫 (PG)
      [Op.notILike]: '%hat',      // 不包含 '%hat' 不區分大小寫 (PG)
      [Op.overlap]: [1, 2],       // && [1, 2] (PG数组重叠运算符)
      [Op.contains]: [1, 2],      // @> [1, 2] (PG数组包含运算符)
      [Op.contained]: [1, 2],     // <@ [1, 2] (PG数组包含于运算符)
      [Op.any]: [2, 3],           // 任何数组[2, 3]::INTEGER (仅限 PG)
    },
    status: {
      [Op.not]: false             // status 不為 FALSE
    }
  }
});


// 複合過濾 / OR / NOT 查詢

// 你可使用多層嵌套的 AND，OR 和 NOT 條件進行一個複合的 where 查詢。為了做到這一點，你可以使用 or，and 或 not 運算符：

Project.findOne({
  where: {
    name: 'a project',
    [Op.or]: [
      {id: [1, 2, 3]},
      {id: {[Op.gt]: 10}}
    ]
  }
});
Project.findOne({
  where: {
    name: 'a project',
    id: {
      [Op.or]: [
        [1, 2, 3],
        {[Op.gt]: 10}
      ]
    }
  }
});
// SELECT *
// FROM `Projects`
// WHERE (
//   `Projects`.`name` = 'a project'
//    AND (`Projects`.`id` IN (1,2,3) OR `Projects`.`id` > 10)
// )
// LIMIT 1;

// not 示例：
Project.findOne({
  where: {
    name: 'a project',
    [Op.not]: [
      {id: [1, 2, 3]},
      {array: {[Op.contains]: [3, 4, 5]}}
    ]
  }
});
// SELECT *
// FROM `Projects`
// WHERE (
//   `Projects`.`name` = 'a project'
//    AND NOT (`Projects`.`id` IN (1,2,3) OR `Projects`.`array` @> ARRAY[3,4,5]::INTEGER[])
// )
// LIMIT 1;


// 用限制，偏移，順序和分組操作資料集

Project.findAll({limit: 10});
Project.findAll({offset: 10});
Project.findAll({offset: 10, limit: 2});

Project.findAll({order: 'title DESC'});
Project.findAll({group: 'name'});

something.findOne({
  order: [
    ['name'],
    ['username', 'DESC'],
    sequelize.fn('max', sequelize.col('age')),
    [sequelize.fn('max', sequelize.col('age')), 'DESC'],
    [sequelize.fn('otherfunction', sequelize.col('col1'), 12, 'lalala'), 'DESC']
  ]
});

// order / group 陣列的元素可以是以下內容：
// - String - 將被引用
// - Array - 第一個元素將被引用，第二個將被逐字地追加
// - Object -
//   - raw 將被添加逐字引用
//   - 如果未設置 raw，一切都被忽略，查詢將失敗
// - Sequelize.fn 和 Sequelize.col 返回函數和引用的行名


// 原始查詢

// 對你選擇的每一列，Sequelize 創建一個具有更新，刪除和獲取關聯等功能的實例。如果你有數千行，則可能需要一些時間。如果你只需要原始資料：

Project.findAll({where: {...}, raw: true});


// count - 計算資料庫中元素的出現次數
Project.count().then(c => {
  console.log('There are ' + c + ' projects!');
});
Project.count({where: {'id': {[Op.gt]: 25}}}).then(c => {
  console.log("There are " + c + " projects with an id greater than 25.")
});


// max - 獲取特定表中特定屬性的最大值

Project.max('age').then(max => {

});

Project.max('age', {where: {age: {[Op.lt]: 20}}}).then(max => {

});


// min - 獲取特定表中特定屬性的最小值

Project.min('age').then(min => {

});

Project.min('age', {where: {age: {[Op.gt]: 5}}}).then(min => {

});

// sum - 特定屬性的值求和

Project.sum('age').then(sum => {

});

Project.sum('age', {where: {age: {[Op.gt]: 5}}}).then(sum => {

});


// 預加載

// 當你從資料庫檢索資料時，也想同時取得與之相關聯的查詢，這被稱為預加載。這個基本思路就是當你調用 find 或 findAll 時使用 include 屬性：

const User = sequelize.define('user', {name: Sequelize.STRING})
const Task = sequelize.define('task', {name: Sequelize.STRING})
const Tool = sequelize.define('tool', {name: Sequelize.STRING})

Task.belongsTo(User);
User.hasMany(Task);
User.hasMany(Tool, {as: 'Instruments'});

sequelize.sync().then(() => {

  Task.findAll({include: [User]}).then(tasks => {
    console.log(JSON.stringify(tasks));

    /*
      [{
        "name": "A Task",
        "id": 1,
        "createdAt": "2013-03-20T20:31:40.000Z",
        "updatedAt": "2013-03-20T20:31:40.000Z",
        "userId": 1,
        "user": {
          "name": "John Doe",
          "id": 1,
          "createdAt": "2013-03-20T20:31:45.000Z",
          "updatedAt": "2013-03-20T20:31:45.000Z"
        }
      }]
    */
  });

  User.findAll({include: [Task]}).then(users => {
    console.log(JSON.stringify(users));

    /*
      [{
        "name": "John Doe",
        "id": 1,
        "createdAt": "2013-03-20T20:31:45.000Z",
        "updatedAt": "2013-03-20T20:31:45.000Z",
        "tasks": [{
          "name": "A Task",
          "id": 1,
          "createdAt": "2013-03-20T20:31:40.000Z",
          "updatedAt": "2013-03-20T20:31:40.000Z",
          "userId": 1
        }]
      }]
    */
  });

  // 如果關聯是別名的 (使用 as 參數)，則在包含模型時必須指定此別名。注意用戶的 Tool 如何被別名為 Instruments
  User.findAll({include: [{model: Tool, as: 'Instruments'}]}).then(users => {
    console.log(JSON.stringify(users));

    /*
      [{
        "name": "John Doe",
        "id": 1,
        "createdAt": "2013-03-20T20:31:45.000Z",
        "updatedAt": "2013-03-20T20:31:45.000Z",
        "Instruments": [{
          "name": "Toothpick",
          "id": 1,
          "createdAt": null,
          "updatedAt": null,
          "userId": 1
        }]
      }]
    */
  });

  // 你還可透過指定與關聯別名匹配的字符串來包括別名：
  User.findAll({include: ['Instruments']}).then(users => {
    console.log(JSON.stringify(users));

    /*
      [{
        "name": "John Doe",
        "id": 1,
        "createdAt": "2013-03-20T20:31:45.000Z",
        "updatedAt": "2013-03-20T20:31:45.000Z",
        "Instruments": [{
          "name": "Toothpick",
          "id": 1,
          "createdAt": null,
          "updatedAt": null,
          "userId": 1
        }]
      }]
    */
  });

  User.findAll({include: [{association: 'Instruments'}]}).then(users => {
    console.log(JSON.stringify(users));

    /*
      [{
        "name": "John Doe",
        "id": 1,
        "createdAt": "2013-03-20T20:31:45.000Z",
        "updatedAt": "2013-03-20T20:31:45.000Z",
        "Instruments": [{
          "name": "Toothpick",
          "id": 1,
          "createdAt": null,
          "updatedAt": null,
          "userId": 1
        }]
      }]
    */
  });

  // 當預加載時，也可使用 where 過濾關聯的模型。這將返回 Tool 模型中所有與 where 語句匹配的列的 User。
  User.findAll({
    include: [{
      model: Tool,
      as: 'Instruments',
      where: {name: {[Op.like]: '%ooth%'}}
    }]
  }).then(users => {
    console.log(JSON.stringify(users));

    /*
      [{
        "name": "John Doe",
        "id": 1,
        "createdAt": "2013-03-20T20:31:45.000Z",
        "updatedAt": "2013-03-20T20:31:45.000Z",
        "Instruments": [{
          "name": "Toothpick",
          "id": 1,
          "createdAt": null,
          "updatedAt": null,
          "userId": 1
        }]
      }],

      [{
        "name": "John Smith",
        "id": 2,
        "createdAt": "2013-03-20T20:31:45.000Z",
        "updatedAt": "2013-03-20T20:31:45.000Z",
        "Instruments": [{
          "name": "Toothpick",
          "id": 1,
          "createdAt": null,
          "updatedAt": null,
          "userId": 1
        }]
      }],
    */
  });

  // 使用 include.where 過濾一個預加載的模型時，include.required 被隱式設置為 true。這意味內部連接完成返回具有任何匹配子項的父模型。


  // 使用預加載模型的頂層 WHERE
  // 將模型的 WHERE 條件從 ON 條件的 include 模式移動到頂層，你可以使用 '$nested.column$' 語法：
  User.findAll({
    where: {
      '$Instruments.name$': {[Op.iLike]: '%ooth%'}
    },
    include: [{
      model: Tool,
      as: 'Instruments'
    }]
  }).then(users => {
    console.log(JSON.stringify(users));

    /*
      [{
        "name": "John Doe",
        "id": 1,
        "createdAt": "2013-03-20T20:31:45.000Z",
        "updatedAt": "2013-03-20T20:31:45.000Z",
        "Instruments": [{
          "name": "Toothpick",
          "id": 1,
          "createdAt": null,
          "updatedAt": null,
          "userId": 1
        }]
      }],

      [{
        "name": "John Smith",
        "id": 2,
        "createdAt": "2013-03-20T20:31:45.000Z",
        "updatedAt": "2013-03-20T20:31:45.000Z",
        "Instruments": [{
          "name": "Toothpick",
          "id": 1,
          "createdAt": null,
          "updatedAt": null,
          "userId": 1
        }]
      }],
    */
  })


  // 包括所有
  User.findAll({include: [{all: true}]});


  // 包括軟刪除的紀錄
  User.findAll({
    include: [{
      model: Tool,
      where: {name: {[Op.like]: '%ooth%'}},
      paranoid: false // query and loads the soft deleted records
    }]
  });


  // 排序預加載關係

  // 在一對多關係的情況下
  Company.findAll({include: [Division], order: [[Division, 'name']]});
  Company.findAll({include: [Division], order: [[Division, 'name', 'DESC']]});
  Company.findAll({
    include: [{model: Division, as: 'Div'}],
    order: [[{model: Division, as: 'Div'}, 'name']]
  });
  Company.findAll({
    include: [{model: Division, as: 'Div'}],
    order: [[{model: Division, as: 'Div'}, 'name', 'DESC']]
  });
  Company.findAll({
    include: [{model: Division, include: [Department]}],
    order: [[Division, Department, 'name']]
  }); // 在多對多關係的情況下，你還可以透過表中的屬性進行排序


  // 嵌套預加載
  User.findAll({
    include: [
      {
        model: Tool,
        as: 'Instruments',
        include: [
          {
            model: Teacher,
            include: [/* etc */]
          }
        ]
      }
    ]
  }).then(users => {
    console.log(JSON.stringify(users));

    /*
      [{
        "name": "John Doe",
        "id": 1,
        "createdAt": "2013-03-20T20:31:45.000Z",
        "updatedAt": "2013-03-20T20:31:45.000Z",
        "Instruments": [{ // 1:M and N:M association
          "name": "Toothpick",
          "id": 1,
          "createdAt": null,
          "updatedAt": null,
          "userId": 1,
          "Teacher": { // 1:1 association
            "name": "Jimi Hendrix"
          }
        }]
      }]
    */
  });
  // 這將產生一個外連接。但是，相關模型上的 where 語句將創建一個內部連接，並僅返回具有匹配子模型的實例。
  // 要返回所有父實例，你應該添加 require: false
  User.findAll({
    include: [{
      model: Tool,
      as: 'Instruments',
      include: [{
        model: Teacher,
        where: {
          school: "Woodstock Music School"
        },
        required: false
      }]
    }]
  }).then(users => {

  });
  // 以上查詢將返回所有用戶及其所有樂器，但只會返回與 Woodstock Music School 相關的老師

  // 包括所有也支持嵌套加載
  User.findAll({include: [{all: true, nested: true}]});
});