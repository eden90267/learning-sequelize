var Sequelize = require('sequelize');
var sequelize = require('./models');

// var User = require('./models/user');
var Employee = require('./models/employee');
var Foo = require('./models/foo');
var Project = sequelize.import(__dirname + '/models/project');

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

Project.sync({force: true}).then(() => {
  Project.create({
    name: '107/07/11 颱風假',
    title: '台中明天正常上班上課',
    description: '龍龍 22：00 再給你一次機會，你自己好好想想'
  });
  Project.findById(1).then(project => {

  });
  Project.findOne({
    where: {name: '台中明天正常上班上課'},ㄥ
    attributes: ['id', ['name', 'description']]
}).then(project => {
    console.log(project);
  });
  Project.findOrCreate({where: {title: '新北市停班停課'}, defaults: {name: '107/07/11 颱風假', description: '反而台北市不停班停課，也太奇怪了！'}})
    .spread((project, created) => {
      console.log(project.get({
        plain: true
      })); // project object
      console.log(created); // 第一次執行 true, 之後執行已有一個實例的話就為 false
    });
  Project.findAndCountAll({
    where: {
      name: {
        [Sequelize.Op.like]: '%正常上班上課'
      }
    },
    // include: [
    //   {model: Profile, required: true}
    // ],
    offset: 10,
    limit: 2
  })
    .then(result => {
      console.log(result.count);
      console.log(result.rows);
    });
  Project.findAll().then(projects => {

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
        // [Sequelize.Op.and]: {a: 5},
        [Sequelize.Op.between]: [6, 10],
        [Sequelize.Op.like]: '%hat',
      },
      // status: {
      //   [Sequelize.Op.not]: false
      // }
    }
  });
  Project.findOne({
    where: {
      name: 'a project',
      [Sequelize.Op.or]: [
        {id: [1, 2, 3]},
        {id: {[Sequelize.Op.gt]: 10}}
      ]
    }
  });
  Project.findOne({
    where: {
      name: 'a project',
      id: {
        [Sequelize.Op.or]: [
          [1, 2, 3],
          {[Sequelize.Op.gt]: 10}
        ]
      }
    }
  })
  // 前面兩段生成以下內容：
  // SELECT *
  // FROM `Projects`
  // WHERE (
  //   `Projects`.`name` = 'a project'
  //    AND (`Projects`.`id` IN (1,2,3) OR `Projects`.`id` > 10)
  // )
  // LIMIT 1;

  // Project.findOne({
  //   where: {
  //     name: 'a project',
  //     [Sequelize.Op.not]: [
  //       {id: [1, 2, 3]},
  //       {array: {[Sequelize.Op.contains]: [3, 4, 5]}}
  //     ]
  //   }
  // })
  // 將生成：
  // SELECT *
  // FROM `Projects`
  // WHERE (
  //   `Projects`.`name` = 'a project'
  //    AND NOT (`Projects`.`id` IN (1,2,3) OR `Projects`.`array` @> ARRAY[3,4,5]::INTEGER[])
  // )
  // LIMIT 1;

  Project.findAll({limit: 10});
  Project.findAll({offset: 10}); // 跳過前 10 個元素

  Project.findAll({offset: 10, limit: 2}) // 跳過前 10 個元素，並獲取 2 個

  // Project.findAll({order: 'title DESC'}); // Error: Order must be type of array or instance of a valid sequelize method.
  Project.findAll({group: 'name'});

  // 要轉譯列名，要提供一個參數數組：
  Project.findOne({
    order: [
      ['title'],
      ['name', 'DESC']
    ]
  });
  // Sequelize 創建一個具有更新、刪除和獲取關聯等功能的實例。如果你有數千行，則可能需要一些時間。如果只要原始數據，並且不想更新任何內容：
  // 期望從數據庫的一個巨大數據集，
  // 並且不想花時間為每個條目構建 DAO？
  // 你可傳遞一個額外的查詢參數來取代原始數據
  Project.findAll({where: {/*...*/}, raw: true});

  Project.count().then(c => {
    console.log('There are ' + c + ' projects!');
  });
  Project.count({where: {'id': {[Sequelize.Op.gt]: 25}}}).then(c => {
    console.log('There are ' + c + ' projects with an id greater than 25.')
  });

  // Project.max('age').then(max => {
  //
  // });
  // Project.max('age', {where: {age: {[Sequelize.Op.lt]: 20}}}).then(max => {
  //
  // })

  // Project.min('age').then(min => {
  //
  // });
  // Project.min('age', {where: {age: {[Sequelize.Op.gt]: 5}}}).then(min => {
  //
  // });

  // Project.sum('age').then(sum => {
  //
  // });
  // Project.sum('age', {where: {age: {[Sequelize.Op.gt]: 5}}}).then(sum => {
  //
  // });
});

