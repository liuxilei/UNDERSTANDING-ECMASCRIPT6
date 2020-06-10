# 函数

## 函数形参的默认值

### 在ECMASCRIPT5中模拟默认参数

```javascript
function makeRequest(url, timeout, callback) {
    timeout = timeout || 2000;
    callback = callback || function() {};

    //函数的其余部分
}
```

这个方法也有缺陷，如果我们想给`makeRequest`函数的第二个形参`timeout`传入值0，即使这个值是合法的，也会被视为一个假值，并最终将`timeout`赋值为2000.

在这种情况下，更安全的选择是通过`typeof`检查参数类型，就像这样：

```javascript
function makeRequest(url, timeout, callback) {
    timeout = (typeof timeout !== "undefined")  ? timeout : 2000;
    callback = (typeof callback !== "undefined") ? callback : function() {};

    //函数的其余部分
}
```

### ECMASCRIPT6中的默认参数值

声明函数时，可以为任意参数指定默认值，在已指定默认值的参数后可以继续声明无默认值参数。举个例子，像这样声明函数不会抛出错误：

```javascript
function makeRequest(url, timeout = 2000, callback) {
    //函数的其他部分
}
```

在这种情况下，**只有当不为第二个参数传入值或主动为第二个参数传入`undefined`时才会使用`timeout`的默认值**，就像这样：

```javascript
//使用timeout的默认值
makeRequest("/foo", undefined, function(body) {
    doSomething(body);
});

//使用timeout的默认值
makeRequest("/foo");

//不使用timeout的默认值
makeRequest("/foo", null, function(body) {
    doSomething(body);
});
```

对于默认参数值，null是一个合法值，也就是说第3次调用makeRequest()方法时，不使用timeout的默认值，其值最终为null。

### 默认参数值对arguments对象的影响

**切记，当使用默认参数值时，arguments对象的行为与以为不同**

**ECMAScript5非严格模式**

```javascript
function mixArgs(first, second) {
    console.log(first === arguments[0]);
    console.log(second === arguments[1]);
    first = "c";
    second = "d";
    console.log(first === arguments[0]);
    console.log(second === arguments[1]);
}

mixArgs("a", "b");
//true
//true
//true
//true
```

**ECMAScript5严格模式**
```javascript
function mixArgs(first, second) {
    "use strict"

    console.log(first === arguments[0]);
    console.log(second === arguments[1]);
    first = "c";
    second = "d";
    console.log(first === arguments[0]);
    console.log(second === arguments[1]);
}

mixArgs("a", "b");
//true
//true
//false
//false
```

### 默认参数表达式

```javascript
function getValue() {
    return 5;
}

function add(first, second = getValue()) {
    return first + second;
}

console.log(add(1, 2)); //3
console.log(add(1)); //6
```

```javascript
let value = 5;

function getValue() {
    return value++;
}

function add(first, second = getValue()) {
    return first + second;
}

console.log(add(1, 1)); //2
console.log(add(1)); //6
console.log(add(1)); //7
```

注意，当使用函数调用结果作为默认参数值时，如果忘记写小括号，例如，`second = getValue`，则最终传入的是对函数的引用，而不是函数调用的结果。

正因为默认参数是在函数调用时求值，所以可以使用先定义的参数作为后定义参数的默认值，就像这样：

```javascript
function add(first, second = first) {
    return first + second;
}

console.log(add(1, 1)); //2
console.log(add(1)); //2
```

更进一步，可以将参数`first`传入一个函数来获得参数`second`的值，就像这样：

```javascript
function getValue(value) {
    return value + 5;
}

function add(first, second = getValue(first)) {
    return first + second;
}

console.log(add(1, 1)); //2
console.log(add(1)); //7
```

在引用参数默认值的时候，只允许引用前面参数的值，即先定义的参数不能访问后定义的参数。举个例子：

```javascript
function add(first = second, second) {
    return first + second;
}

console.log(add(1, 1)); //2
console.log(add(undefined, 1)); 
//报错：Uncaught ReferenceError: Cannot access 'second' before initialization
```

### 默认参数的临时死区

函数参数有自己的作用域和临时死区，其与函数体的作用域是各自独立的，也就是说参数的默认值不可访问函数体内声明的变量。

## 处理无命名参数

### ECMAScript5中的无命名参数

```javascript
function pick(object) {
    let result = Object.create(null);

    //从第二个参数开始
    for (let i = 1, len = arguments.length;i < len;i++) {
        result[arguments[i]] = object[arguments[i]];
    }

    return result;
}

let book = {
    title: "Understanding ECMAScript 6",
    author: "Nicholas C. Zakas",
    year: 2016
};

let bookData = pick(book, "author", "year");

console.log(bookData); //{author: "Nicholas C. Zakas", year: 2016}
console.log(bookData.author); //Nicholas C. Zakas
console.log(bookData.year); //2016
```

这个函数模仿了`Underscore.js`库中的`pick()`方法，返回一个给定对象的副本，包含原始对象属性的特定子集。在这个示例中只定义了一个参数，第一个参数传入的是被复制属性的源对象，其他参数为被复制属性的名称。

### 不定参数

```javascript
function pick(object, ...keys) {
    let result = Object.create(null);

    for (let i = 0;i < keys.length;i++) {
        result[keys[i]] = object[keys[i]];
    }

    return result;
}

let book = {
    title: "Understanding ECMAScript 6",
    author: "Nicholas C. Zakas",
    year: 2016
};

let bookData = pick(book, "author", "year");

console.log(bookData); //{author: "Nicholas C. Zakas", year: 2016}
console.log(bookData.author); //Nicholas C. Zakas
console.log(bookData.year); //2016
```

函数的`length`属性统计的是函数命名参数的数量，不定参数的加入不会影响`length`属性的值。在本示例中，`pick()`函数的`length`值为1，因为只会计算`object`。

#### 不定参数对arguments对象的影响

不定参数的设计初衷是代替`JavaScript`的`arguments`对象。起初，在`ECMAScript4`草案中，`arguments`对象被移除并添加了不定参数的特性，从而可以传入不限数量的参数。但是`ECMAScript4`从未被标准化，这个想法被搁置下来，直到重新引入了`ECMAScript6`标准，唯一的区别是`arguments`对象依然存在。

```javascript
function checkArgs(...args) {
    console.log(args.length);
    console.log(arguments.length);
    console.log(args[0], arguments[0]);
    console.log(args[1], arguments[1]);
}

checkArgs("a", "b");
//2
//2
//a a
//b b
```

无论是否使用不定参数，`arguments`对象总是包含所有传入函数的参数。

## 增强的Function构造函数

