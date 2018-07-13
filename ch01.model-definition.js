// Model definition - 模型定义

var Sequelize = require('sequelize');
var sequelize = require('./models');


// 定義模型和表之間的映射，請使用 define 方法。隨後 Sequelize 將自動添加 createdAt 和 updatedAt 屬性 (可用 configuration 做調整)。

const Project = sequelize.define('project', {
  title: Sequelize.STRING,
  description: Sequelize.TEXT
});

const Task = sequelize.define('task', {
  title: Sequelize.STRING,
  description: Sequelize.TEXT,
  deadline: Sequelize.DATE
});

// 可在每行上設置一些參數

const Foo = sequelize.define('foo', {
  // 如果未赋值,则自动设置值为 TRUE
  flag: {type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true},

  // 设置默认时间为当前时间
  myDate: {type: Sequelize.DATE, defaultValue: Sequelize.NOW},

  // 将allowNull设置为false会将NOT NULL添加到列中，
  // 这意味着当列为空时执行查询时将从DB抛出错误。
  // 如果要在查询DB之前检查值不为空，请查看下面的验证部分。
  title: {type: Sequelize.STRING, allowNull: false},

  // 创建具有相同值的两个对象将抛出一个错误。 唯一属性可以是布尔值或字符串。
  // 如果为多个行提供相同的字符串，则它们将形成复合唯一键。
  uniqueOne: {type: Sequelize.STRING, unique: 'compositeIndex'},
  uniqueTwo: {type: Sequelize.INTEGER, unique: 'compositeIndex'},

  // unique属性用来创建一个唯一约束。
  someUnique: {type: Sequelize.STRING, unique: true},

  // 这与在模型选项中创建索引完全相同。
  // someUnique: {type: Sequelize.STRING},
  indexes: [{unique: true, fields: ['someUnique']}],

  // primaryKey用于定义主键。
  identifier: {type: Sequelize.STRING, primaryKey: true},

  // autoIncrement可用于创建自增的整数列
  incrementMe: {type: Sequelize.INTEGER, autoIncrement: true},

  // 你可以通过'field'属性指定自定义列名称：
  fieldWithUnderscores: {type: Sequelize.STRING, field: 'field_with_underscores'},

  // 这可以创建一个外键:
  // bar_id: {
  //   type: Sequelize.INTEGER,
  //
  //   references: {
  //     // 这是引用另一个模型
  //     model: Bar,
  //
  //     // 这是引用模型的列名称
  //     key: 'id',
  //
  //     // 这声明什么时候检查外键约束。 仅限PostgreSQL。
  //     deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
  //   }
  // }
});


// 時間戳

// 默認情況下，Sequelize 會將 createdAt 和 updatedAt 屬性添加到模型中，以便能夠知道資料庫項目何時進入資料庫以及何時被更新。
// 請注意，如果你使用 Sequelize 遷移，則需要將 createdAt 和 updatedAt 欄位添加到遷移定義中：

module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.createTable('my-table', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      // 时间戳
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    })
  },
  down(queryInterface, Sequelize) {
    return queryInterface.dropTable('my-table');
  },
};

// 不想要時間戳或想命名為別的東西，可用 configuration 做調整


// 數據類型

// 以下是 Sequelize 支持的一些數據類型：

