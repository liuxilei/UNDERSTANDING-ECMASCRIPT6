# 块级作用域绑定

## var声明及变量提升（Hoisting）机制

```javascript
function getValue(condition) {
    if (condition) {
        var value = "blue";
        return value;
    } else {
        console.log(value);
        return null;
    }
}

getValue(false); //undefined
```

解释：在函数作用域或全局作用域通过关键字`var`声明的变量，无论实际是在哪里声明的，都会被当成在当前作用域顶部声明的变量。

在预编译阶段,JavaScript引擎会将上面的getValue函数修改成下面这样:
```javascript
function getValue(condition) {
    var value;
    if (condition) {
        value = "blue";
        return value;
    } else {
        console.log(value);
        return null;
    }
}

getValue(); //undefined
```

## 块级声明

### let声明

```javascript
function getValue(condition) {
    if (condition) {
        let value = "blue";
        return value;
    } else {
        console.log(value);
        return null;
    }
}

getValue(false); //报错：'value' is not defined
```

### 禁止重声明

```javascript
var count = 30;
let count = 40; //报错：Identifier 'count' has already been declared
```

```javascript
var count = 30;
let condition = true;
if (condition) {
    let count = 40; //不会报错
}
```

## const声明

```javascript
const maxItems = 30;

//语法错误:常量未初始化
const name;
```

```javascript
let condition = true;
if (condition) {
    const maxItems = 5;
}
console.log(maxItems); //报错:'maxItems' is not defined
```

```javascript
let message = "Hello!";
let age = 25;

const message = "GoodBye!"; //报错：Identifier 'message' has already been declared
const age = 30;
```

```javascript
const maxItems = 5;
maxItems = 6; //报错:'maxItems' is constant
```

### 用const声明对象

```javascript
const person = {
    name: "Nicholas"
};

person.name = "Greg";
console.log(person); //{name: "Greg"}

person = {
    name: "Greg"
}; //报错:'person' is constant
```

## 临时死区（Temporal Dead Zone）

```javascript
let condition = true;
if (condition) {
    console.log(typeof value); //报错:Cannot access 'value' before initialization
    let value = "blue";
}
```

由于`console.log(typeof value)`语句会抛出错误，因此用`let`定义并初始化变量`value`的语句不会执行。此时`value`还位于JavaScript社区所谓的"临时死区"（temporal dead zone）或TDZ中。虽然ECMASCRIPT标准并没有明确提到TDZ,但人们却常用它来描述`let`和`const`的不提升效果。

JavaScript引擎在扫描代码发现变量声明时，要么将它们提升至作用域顶部（遇到var声明），要么将声明放到TDZ中（遇到let和const声明）。访问TDZ中的变量会触发运行时错误。只有执行过变量声明语句后，变量才会从TDZ中移出，然后方可正常访问。

```javascript
console.log(typeof value); //undefined

let condition = true;
if (condition) {
    let value = "blue";
}
```

## 循环中的块作用域绑定

而在JavaScript中，由于var声明得到了提升，变量i在循环结束后仍可以访问。
```javascript
for (var i = 0;i < 10;i++) {
    //dosomething
}
console.log(i); //10
```

```javascript
for (let i = 0;i < 10;i++) {
    //dosomething
}
console.log(i); //报错： 'i' is not defined
```

### 循环中的函数

```javascript
var funcs = [];

for (var i = 0;i < 10;i++) {
    funcs.push(function() {
        console.log(i);
    });
}

funcs.forEach(function(func) {
    func();
});
//输出10次10
```

你预期的结果可能是输出数字0~9，但它却一连串输出了10次数字10。这是因为循环里的每次迭代同时共享着变量i，循环内部创建的函数全都保留了对相同变量的引用。循环结束时变量i的值为10，所有每次调用`console.log(i)`时就会输出数字10

为解决这个问题，开发者们在循环中使用立即调用函数表达式（`IIFE`），以强制生成计数器变量的副本，就像这样：