// 預加載
// 當你從資料庫檢索數據時，也想同時獲得與之相關聯的查詢，這被稱為預加載。這個基本思路就是當你調用 find 或 findAll 時使用 include 屬性。讓我們假設以下設置：
const User = sequelize.define('user', {name: Sequelize.STRING});
const Task = sequelize.define('task', {name: Sequelize.STRING});
const Tool = sequelize.define('tool', {name: Sequelize.STRING});

Task.belongsTo(User);
User.hasMany(Task);
User.hasMany(Tool, {as: 'Instruments'}); // Tool 被別名 Instruments

sequelize.sync().then(() => {
  // 訪問者是單數形式，因為關聯是一對一的
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

  // 訪問者是複數形式，因為關聯是多對一的
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

  // 當預加載時，我們也可以使用 where 過濾關聯的模型。這將返回 Tool 模型中所有與 where 語句匹配的行的 User。
  User.findAll({
    include: [{
      model: Tool,
      as: 'Instruments',
      where: {name: {[Sequelize.Op.like]: '%ooth%'}}
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

  // 使用預加載模型的頂層 WHERE
  // 將模型的 WHERE 條件從 ON 條件的 include 模式移動到頂層，你可以使用 '$nested.column$' 語法：
  User.findAll({
    where: {
      '$Instruments.name$': {[Sequelize.Op.like]: '%ooth%'},
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
  });

  // 包含所有
  // 要包含所有屬性，你可以使用 all:true 傳遞單個對象
  User.findAll({include: [{all: true}]});

  // 包含軟刪除的紀錄
  // 如果想要加載軟刪除的紀錄，可透過將 include.paranoid 設置為 false 來實現
  User.findAll({
    include: [{
      model: Tool,
      as: 'Instruments',
      where: {name: {[Sequelize.Op.like]: '%ooth%'}},
      paranoid: false
    }]
  });

  // 排序預加載關聯
  // Company.findAll({include: [Division], order: [[Division, 'name']]});
  // Company.findAll({include: [Division], order: [[Division, 'name', 'DESC']]});
  // Company.findAll({
  //   include: [{model: Division, as: 'Div'}],
  //   order: [[{model: Division, as: 'Div'}, 'name']]
  // });
  // Company.findAll({
  //   include: [{model: Division, as: 'Div'}],
  //   order: [[{model: Division, as: 'Div'}, 'name', 'DESC']]
  // });
  // Company.findAll({
  //   include: [{model: Division, include: [Department]}],
  //   order: [[Division, Department, 'name']]
  // });
  // // 多對多關係的情況下，你還可透過表中的屬性進行排序
  // Company.findAll({
  //   include: [{model: Division, include: [Department]}],
  //   order: [[Division, DepartmentDivision, 'name']]
  // });

  // 嵌套預加載
  // 你可以使用嵌套的預加載來加載相關模型的所有相關模型：
  // User.findAll({
  //   include: [
  //     {
  //       model: Tool, as: 'Instruments', include: [
  //         {model: Teacher, include: [/* etc */]}
  //       ]
  //     }
  //   ]
  // }).then(users => {
  //   console.log(JSON.stringify(users));
  //
  //   /*
  //     [{
  //       "name": "John Doe",
  //       "id": 1,
  //       "createdAt": "2013-03-20T20:31:45.000Z",
  //       "updatedAt": "2013-03-20T20:31:45.000Z",
  //       "Instruments": [{ // 1:M and N:M association
  //         "name": "Toothpick",
  //         "id": 1,
  //         "createdAt": null,
  //         "updatedAt": null,
  //         "userId": 1,
  //         "Teacher": { // 1:1 association
  //           "name": "Jimi Hendrix"
  //         }
  //       }]
  //     }]
  //   */
  // });
  // 這將產生一個外連接。但是，相關模型上的 where 語句將創建一個內部連接，並僅返回具有匹配子模型的實例。要返回所有父實例，你應該添加 required: false
  // User.findAll({
  //   include: [
  //     {
  //       model: Tool,
  //       as: 'Instruments',
  //       include: [{
  //         model: Teacher,
  //         where: {
  //           school: 'Woodstock Music School'
  //         },
  //         required: false
  //       }]
  //     }
  //   ]
  // }).then(users => {
  //   console.log(JSON.stringify(users));
  // });
  // 以上查詢將返回所有用戶及所有樂器，但只會返回與 Woodstock Music School 相關的老師

  // 包括所有也支持嵌套加載
  User.findAll({include: [{all: true, nested: true}]});
});

const Model = sequelize.define('model', {
  foo: Sequelize.STRING,
  bar: Sequelize.STRING,
  baz: Sequelize.STRING,
  quz: Sequelize.STRING,
  hats: Sequelize.STRING
});

Model.sync().then(() => {
  // 只選擇某個屬性
  Model.findAll({
    attributes: ['foo', 'bar']
  });
  // 屬性可用嵌套數組來重命名
  Model.findAll({
    attributes: ['foo', ['bar', 'baz']]
  });
  // 可用 sequelize.fn 來進行聚合
  Model.findAll({
    attributes: [
      [sequelize.fn('COUNT', sequelize.col('hats')), 'no_hats']
    ]
  }); // SELECT COUNT(hats) AS no_hats ...
  // 使用聚合功能，必須給他一個別名，以便能夠從模型中訪問：instance.get('no_hats')

  // 有時，如果你只想添加聚合，則列出模型的所有屬性可能令人厭煩
  Model.findAll({
    attributes: ['id', 'foo', 'bar', 'baz', 'quz', [sequelize.fn('COUNT', sequelize.col('hats')), 'no_hats']]
  });
  Model.findAll({
    attributes: {include: [[sequelize.fn('COUNT', sequelize.col('hats')), 'no_hats']]}
  });
  // 同樣，他也可以排除一些指定的表字段
  Model.findAll({
    attributes: {exclude: ['baz']}
  });
});

// Where
// findAll/find/updates/destroys 進行查詢，都可傳遞 where 對象來過濾查詢
// where 通常用 attribute:value 鍵值對獲取一個對象，其中 value 可以是匹配等式的數據或其他運算符的鍵值對象
// 也可以透過嵌套 or 和 and 運算符的集合來生成複雜的 AND/OR 條件

// 基礎
const Op = Sequelize.Op;

const Post = sequelize.define('post', {authorId: Sequelize.INTEGER, status: Sequelize.ENUM('active', 'inactive')});
Post.sync().then(async () => {
  const result = await Post.findAll({where: {authorId: 2}});
  console.log('post result: ', result);
  Post.findAll({
    where: {
      authorId: 12,
      status: 'active'
    }
  });
  Post.findAll({
    where: {
      [Op.or]: [{authorId: 12}, {authorId: 13}]
    }
  });
  Post.findAll({
    where: {
      authorId: {
        [Op.or]: [12, 13]
      }
    }
  });
  Post.destroy({
    where: {
      status: 'inactive'
    }
  });
  Post.update({
    updatedAt: null,
  }, {
    where: {
      deletedAt: {
        [Op.ne]: null
      }
    }
  });
  Post.findAll({
    where: sequelize.where(sequelize.fn('char_length', sequelize.col('status')), 6)
  }); // SELECT * FROM post WHERE char_length(status) = 6

  // 操作符
  // Sequelize 可用於創建更複雜比較的符號運算符：
  // [Op.and]: {a: 5}           // 且 (a = 5)
  // [Op.or]: [{a: 5}, {a: 6}]  // (a = 5 或 a = 6)
  // [Op.gt]: 6,                // id > 6
  // [Op.gte]: 6,               // id >= 6
  // [Op.lt]: 10,               // id < 10
  // [Op.lte]: 10,              // id <= 10
  // [Op.ne]: 20,               // id != 20
  // [Op.eq]: 3,                // = 3
  // [Op.not]: true,            // 不是 TRUE
  // [Op.between]: [6, 10],     // 在 6 和 10 之间
  // [Op.notBetween]: [11, 15], // 不在 11 和 15 之间
  // [Op.in]: [1, 2],           // 在 [1, 2] 之中
  // [Op.notIn]: [1, 2],        // 不在 [1, 2] 之中
  // [Op.like]: '%hat',         // 包含 '%hat'
  // [Op.notLike]: '%hat'       // 不包含 '%hat'
  // [Op.iLike]: '%hat'         // 包含 '%hat' (不区分大小写)  (仅限 PG)
  // [Op.notILike]: '%hat'      // 不包含 '%hat'  (仅限 PG)
  // [Op.regexp]: '^[h|a|t]'    // 匹配正则表达式/~ '^[h|a|t]' (仅限 MySQL/PG)
  // [Op.notRegexp]: '^[h|a|t]' // 不匹配正则表达式/!~ '^[h|a|t]' (仅限 MySQL/PG)
  // [Op.iRegexp]: '^[h|a|t]'    // ~* '^[h|a|t]' (仅限 PG)
  // [Op.notIRegexp]: '^[h|a|t]' // !~* '^[h|a|t]' (仅限 PG)
  // [Op.like]: { [Op.any]: ['cat', 'hat']} // 包含任何数组['cat', 'hat'] - 同样适用于 iLike 和 notLike
  // [Op.overlap]: [1, 2]       // && [1, 2] (PG数组重叠运算符)
  // [Op.contains]: [1, 2]      // @> [1, 2] (PG数组包含运算符)
  // [Op.contained]: [1, 2]     // <@ [1, 2] (PG数组包含于运算符)
  // [Op.any]: [2,3]            // 任何数组[2, 3]::INTEGER (仅限PG)
  //
  // [Op.col]: 'user.organization_id' // = 'user'.'organization_id', 使用数据库语言特定的列标识符, 本例使用 PG

  // 範圍選項 (PG)
  // [Op.contains]: 2           // @> '2'::integer (PG range contains element operator)
  // [Op.contains]: [1, 2]      // @> [1, 2) (PG range contains range operator)
  // [Op.contained]: [1, 2]     // <@ [1, 2) (PG range is contained by operator)
  // [Op.overlap]: [1, 2]       // && [1, 2) (PG range overlap (have points in common) operator)
  // [Op.adjacent]: [1, 2]      // -|- [1, 2) (PG range is adjacent to operator)
  // [Op.strictLeft]: [1, 2]    // << [1, 2) (PG range strictly left of operator)
  // [Op.strictRight]: [1, 2]   // >> [1, 2) (PG range strictly right of operator)
  // [Op.noExtendRight]: [1, 2] // &< [1, 2) (PG range does not extend to the right of operator)
  // [Op.noExtendLeft]: [1, 2]  // &> [1, 2) (PG range does not extend to the left of operator)

  // 組合
  // Post.findAll({
  //   where: {
  //     rank: {
  //       [Op.or]: {
  //         [Op.lt]: 1000,
  //         [Op.eq]: null
  //       }
  //     }, // rank < 1000 OR rank IS NULL
  //     createAt: {
  //       [Op.lt]: new Date(),
  //       [Op.gt]: new Date(new Date() - 24 * 60 * 60 * 1000)
  //     }, // createdAt < [timestamp] AND createdAt > [timestamp]
  //     [Op.or]: [
  //       {
  //         title: {
  //           [Op.like]: 'Boat%'
  //         }
  //       },
  //       {
  //         description: {
  //           [Op.like]: '%boat%'
  //         }
  //       }
  //     ] // title LIKE 'Boat%' OR description LIKE '%boat%'
  //   }
  // });

});

// 運算符別名 (v5 顯示棄用)
// const operatorAliases = {
//   $gt: Op.gt
// };
// const connection = new Sequelize(db, user, pass, {operatorsAliases})

// [Op.gt]: 6
// $gt: 6

// 運算符安全性
// 默認情況下，Sequelize 將使用符號運算符。使用沒有別名的 Sequelize 可以提高安全性。沒有任何字符串別名將使得運算符可能被注入的可能性降到極低，但你應該始終正確驗證和清理用戶輸入。
// 有些框架會自動將用戶輸入解析為 js 對象，如果你不能清理輸入內容，則可能會將具有字符串運算符的 Object 注入 Sequelize。

// 為了更好安全性，強烈建議在代碼使用像 Op.and / Op.or 的符號運算符，而不是依賴任何字符串別名，如 $and/ $or 這種。你可透過設置 operatorsAliases 選項來限制應用程序需要的別名，請記住要清理用戶輸入，特別是當你直接將它們傳遞給 Sequelize 方法時。
// const connection = new Sequelize(db, user, pass, {operatorsAliases: false})
// const connection2 = new Sequelize(db, user, pass, {operatorsAliases: {$and: Op.and}});

// 如果你使用默認別名並且不限制它們，Sequelize 會發出警告，俗果你想繼續使用所有默認別名 (不包括舊版別名) 而不發出警告，你可傳遞以下運算符參數：
// const operatorsAliases = {
//   $eq: Op.eq,
//   $ne: Op.ne,
//   $gte: Op.gte,
//   $gt: Op.gt,
//   $lte: Op.lte,
//   $lt: Op.lt,
//   $not: Op.not,
//   $in: Op.in,
//   $notIn: Op.notIn,
//   $is: Op.is,
//   $like: Op.like,
//   $notLike: Op.notLike,
//   $iLike: Op.iLike,
//   $notILike: Op.notILike,
//   $regexp: Op.regexp,
//   $notRegexp: Op.notRegexp,
//   $iRegexp: Op.iRegexp,
//   $notIRegexp: Op.notIRegexp,
//   $between: Op.between,
//   $notBetween: Op.notBetween,
//   $overlap: Op.overlap,
//   $contains: Op.contains,
//   $contained: Op.contained,
//   $adjacent: Op.adjacent,
//   $strictLeft: Op.strictLeft,
//   $strictRight: Op.strictRight,
//   $noExtendRight: Op.noExtendRight,
//   $noExtendLeft: Op.noExtendLeft,
//   $and: Op.and,
//   $or: Op.or,
//   $any: Op.any,
//   $all: Op.all,
//   $values: Op.values,
//   $col: Op.col
// };
//
// const connection = new Sequelize(db, user, pass, { operatorsAliases });


// JSON
// JSON 數據類型僅由 PostgreSQL、SQLite 和 MySQL 語言支持

// PostgreSQL
// PostgreSQL 中的 JSON 數據類型將值存儲為純文本，而不是二進制表示。如果你只是想存儲和檢索 JSON 格式數據，那麼使用 JSON 將佔用更少的磁盤空間，並且從其輸入數據中構建時間更少。但是，如果您想對 JSON 值執行任何操作，則應該使用下面描述的 JSONB 數據類型。

// MSSQL
// MSSQL 沒有 JSON 數據類型，但是它確實提供了對於自 SQL Server 2016 以來透過某些函數存儲為字符串的 JSON 的支持。使用這些函數，你將能夠查詢存儲在字符串中的 JSON，但是任何返回的值將需要分別進行解析。
// ISJSON - 测试一个字符串是否包含有效的 JSON
// User.findAll({
//   where: sequelize.where(sequelize.fn('ISJSON', sequelize.col('userDetails')), 1)
// });
// // JSON_VALUE - 从 JSON 字符串提取标量值
// User.findAll({
//   attributes: [[sequelize.fn('JSON_VALUE', sequelize.col('userDetails'), '$.address.Line1'), 'address line 1']]
// });
// // JSON_VALUE - 从 JSON 字符串中查询标量值
// User.findAll({
//   where: sequelize.where(sequelize.fn('JSON_VALUE', sequelize.col('userDetails'), '$.address.Line1'), '14, Foo Street')
// });
// // JSON_QUERY - 提取一个对象或数组
// User.findAll({
//   attributes: [[ sequelize.fn('JSON_QUERY', sequelize.col('userDetails'), '$.address'), 'full address']]
// })

// JSONB
// JSONB 可以以三種不同的方式進行查詢

// 嵌套對象
// {
//   meta: {
//     video: {
//       url: {
//         [Op.ne]: null
//       }
//     }
//   }
// }

// 嵌套鍵
// {
//   "meta.audio.length": {
//     [Op.gt]: 20
//   }
// }

// 外包裏
// {
//   "meta": {
//     [Op.contains]: {
//       site: {
//         url: 'http://google.com'
//       }
//     }
//   }
// }

Project.sync().then(() => {
  // 關係 / 關聯
  // 找到所有具有至少一个 task 的  project，其中 task.state === project.state
  Project.findAll({
    include: [{
      model: Task,
      where: {state: Sequelize.col('project.state')}
    }]
  });

  // 分頁 / 限制
  Project.findAll({limit: 10, offset: 10});

  // 排序
  // order 需要一個條目的數組來排序查詢或者一個 sequelize 方法。一般來說，你將要使用任一屬性的 tuple/array，並確定排序的正反方向
  // Project.findAll({
  //   order: [
  //     [title, 'DESC'],
  //     sequelize.fn('max', sequelize.col('age')),
  //     [Task, 'createdAt', 'DESC'],
  //     [Project.associations.Task, 'createdAt', 'DESC'],
  //     [{model: Task, as: 'Task'}, 'createdAt', 'DESC']
  //     // ...
  //   ]
  // });
  Project.findAll({
    order: sequelize.literal('max(age) DESC')
  })
  Project.findAll({
    order: sequelize.fn('max', sequelize.col('age'))
  })
  Project.findAll({
    order: sequelize.col('age')
  })
  Project.findAll({
    order: sequelize.random()
  })

  // Table Hint
  // 當使用 MSSQL 時，可以使用 tableHint 來選擇傳遞一個表提示。該提示必須是來自 Sequelize.TableHints 的值，只能在絕對必要時使用。每個查詢當前僅支持單個表提示

  // 表提示透過指定某些選項來覆蓋 MSSQL 查詢優化器的默認行為。它們只影響該子句引用的表或視圖

  const TableHints = Sequelize.TableHints;

  Project.findAll({
    tableHint: TableHints.NOLOCK // 這將生成 SQL 'WITH (NOLOCK)'
  })


  // 實例

  // 構建非持久性實例
  // 使用 build - 該方法將返回一個未保存的對象，你要明確地保存它
  const project = Project.build({
    title: 'my awesome project',
    description: 'woot woot. this will make me a rich man'
  });
  const Task = Task.build({
    title: 'specify the project idea',
    description: 'bla',
    deadline: new Date()
  })


});

// 內置實例在定義時會自動獲取默認值
// const Task = sequelize.define('task', {
//   title: Sequelize.STRING,
//   rating: {type: Sequelize.TINYINT, defaultValue: 3}
// })
// Task.sync().then(() => {
//   const task = Task.build({title: 'very important task'});
//
//   task.title
//   task.rating // 3
// })

Project.sync().then(() => {
  // 要將其儲存在數據庫，請使用 save 方法並捕捉事件 (如果需要)：
  const project = Project.build({
    title: 'my awesome project',
    description: 'woot woot. this will make me a rich man'
  });
  project.save().then(() => {

  });
  // 也可使用鏈式：
  Project
    .build({
      title: 'my awesome project',
      description: 'woot woot. this will make me a rich man'
    })
    .save()
    .then(anotherProject => {

    })
    .catch(error => {

    });

  // 創建持久性實例
  // .build() 要顯式的 .save() 調用來儲存到 database 中，但 .create() 完全省略了這個要求，一旦調用就自動存儲實例的數據：
  Project.create({
    title: 'my awesome project',
    description: 'woot woot. this will make me a rich man'
  }).then(project => {
    // 變量可訪問新創建的 project
  });


});

User.sync().then(() => {
  // 也可用 create 方法定義哪些屬性可以設置。如果你創建基於可由用戶填寫的表單的資料庫條目，這將非常方便。例如，使用這種方式，你可以限制 User 模型，僅設置 username 和 address，而不是 admin 標誌：
  User.create({username: 'barfooz', isAdmin: true}, {fields: ['username']}).then(user => {
    console.log(user.get({plain: true})); // {username: 'barfooz', isAdmin: false} // isAdmin 默認值是 false
  });
});

Task.sync().then(() => {
  // 更新 / 保存 / 持久化一個實例
  // 方法 1
  task.title = 'a very different title now';
  task.save().then(() => {
  });
  // 方法 2
  task
    .update({
      title: 'a very different'
    })
    .then(() => {
    });
  task.title = 'foooo';
  task.description = 'baaaaaar';
  task.save({fields: ['title']}).then(() => {

  });

  Task.create({title: 'a task'}).then(task => {
    return task.destory();
  }).then(() => {
    // task 對象已被銷毀
  });

  // 如果 paranoid 選項為 true，則不會刪除該對象，而將 deletedAt 行設置為當前時間戳。
  // 要強制刪除，可以將 force:true 傳遞給 destroy 調用：
  task.destroy({force: true});
});


// 批量操作
// 除了更新單個實例之外，你還可以一次創建、更新和刪除多個實例。調用你需要的方法

// - Model.bulkCreate
// - Model.update
// - Model.destroy

// 由於你使用多個模型，回調將不會返回 DAO 實例。BulkCreate 將返回一個模型實例 / DAO 的陣列，但是它們不同於 create，沒有 autoIncrement 屬性的結果值，update 和 destroy 將返回受影響的行數。

User.sync().then(() => {
  // 首先看下 bulkCreate
  User.bulkCreate([
    {username: 'barfooz', isAdmin: true},
    {username: 'foo', isAdmin: true},
    {username: 'bar', isAdmin: false},
  ]).then(() => { // 注意：這裡沒有憑據，然而現在你需要...
    return User.findAll();
  }).then(users => {
    console.log(users);
  });
});

Task.sync().then(() => {
  // 一次更新幾行：
  Task.blukCreate([
    {subject: 'programming', status: 'executing'},
    {subject: 'reading', status: 'executing'},
    {subject: 'programming', status: 'finished'}
  ]).then(() => {
    return Task.update(
      {status: 'inactive'},
      {where: {subject: 'programming'}}
    )
  }).spread((affectedCount, affectedRows) => {
    // .update 在陣列中返回兩個值，因此我們使用 .spread
    // 請注意，affectedRows 只支持以 returning: true 的方式來進行定義

    // affectedCount 將會是 2
    return Task.findAll();
  }).then(tasks => {
    console.log(tasks);
  });

  // 然後刪除他們
  Task.bulkCreate([
    {subject: 'programming', status: 'executing'},
    {subject: 'reading', status: 'executing'},
    {subject: 'programming', status: 'finished'}
  ]).then(() => {
    return Task.destroy({
      where: {
        subject: 'programming'
      },
      truncate: true // 浙江忽略 where 並用 truncate table 替代
    });
  }).then(affectedRows => {
    // affectedRows 將是 2
    return Task.findAll();
  }).then(tasks => {
    console.log(tasks); // 顯示 tasks 內容
  });
});

// 如果你直接從 user 接受值，則限制要實際插入的列可能會更好。
// bulkCreate() 接受一個選項對象作為第二個參數。該對象可以有一個 fields 參數 (一個陣列)，讓它知道你想要明確構建哪些欄位
User.bulkCreate([
  {username: 'foo'},
  {username: 'bar', admin: true}
])