// Sequelize.STRING                      // VARCHAR(255)
// Sequelize.STRING(1234)                // VARCHAR(1234)
// Sequelize.STRING.BINARY               // VARCHAR BINARY
// Sequelize.TEXT                        // TEXT
// Sequelize.TEXT('tiny')                // TINYTEXT
//
// Sequelize.INTEGER                     // INTEGER
// Sequelize.BIGINT                      // BIGINT
// Sequelize.BIGINT(11)                  // BIGINT(11)
//
// Sequelize.FLOAT                       // FLOAT
// Sequelize.FLOAT(11)                   // FLOAT(11)
// Sequelize.FLOAT(11, 12)               // FLOAT(11,12)
//
// Sequelize.REAL                        // REAL         仅限于PostgreSQL.
// Sequelize.REAL(11)                    // REAL(11)     仅限于PostgreSQL.
// Sequelize.REAL(11, 12)                // REAL(11,12)  仅限于PostgreSQL.
//
// Sequelize.DOUBLE                      // DOUBLE
// Sequelize.DOUBLE(11)                  // DOUBLE(11)
// Sequelize.DOUBLE(11, 12)              // DOUBLE(11,12)
//
// Sequelize.DECIMAL                     // DECIMAL
// Sequelize.DECIMAL(10, 2)              // DECIMAL(10,2)
//
// Sequelize.DATE                        // DATETIME 针对 mysql / sqlite, TIMESTAMP WITH TIME ZONE 针对 postgres
// Sequelize.DATE(6)                     // DATETIME(6) 针对 mysql 5.6.4+. 小数秒支持多达6位精度
// Sequelize.DATEONLY                    // DATE 不带时间.
// Sequelize.BOOLEAN                     // TINYINT(1)
//
// Sequelize.ENUM('value 1', 'value 2')  // 一个允许具有 “value 1” 和 “value 2” 的 ENUM
// Sequelize.ARRAY(Sequelize.TEXT)       // 定义一个数组。 仅限于 PostgreSQL。
// Sequelize.ARRAY(Sequelize.ENUM)       // 定义一个 ENUM 数组. 仅限于 PostgreSQL。
//
// Sequelize.JSON                        // JSON 列. 仅限于 PostgreSQL, SQLite and MySQL.
// Sequelize.JSONB                       // JSONB 列. 仅限于 PostgreSQL .
//
// Sequelize.BLOB                        // BLOB (PostgreSQL 二进制)
// Sequelize.BLOB('tiny')                // TINYBLOB (PostgreSQL 二进制. 其他参数是 medium 和 long)
//
// Sequelize.UUID                        // PostgreSQL 和 SQLite 的 UUID 数据类型, CHAR(36) BINARY 针对于 MySQL (使用默认值: Sequelize.UUIDV1 或 Sequelize.UUIDV4 来让 sequelize 自动生成 ID)
//
// Sequelize.CIDR                        // PostgreSQL 的 CIDR 数据类型
// Sequelize.INET                        // PostgreSQL 的 INET 数据类型
// Sequelize.MACADDR                     // PostgreSQL 的 MACADDR
//
// Sequelize.RANGE(Sequelize.INTEGER)    // 定义 int4range 范围. 仅限于 PostgreSQL.
// Sequelize.RANGE(Sequelize.BIGINT)     // 定义 int8range 范围. 仅限于 PostgreSQL.
// Sequelize.RANGE(Sequelize.DATE)       // 定义 tstzrange 范围. 仅限于 PostgreSQL.
// Sequelize.RANGE(Sequelize.DATEONLY)   // 定义 daterange 范围. 仅限于 PostgreSQL.
// Sequelize.RANGE(Sequelize.DECIMAL)    // 定义 numrange 范围. 仅限于 PostgreSQL.
//
// Sequelize.ARRAY(Sequelize.RANGE(Sequelize.DATE)) // 定义 tstzrange 范围的数组. 仅限于 PostgreSQL.
//
// Sequelize.GEOMETRY                    // 空间列.  仅限于 PostgreSQL (具有 PostGIS) 或 MySQL.
// Sequelize.GEOMETRY('POINT')           // 具有几何类型的空间列.  仅限于 PostgreSQL (具有 PostGIS) 或 MySQL.
// Sequelize.GEOMETRY('POINT', 4326)     // 具有几何类型和SRID的空间列.  仅限于 PostgreSQL (具有 PostGIS) 或 MySQL.

// 如果你正在使用PostgreSQL TIMESTAMP WITHOUT TIMEZONE，您需要将其解析为不同的时区，请使用pg库自己的解析器：

// require('pg').types.setTypeParser(1114, stringValue => {
//   return new Date(stringValue + '+0000');
//   // 例如UTC偏移。 使用你想要的任何偏移。
// });


// integer, bigint, float 和 double 也支持 unsigned 和 zerofill 屬性，可按任何順序組合：這不適用 PostgreSQL

// Sequelize.INTEGER.UNSIGNED              // INTEGER UNSIGNED
// Sequelize.INTEGER(11).UNSIGNED          // INTEGER(11) UNSIGNED
// Sequelize.INTEGER(11).ZEROFILL          // INTEGER(11) ZEROFILL
// Sequelize.INTEGER(11).ZEROFILL.UNSIGNED // INTEGER(11) UNSIGNED ZEROFILL
// Sequelize.INTEGER(11).UNSIGNED.ZEROFILL // INTEGER(11) UNSIGNED ZEROFILL


