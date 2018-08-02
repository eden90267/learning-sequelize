// Raw queries - 原始查詢

const Sequelize = require('sequelize');
const sequelize = require('./models');

const Op = Sequelize.Op;
const DataTypes = Sequelize.DataTypes;
const QueryTypes = Sequelize.QueryTypes;

// 由於常常使用簡單的方式來執行原始/已經準備好的 SQL 查詢，所以可以使用 sequelize.query 函數

// 默认情况下，函数将返回两个参数 - 一个结果陣列，以及一个包含元資料（受影响的列等）的物件。
// 請注意，由於這是一個原始查詢，所以元資料 (屬性名稱) 是具體的方言。某些方言返回元資料。某些方言返回元資料 “within” 結果對象 (作為資料上的屬性)。但是，將永遠返回兩個參數，但對於 MSSQL 和 MySQL，它將是對同一對象的兩個引用。

sequelize.query("UPDATE users SET y = 42 WHERE x = 12").spread((results, metadata) => {
  // 結果將是一個空陣列，元數據將包含受影響的列數
});

// 在不需要訪問元資料的情況下，您可以傳遞一個查詢類型來告訴後續如何格式化結果。例如，對於一個簡單的選擇查詢你可以做：

sequelize.query("SELECT * FROM `users`", {type: QueryTypes.SELECT}).then(users => {
  // 我们不需要在这里延伸，因为只有结果将返回给选择查询
});

// 還有其他幾種查詢類型可用。可查看來源：https://github.com/sequelize/sequelize/blob/master/lib/query-types.js

// 第二種選擇是模型。如果傳遞模型，返回的資料將是該模型的實例。

sequelize.query('SELECT * FROM projects', {mdoel: Project}).then(projects => {
  // 每个记录现在将是 Project 的一个实例
});


// 替換

// 查询中的替换可以通过两种不同的方式完成：使用命名参数（以: 开头），或者由 ? 表示的未命名参数。 替换在options对象中传递。

// - 如果传递一个陣列，? 将按照它们在陣列中出现的顺序被替换
// - 如果傳遞一個物件，:key 将替换为该物件的键。如果物件包含在查询中找不到的键，则会抛出异常，反之亦然。

sequelize.query('SELECT * FROM projects WHERE status = ?',
  {replacements: ['active'], type: sequelize.QueryTypes.SELECT}
).then(project => {
  console.log(projects);
});

sequelize.query('SELECT * FROM projects WHERE status = :status',
  {replacements: {status: 'active'}, type: sequelize.QueryTypes.SELECT}
).then(projects => {
  console.log(projects);
});

// 陣列替換將自動處理，以下查詢將搜索狀態與值陣列匹配的項目

sequelize.query('SELECT * FROM projects WHERE status IN(:status) ',
  {replacements: {status: ['active', 'inactive']}, type: sequelize.QueryTypes.SELECT}
).then(projects => {
  console.log(projects)
});

// 要使用通配符運算符 %，請將其附加到你的替換中。以下查詢與名稱以 "ben" 開頭的用戶相匹配。

sequelize.query('SELECT * FROM users WHERE name LIKE :search_name',
  {replacements: {search_name: 'ben%'}, type: QueryTypes.SELECT}
).then(projects => {
  console.log(projects);
});


// 綁定參數

// 綁定參數就像替換。除非替換會轉譯並在查詢發送到資料庫之前透過後續插入到查詢中，而將綁定參數發送到 SQL 查詢文本之外的資料庫。查詢可以具有綁定參數或替換。綁定參數由 $1, $2, ... (numeric) 或 $key (alpha-numeric) 引用。這是獨立於方言的。

// - 如果传递一个数组, $1 被绑定到数组中的第一个元素 (bind[0])。
// - 如果传递一个对象, $key 绑定到 object['key']。 每个键必须以非数字字符开始。 $1 不是一个有效的键，即使 object['1'] 存在。
// - 在这两种情况下 $$ 可以用来转义一个 $ 字符符号.

// 数组或对象必须包含所有绑定的值，或者Sequelize将抛出异常。 这甚至适用于数据库可能忽略绑定参数的情况。

// 数据库可能会增加进一步的限制。 绑定参数不能是 SQL 关键字，也不能是表或行名。引用的文本或数据也忽略它们。
// 在 PostgreSQL 中，如果不能从上下文 $1::varchar 推断类型，那么也可能需要对其进行类型转换。

sequelize.query('SELECT *, "text with literal $$1 and literal $$status" as t FROM projects WHERE status = $1',
  {bind: ['active'], type: sequelize.QueryTypes.SELECT}
).then(projects => {
  console.log(projects)
});

sequelize.query('SELECT *, "text with literal $$1 and literal $$status" as t FROM projects WHERE status = $status',
  {bind: {status: 'active'}, type: sequelize.QueryTypes.SELECT}
).then(projects => {
  console.log(projects)
});