```javascript
var funcs = [];

for (var i = 0;i < 10;i++) {
    funcs.push((function(value) {
        return function() {
            console.log(value);
        }
    })(i))
}

funcs.forEach(function(func) {
    func();
});
//0
//1
//2
//3
//4
//5
//6
//7
//8
//9
```

在循环内部，IIFE表达式为接受的每一个变量i都创建了一个副本并存储为变量value.这个变量的值就是相应迭代创建的函数所使用的值，因此调用每个函数都会像从0到9循环一样得到期望的值。ECMASCRIPT6中的`let`和`const`提供的块级绑定让我们无须再这么折腾。

### 循环中的let声明

let声明模仿上述示例中IIFE所做的一切来简化循环过程，每次迭代循环都会创建一个新变量，并以之迭代中同名变量的值将其初始化。这意味着你彻底删除IIFE之后仍可得到预期中的结果，就像这样：

```javascript
var funcs = [];

for (let i = 0;i < 10;i++) {
    funcs.push(function() {
        console.log(i);
    });
}

funcs.forEach(function(func) {
    func();
});
//0
//1
//2
//3
//4
//5
//6
//7
//8
//9
```

```javascript
var funcs = [],
    object = {
        a: true,
        b: true,
        c: true
    };

for (let key in object) {
    funcs.push(function() {
        console.log(key);
    });
}

funcs.forEach(function(func) {
    func();
});

//a
//b 
//c
```

### 循环中const声明

ECMASCRIPT6标准中没有明确指明不允许在循环中使用const声明，然而，针对不同类型的循环它会表现出不同的行为。对于普通的for循环来说，可以在初始化变量时使用const，但是更改这个变量的值就会抛出错误，就像这样：

```javascript
var funcs = [];
for (const i = 0;i < 10;i++) {
    funcs.push(function() {
        console.log(i);
    });
}

//报错：'i' is constant
```

```javascript
var funcs = [],
    object = {
        a: true,
        b: true,
        c: true
    };

//不会产生错误
for (const key in object) {
    funcs.push(function() {
        console.log(key);
    });
}

funcs.forEach(function(func) {
    func();
});

//a
//b
//c
```

## 全局块作用域绑定

如果你在全局作用域中使用`let`和`const`,会在全局作用域下创建一个新的绑定，但该绑定不会添加为全局对象的属性。换句话说，用`let`和`const`不能覆盖全局变量，而只能屏蔽它。示例如下

```javascript
let RegExp = "Hello!";
console.log(RegExp); 
console.log(window.RegExp === RegExp); //false

const ncz = "Hi!";
console.log(ncz);
console.log("ncz" in window); //false
```

如果希望在全局对象下定义变量，仍然可以使用var。这种情况常见于在浏览器中跨`frame`或跨window访问代码。

## 块级绑定最佳实践的进化

默认使用`const`,只有确定需要改变变量的值时使用`let`。因为大部分变量的值在初始化后不应再改变，而预料外的变量值的改变是很多bug的源头。

## 小结

块级作用域绑定的`let`和`const`为JavaScript引入了词法作用域，他们声明的变量不会提升，而且只可以在声明这些变量的代码块中使用。

在声明前访问块级绑定会导致错误，因为绑定还在临时死区（TDZ）中。

`let`和`const`的行为很多时候与`var`一致。然而，他们在循环中的行为却不一样。在`for-in`和`for-of`循环中，`let`和`const`都会每次迭代时创建新绑定，从而使循环体内创建的函数可以访问到相应迭代的值，而非最后一次迭代后的值（像使用var那样）。let在for循环中同样如此，但在for循环中使用const声明则可能引发错误。

当前使用块级绑定的最佳实践是：`默认使用const,只有确定需要改变变量的值时使用let。这样就可以在某种程度上实现代码的不可变，从而防止某些错误的产生。`