// 列舉：
sequelize.define('model', {
  states: {
    type: Sequelize.ENUM,
    values: ['active', 'pending', 'deleted']
  }
});

// Array(ENUM)

// 此项仅支持 PostgreSQL.
//
// Array(ENUM) 类型需要特殊处理。 每当 Sequelize 与数据库通信时，它必须使用 ENUM 名称对数组值进行类型转换。
//
// 所以这个枚举名必须遵循 enum_<table_name>_<col_name> 这个模式。 如果您正在使用 sync，则会自动生成正确的名称。


// 範圍類型

// 由于范围类型具有其绑定的包含(inclusive)/排除(exclusive)的额外信息，所以使用一个元组在javascript中表示它们并不是很简单。
//
// 将范围作为值提供时，您可以从以下API中进行选择：

// 默认为 '["2016-01-01 00:00:00+00:00", "2016-02-01 00:00:00+00:00")'
// 包含下限, 排除上限
// Timeline.create({ range: [new Date(Date.UTC(2016, 0, 1)), new Date(Date.UTC(2016, 1, 1))] });
//
// // 控制包含
// const range = [
//   { value: new Date(Date.UTC(2016, 0, 1)), inclusive: false },
//   { value: new Date(Date.UTC(2016, 1, 1)), inclusive: true },
// ];
// // '("2016-01-01 00:00:00+00:00", "2016-02-01 00:00:00+00:00"]'
//
// // 复合形式
// const range = [
//   { value: new Date(Date.UTC(2016, 0, 1)), inclusive: false },
//   new Date(Date.UTC(2016, 1, 1)),
// ];
// // '("2016-01-01 00:00:00+00:00", "2016-02-01 00:00:00+00:00")'
//
// Timeline.create({ range });

// 請注意無論何時你接收到的返回值將會是一個範圍：

// 储存的值: ("2016-01-01 00:00:00+00:00", "2016-02-01 00:00:00+00:00"]
// range // [{ value: Date, inclusive: false }, { value: Date, inclusive: true }]

// 你需要在使用範圍類型更新實例之後調用 reload 或使用 returns: true 選項

// 特殊情況：

// // 空范围:
// Timeline.create({ range: [] }); // range = 'empty'
//
// // 无限制范围:
// Timeline.create({ range: [null, null] }); // range = '[,)'
// // range = '[,"2016-01-01 00:00:00+00:00")'
// Timeline.create({ range: [null, new Date(Date.UTC(2016, 0, 1))] });
//
// // 无穷范围:
// // range = '[-infinity,"2016-01-01 00:00:00+00:00")'
// Timeline.create({ range: [-Infinity, new Date(Date.UTC(2016, 0, 1))] });


// 可延遲

// 当你在 PostgreSQL 中指定外键列的参数来声明成一个可延迟类型。 可用的选项如下：

// // 将所有外键约束检查推迟到事务结束时。
// Sequelize.Deferrable.INITIALLY_DEFERRED
//
// // 立即检查外键约束。
// Sequelize.Deferrable.INITIALLY_IMMEDIATE
//
// // 不要推迟检查。
// Sequelize.Deferrable.NOT

// 最后一个参数是 PostgreSQL 的默认值，不允许你在事务中动态的更改规则。查看 the transaction section 获取补充信息。


// Getters & Setters

// 可在模型上定義對象屬性 getter 和 setter 函數，這些可用於映射到資料庫欄位的保護屬性，也可用於定義偽屬性。

// Getters 和 Setters 可透過兩種方式定義 (也可混合)：
// - 作為屬性定義的一部分
// - 作為模型參數的一部分

// 定義為屬性定義的一部分

const Employee = sequelize.define('employee', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    get() {
      const title = this.getDataValue('title');
      // 'this' 允许你访问实例的属性
      return this.getDataValue('name') + ' (' + title + ')';
    },
  },
  title: {
    type: Sequelize.STRING,
    allowNull: false,
    set(val) {
      this.setDataValue('title', val.toUpperCase());
    }
  }
});

Employee.sync().then(() => {
  Employee
    .create({name: 'John Doe', title: 'senior engineer'})
    .then(employee => {
      console.log(employee.get('name')); // John Doe (SENIOR ENGINEER)
      console.log(employee.get('title')); // SENIOR ENGINEER
    });
});

// 定義為模型參數的一部分

// 偽屬性可以透過兩種方式定義：使用模型 getter，或使用虛擬數據類型的行。虛擬數據類型可以有驗證，而虛擬屬性的 getter 則不能

