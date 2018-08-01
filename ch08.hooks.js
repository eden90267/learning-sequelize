// Hooks - 鉤子

// Hook（也称为生命周期事件）是执行 sequelize 调用之前和之后调用的函数。例如，如果要在保存模型之前始终设置值，可以添加一个 beforeUpdate hook。

const Sequelize = require('sequelize');
const sequelize = require('./models');

const Op = Sequelize.Op;


// 操作清單

/**

 (1)
 beforeBulkCreate(instances, options)
 beforeBulkDestroy(options)
 beforeBulkUpdate(options)
 (2)
 beforeValidate(instance, options)
 (-)
 validate
 (3)
 afterValidate(instance, options)
 - or -
 validationFailed(instance, options, error)
 (4)
 beforeCreate(instance, options)
 beforeDestroy(instance, options)
 beforeUpdate(instance, options)
 beforeSave(instance, options)
 beforeUpsert(values, options)
 (-)
 create
 destroy
 update
 (5)
 afterCreate(instance, options)
 afterDestroy(instance, options)
 afterUpdate(instance, options)
 afterSave(instance, options)
 afterUpsert(created, options)
 (6)
 afterBulkCreate(instances, options)
 afterBulkDestroy(options)
 afterBulkUpdate(options)

 */


// 聲明 Hook

// Hook 的參數透過引用傳遞。這意味著您可以更改值，這將反應在 insert/update 語句中。Hook 可能包含異步動作