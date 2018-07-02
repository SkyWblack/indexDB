/*
 * @Author: 王镇军 
 * @Date: 2018-06-28 09:25:36 
 * @Last Modified by: 王镇军
 * @Last Modified time: 2018-06-29 09:33:01
 */

// IndexedDB 具有以下特点。

// （1）键值对储存。 IndexedDB 内部采用对象仓库（object store）存放数据。所有类型的数据都可以直接存入，包括 JavaScript 对象。在对象仓库中，数据以“键值对”的形式保存，每一个数据都有对应的键名，键名是独一无二的，不能有重复，否则会抛出一个错误。

// （2）异步。 IndexedDB 操作时不会锁死浏览器，用户依然可以进行其他操作，这与 LocalStorage 形成对比，后者的操作是同步的。异步设计是为了防止大量数据的读写，拖慢网页的表现。

// （3）支持事务。 IndexedDB 支持事务（transaction），这意味着一系列操作步骤之中，只要有一步失败，整个事务就都取消，数据库回到事务发生之前的状态，不存在只改写一部分数据的情况。

// （4）同域限制 IndexedDB 也受到同域限制，每一个数据库对应创建该数据库的域名。来自不同域名的网页，只能访问自身域名下的数据库，而不能访问其他域名下的数据库。

// （5）储存空间大 IndexedDB 的储存空间比 LocalStorage 大得多，一般来说不少于250MB。IE 的储存上限是250MB，Chrome 和 Opera 是剩余空间的某个百分比，Firefox 则没有上限。

// （6）支持二进制储存。 IndexedDB 不仅可以储存字符串，还可以储存二进制数据。



// 预定义变量 数据库 事务 仓库名
var db, trans, store;

function _initIndexDB() {
    // 初始化indexDB, 判断当前设备是否window.indexDB
    var indexedDB = window.indexedDB || window.webikitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
    if (window.indexedDB) {
        console.log(" 支持indexedDB...");
        return false;
    } else {
        console.log("不支持indexedDB...");
        return false;
    }
}


function _createIndexDB(_db, data, callback) {
    _initIndexDB();
    //1-创建数据库 indexedDB.open方法用于打开数据库。返回的是一个对象，第一个参数是数据库名称，格式为字符串。第二个参数是数据库版本。
    var openRequest = window.indexedDB.open(_db.dbName, _db.dbVersion);
    //2-创建数据库时会触发三个事件之一，这三个事件，分别是upgradeneeded，success，onerror，意思就不说了吧，不懂得可以用字典查嘛。
    openRequest.onupgradeneeded = function (e) { //第一次打开数据库 ^-*
        console.log("第一次打开该数据库，或者数据库版本发生变化....");
        db = e.target.result;
        var storeNames = db.objectStoreNames;
        //创建数据库的表格（或者叫数据库仓库）
        if (!storeNames.contains(_db.storeName)) {
            var objectStore = db.createObjectStore(_db.storeName, {
                keyPath: _db.keyPath,
                autoIncrement: true
            })
            //--------添加索引
            // objectStore.createIndex("a", "title", {
            //   unique: true
            // });
        }
    }
    openRequest.onsuccess = function (e) { //success：打开成功^-^  
        console.log("数据库打开成功...");
        db = e.target.result;
        trans = db.transaction([_db.storeName], "readwrite");
        store = trans.objectStore(_db.storeName);
        //3-数据库打开后，定义用户行为的回调函数
        callback(db, _db, data);
    }
    openRequest.onerror = function (e) { //error：打开失败*-*
        console.log("数据库打开失败...");
    }
}


// indexDB在对新数据库做任何操作（增删改查）之前，都需要开始一个事务，事务决定需要对那些objectStore进行操作 
// 事务具有三种模式
// 1. 只读：read，不能修改数据库数据，可以并发执行
// 2. 读写：readwrite，可以进行读写操作
// 3. 版本变更：versionchange


function _addIndexDB(db, _db, data) {
    //1-添加数据：add方法的第一个参数是所要添加的数据，第二个参数是这条数据对应的键名（key）       
    var request = store.add(data.value);
    //2-添加数据：add方法也有两个事件，一个error一个success可以在回调函数中调用。
    request.onerror = function (e) {
        console.log("Error", e.target.error.name);
        // error handler
        console.log("数据添加失败...");
    }
    request.onsuccess = function (e) {
        // success handler
        console.log("数据添加成功...");
    }
}


function _updateIndexDB(db, _db, data) {
    //1-更新记录：put方法。  
    var request = store.put(data.value);
    request.onerror = function (e) {
        console.log("Error", e.target.error.name);
        // error handler
        console.log("数据更新失败...");
    }
    request.onsuccess = function (e) {
        // success handler
        console.log("数据更新成功...");
    }
}


function _deleteIndexDB(db, _db, data) {
    //1-objectStore方法用于返回“数据库表格”对象。delete方法的参数是数据的键名         
    var request = store.delete(data.key);
    //2-删除数据：delete方法也有两个事件，一个error一个success可以在回调函数中调用。 
    request.onerror = function (e) {
        console.log("Error", e.target.error.name);
        // error handler
        console.log("删除数据失败...");
    }
    request.onsuccess = function (e) {
        // success handler
        console.log("删除数据成功...");
    }
}


function _traverseIndexDB(db, _db, data) {
    //遍历数据：openCursor方法 (openCursor方法，它在当前对象仓库里面建立一个读取光标（cursor）)
    //1-创建一个游标  
    var cursor = store.openCursor();
    cursor.onsuccess = function (e) {
        var res = e.target.result;
        // console.log(res.key);
        // console.dir(res.value);
        data.find(res);
        // res.continue();
        //5-continue方法将光标移到下一个数据对象，如果当前数据对象已经是最后一个数据了，则光标指向null。

    }
}


// // 根据添加的索引  查找数据
// function _dealIndexDB(objectStore, _db, data) {
//     console.log(32323232)
//     //2-创建索引  createIndex方法接受三个参数，第一个是索引名称，第二个是建立索引的属性名，第三个是参数对象。  
//     objectStore.createIndex(data.index, data.index, {
//         unique: true
//     });
//     console.log('索引成功')
//     //3-通过索引获取数据
//     // var trans = db.transaction([_db.storeName], "readonly");
//     // var store = trans.objectStore(_db.storeName);
//     // var index = store.index(data.index);
//     // var request = index.get(data.index);
//     // console.log("通过索引获取数据:" + request);
// }


// function _getIndexDB(db, _db, data) {
//     var trans = db.transaction([_db.storeName], "readwrite");
//     var store = trans.objectStore(_db.storeName);
//     var index = store.index("userId");
//     index.get('888').onsuccess = function (e) {
//         var student = e.target.result;
//         console.log(student);
//     }
// }


// ------------ 需要传入的参数
// 1.数据库名称(dbName) 数据库版本(dbVersion) 仓库名称(storeName)  仓库key(keyPath)
//  2.存入的数据 value  key
function add(db, data) {
    _createIndexDB(db, data, _addIndexDB);
}
function update(db, data) {
    _createIndexDB(db, data, _updateIndexDB);
}
function delet(db, data) {
    _createIndexDB(db, data, _deleteIndexDB);
}
function find(db, data) {
    _createIndexDB(db, data, _traverseIndexDB);
}

const indexDB = {
    add: add,
    update: update,
    delete: delet,
    find: find
}
export { indexDB };