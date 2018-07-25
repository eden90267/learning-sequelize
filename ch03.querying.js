// Querying - 查詢

var Sequelize = require('sequelize');
var sequelize = require('./models');

const Op = Sequelize.Op;

const Model = sequelize.define('model', {
  foo: Sequelize.STRING,
  bar: Sequelize.STRING,
  baz: Sequelize.STRING,
  quz: Sequelize.STRING,
  hats: Sequelize.STRING
});

Model.sync().then(() => {


  // 屬性
  // 只選擇某個屬性
  Model.findAll({
    attributes: ['foo', 'bar']
  });

  // 屬性可用嵌套陣列來重命名
  Model.findAll({
    attributes: ['foo', ['bar', 'baz']]
  }); // SELECT foo, bar AS baz ...

  // 可用 sequelize.fn 來進行聚合
  Model.findAll({
    attributes: [
      [sequelize.fn('COUNT', sequelize.col('hats')), 'no_hats']
    ]
  }); // SELECT COUNT(hats) AS no_hats ...

  // 使用聚合功能，必須給他一個別名，以便能夠從模型中訪問：instance.get('no_hats')

  // 有時，如果您只想添加聚合，則列出模型的所有屬性可能令人厭煩
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

const connection = new Sequelize(db, user, pass, {operatorsAliases: false});
const connection2 = new Sequelize(db, user, pass, {operatorsAliases: {$and: Op.and}});

// 如果你使用默認別名並且不限制它們，Sequelize 會發出警告。
// 如果你想繼續使用所有默認別名 (不包括舊版別名) 而不發出警告，你可傳遞以下運算符參數：

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
User.findAll({
  where: sequelize.where(sequelize.fn('ISJSON', sequelize.col('userDetails')), 1)
});
// // JSON_VALUE - 从 JSON 字符串提取标量值
User.findAll({
  attributes: [[sequelize.fn('JSON_VALUE', sequelize.col('userDetails'), '$.address.Line1'), 'address line 1']]
});
// // JSON_VALUE - 从 JSON 字符串中查询标量值
User.findAll({
  where: sequelize.where(sequelize.fn('JSON_VALUE', sequelize.col('userDetails'), '$.address.Line1'), '14, Foo Street')
});
// // JSON_QUERY - 提取一个对象或数组
User.findAll({
  attributes: [[sequelize.fn('JSON_QUERY', sequelize.col('userDetails'), '$.address'), 'full address']]
});

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

const Project = sequelize.define('project', {/* ... */});

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

  // 获取10个实例/行
  Project.findAll({limit: 10});

  // 跳过8个实例/行
  Project.findAll({offset: 8});

  // 跳过5个实例，然后取5个
  Project.findAll({offset: 5, limit: 5});


  // 排序

  // order 需要一個條目的陣列來排序查詢或者一個 sequelize 方法。一般來說，你將要使用任一屬性的 tuple/array，並確定排序的正反方向

  Subtask.findAll({
    order: [
      // 将转义标题，并根据有效的方向参数列表验证DESC
      ['title', 'DESC'],

      // 将按最大值排序(age)
      sequelize.fn('max', sequelize.col('age')),

      // 将按最大顺序(age) DESC
      [sequelize.fn('max', sequelize.col('age')), 'DESC'],

      // 将按 otherfunction 排序(`col1`, 12, 'lalala') DESC
      [sequelize.fn('otherfunction', sequelize.col('col1'), 12, 'lalala'), 'DESC'],

      // 将使用模型名称作为关联的名称排序关联模型的 created_at。
      [Task, 'createdAt', 'DESC'],

      // Will order through an associated model's created_at using the model names as the associations' names.
      [Task, Project, 'createdAt', 'DESC'],

      // 将使用关联的名称由关联模型的created_at排序。
      ['Task', 'createdAt', 'DESC'],

      // Will order by a nested associated model's created_at using the names of the associations.
      ['Task', 'Project', 'createdAt', 'DESC'],

      // Will order by an associated model's created_at using an association object. (优选方法)
      [Subtask.associations.Task, 'createdAt', 'DESC'],

      // Will order by a nested associated model's created_at using association objects. (优选方法)
      [Subtask.associations.Task, Task.associations.Project, 'createdAt', 'DESC'],

      // Will order by an associated model's created_at using a simple association object.
      [{model: Task, as: 'Task'}, 'createdAt', 'DESC'],

      // 嵌套关联模型的 created_at 简单关联对象排序
      [{model: Task, as: 'Task'}, {model: Project, as: 'Project'}, 'createdAt', 'DESC']
    ],

    // 将按年龄最大值降序排列
    // order: sequelize.literal('max(age) DESC'),

    // 按最年龄大值升序排列，当省略排序条件时默认是升序排列
    // order: sequelize.fn('max', sequelize.col('age')),

    // 按升序排列是省略排序条件的默认顺序
    // order: sequelize.col('age'),

    // 将根据方言随机排序 (而不是 fn('RAND') 或 fn('RANDOM'))
    // order: sequelize.random()
  });

  // Table Hint
  // 當使用 MSSQL 時，可以使用 tableHint 來選擇傳遞一個表提示。該提示必須是來自 Sequelize.TableHints 的值，只能在絕對必要時使用。每個查詢當前僅支持單個表提示

  // 表提示透過指定某些選項來覆蓋 MSSQL 查詢優化器的默認行為。它們只影響該子句引用的表或視圖

  const TableHints = Sequelize.TableHints;

  Project.findAll({
    tableHint: TableHints.NOLOCK // 這將生成 SQL 'WITH (NOLOCK)'
  });

});