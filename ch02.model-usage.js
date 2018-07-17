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