const Foo = sequelize.define('foo', {
  firstname: Sequelize.STRING,
  lastname: Sequelize.STRING
}, {
  getterMethods: {
    fullName() {
      return this.firstname + ' ' + this.lastname; // 將觸發對 getter 函數的調用，如不想那樣使用 getDataValue() 方法來訪問原始值
    }
  },

  setterMethods: {
    fullName(value) {
      const names = value.split(' ');

      this.setDataValue('firstname', names.slice(0, -1).join(' '));
      this.setDataValue('lastname', names.slice(-1).join(' '));
    }
  }
});

// 用於 getter 和 setter 定義內部的 Helper 方法

// - 檢索底層屬性值，總是使用 this.getDataValue()
// get() {
//   return this.getDataValue('title')
// }

// - 設置基礎屬性值，總是使用 this.setDataValue()
// set(title) {
//   this.setDataValue('title', title.toString().toLowerCase());
// }

// 注意：堅持使用 setDataValue() 和 getDataValue() 函數 (而不是直接訪問底層的 “資料值” 屬性) 是非常重要的，這樣做可以保護你的定製 getter 和 setter 不受底層模型實現的變化


// 驗證

// 允許你為模型的每個屬性指定 格式/內容/繼承 驗證
// 驗證會自動運行在 create、update 和 save 上。你也可以調用 validate() 手動驗證一個實例。

// 驗證由 validator.js 實現

const ValidateMe = sequelize.define('foo', {
  foo: {
    type: Sequelize.STRING,
    validate: {
      is: ["^[a-z]+$",'i'],     // 只允许字母
      is: /^[a-z]+$/i,          // 与上一个示例相同,使用了真正的正则表达式
      not: ["[a-z]",'i'],       // 不允许字母
      isEmail: true,            // 检查邮件格式 (foo@bar.com)
      isUrl: true,              // 检查连接格式 (http://foo.com)
      isIP: true,               // 检查 IPv4 (129.89.23.1) 或 IPv6 格式
      isIPv4: true,             // 检查 IPv4 (129.89.23.1) 格式
      isIPv6: true,             // 检查 IPv6 格式
      isAlpha: true,            // 只允许字母
      isAlphanumeric: true,     // 只允许使用字母数字
      isNumeric: true,          // 只允许数字
      isInt: true,              // 检查是否为有效整数
      isFloat: true,            // 检查是否为有效浮点数
      isDecimal: true,          // 检查是否为任意数字
      isLowercase: true,        // 检查是否为小写
      isUppercase: true,        // 检查是否为大写
      notNull: true,            // 不允许为空
      isNull: true,             // 只允许为空
      notEmpty: true,           // 不允许空字符串
      equals: 'specific value', // 只允许一个特定值
      contains: 'foo',          // 检查是否包含特定的子字符串
      notIn: [['foo', 'bar']],  // 检查是否值不是其中之一
      isIn: [['foo', 'bar']],   // 检查是否值是其中之一
      notContains: 'bar',       // 不允许包含特定的子字符串
      len: [2,10],              // 只允许长度在2到10之间的值
      isUUID: 4,                // 只允许uuids
      isDate: true,             // 只允许日期字符串
      isAfter: "2011-11-05",    // 只允许在特定日期之后的日期字符串
      isBefore: "2011-11-05",   // 只允许在特定日期之前的日期字符串
      max: 23,                  // 只允许值 <= 23
      min: 23,                  // 只允许值 >= 23
      isCreditCard: true,       // 检查有效的信用卡号码

      // 也可以自定义验证:
      isEven(value) {
        if (parseInt(value) % 2 != 0) {
          throw new Error('Only even values are allowed!')
          // 我们也在模型的上下文中，所以如果它存在的话,
          // this.otherField会得到otherField的值。
        }
      }
    }
  }
});

// 如果要將多個參數傳遞給內置的驗證函數，則要傳遞的參數必須位於陣列中。
// 但是，如果要傳遞單個陣列參數，例如 isIn 的可接受字符串陣列，則將被解釋為多個字符串參數，而不是一個陣列參數。要解決這個問題，傳遞一個單一長度的參數數組，比如 [['one'], ['two']]

// 要使用自定義錯誤消息而不是 validator.js 提供的錯誤消息，請使用對象而不是純值或參考陣列，例如不需要參數的驗證器可以被給定自定義消息：

// isInt: {
//   msg: "Must be an integer number of pennies"
// }

// 或者如果需要傳遞參數：

// isIn: {
//   args: [['en', 'zh']],
//   msg: 'Must be English or Chinese'
// }

// 當使用自定義驗證器函數時，錯誤消息將是拋出的 Error 對象所持有的任何消息

// 驗證器 與 allowNull

// 如果模型的特定欄位設置為允許 null，並且該值已設置為 null，則其驗證器不會運行。

// 你可以透過設置 notNull 驗證器來自定義 allowNull 錯誤消息：

const User = sequelize.define('user', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notNull: {
        msg: 'Please enter your name'
      }
    }
  }
});

// 模型驗證

// 驗證器也可以在特定欄位驗證器之後用來定義檢查模型。例如，你可以確保緯度和經度都不設置，或者兩者都設置，如果設置了一個而另一個未設置則驗證失敗

// 模型驗證器的方法與模型對象的上下文一起調用，如果它們拋出失敗，則認為失敗，否則通過。這與自定義欄位特定的驗證器一樣。

// 收集的任何錯誤消息都將與驗證結果對象一起放在欄位驗證錯誤中，這個錯誤使用在 validate 參數對象中以失敗的驗證方法的鍵來命名。
// 即便在任何一個時刻，每個模型驗證方法只能有一個錯誤消息，它會在陣列中顯示為單個字符串錯誤，以最大化與欄位錯誤的一致性。

const Pub = Sequelize.define('pub', {
  name: {type: Sequelize.STRING},
  address: {type: Sequelize.STRING},
  latitude: {
    type: Sequelize.INTEGER,
    allowNull: true,
    defaultValue: null,
    validate: {min: -90, max: 90}
  },
  longitude: {
    type: Sequelize.INTEGER,
    allowNull: true,
    defaultValue: null,
    validate: {min: -180, max: 180}
  },
}, {
  validate: {
    bothCoordsOrNone() {
      if ((this.latitude === null) !== (this.longitude === null)) {
        throw new Error('Require either both latitude and longitude or neither')
      }
    }
  }
});

// 如果我們嘗試構建一個超範圍的緯度和精度，那麼可能返回：

// {
//   'latitude': ['Invalid number: latitude'],
//   'bothCoordsOrNone': ['Require either both latitude and longitude or neither']
// }


// 配置

// 你還可以修改 Sequelize 處理行名稱的方式

const Bar = sequelize.define('bar', {/* bla */}, {

  // 不添加时间戳属性 (updatedAt, createdAt)
  timestamps: false,

  // 不删除数据库条目，但将新添加的属性deletedAt设置为当前日期（删除完成时）。
  // paranoid 只有在启用时间戳时才能工作
  paranoid: true,

  // 将自动设置所有属性的字段选项为下划线命名方式。
  // 不会覆盖已经定义的字段选项
  underscored: true,

  // 禁用修改表名; 默认情况下，sequelize 将自动将所有传递的模型名称（define的第一个参数）转换为复数。 如果你不想这样，请设置以下内容
  freezeTableName: true,

  // 定义表的名称
  tableName: 'my_very_custom_table_name',

  // 启用乐观锁定。 启用时，sequelize 将向模型添加版本计数属性，
  // 并在保存过时的实例时引发OptimisticLockingError错误。
  // 设置为true或具有要用于启用的属性名称的字符串。
  version: true
});

// 如果你希望 sequelize 處理時間戳，但只想要其中一部分，或者希望您的時間戳被稱為別的東西，可單獨覆蓋每個行：

const Foo = sequelize.define('foo', {/* bla */}, {

  // 不要忘记启用时间戳！
  timestamps: true,

  // 我不想要 createdAt
  createdAt: false,

  // 我想 updateAt 实际上被称为 updateTimestamp
  updatedAt: 'updateTimestamp',

  // 并且希望 deletedA t被称为 destroyTime（请记住启用 paranoid 以使其工作）
  deletedAt: 'destroyTime',
  paranoid: true

});

// 可更改資料庫引擎

const Person = sequelize.define('person', { /* attributes */ }, {
  engine: 'MYISAM'
})

// 或全局的
const sequelize = new Sequelize(db, user, pw, {
  define: {engine: 'MYISAM'}
});

// 你可以為 MySQL 和 PG 中的表指定注釋

const Person = sequelize.define('person', {/* attributes */}, {
  comment: "I'm "
})