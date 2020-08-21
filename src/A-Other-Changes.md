# ECMAScirpt 6 中较小的改动

除了本书前面章节介绍的较大的变化外，`ECMAScript 6`还包含了其他一些来辅助优化`JavaScript`的较小的改动。这些改动包括简化整数的使用，添加新的计算方法，调整`Unicode`标识符，以及将`__proto__`属性正式化。本附录将讲解这些改动。

## 使用整数

`JavaScript`使用了`IEEE 754`编码系统来表示整数和浮点数，多年以来这给开发者造成了不少混乱。这门语言煞费苦心地帮助开发者解决数字编码的问题，但是问题仍会不时地发生。`ECMAScript 6`力图通过降低整数的识别和使用的难度来解决这些问题。

### 识别整数

`ECMAScript 6`添加了`Number.isInteget()`方法来确定一个值是否为`JavaScript`整数类型。虽然`JavaScript`使用`IEEE 754`编码系统来表示两种类型的数字，但浮点数与整数的存储不同，`Number.isInteger()`方法则利用了这种存储的差异，当调用该方法并传入一个值时，`JavaScript`引擎会查看该值的底层表示方式来确定该值是否为整数。因此，如果有些数字看起来像浮点数，却存储为整数，`Number.isInteger()`方法会返回`true`。例如：

```javascript
console.log(Number.isInteger(25)); //true
console.log(Number.isInteger(25.0)); //true
console.log(Number.isInteger(25.1)); //false
```

这段代码将`25`和`25.0`传入`Number.isInteger()`方法，尽管后者看起来像是一个浮点数，但两次调用返回的都是`true`。在`JavaScript`中，只给数字添加小数点不会让整数变为浮点数，此处的`25.0`确实是`25`，所以会按照整数的形式存储。但是，由于数字`25.1`含有小数部分，因此它会按照浮点数的形式存储。

## 安全整数

`IEEE 754`只能准确地表示-2^53 ~ 2^53 之间地整数，在这个"安全"范围之外，则通过重用二进制来表示多个数值。所以在问题尚未凸显时，`JavaScript`只能安全地表示`IEEE 754`范围内地整数。例如，请看以下这段代码：

```javascript
console.log(Math.pow(2, 53)); //907199254740992
console.log(Math.pow(2, 53) + 1); //9007199254740992
```

此示例中没有误输入，两个不同的数字确实是由同一个`JavaScript`整数来表示地的。离安全范围越远，这种情况越常见。

`ECMAScript 6`还引入了`Number.isSafeInteger()`方法来识别语言可以准确表示的整数，添加了`Number.MAX_SAFE_INTEGER`属性和`Number.MIN_SAFE_INTEGER`属性来分别表示整数范围的上限与下限。`Number.isSafeInteger()`方法可以用来确保一个值是整数，并且落在整数值的安全范围内，如下例所示：

```javascript
var inside = Number.MAX_SAFE_INTEGER,
    outside = inside + 1;

console.log(Number.isInteger(inside)); //true
console.log(Number.isSafeInteger(inside)); //true

console.log(Number.isInteger(outside)); //true
console.log(Number.isSafeInteger(outside)); //false
```

数字`inside`是最大的安全整数，所以将它传入`Number.isInteger()`方法和`Number.isSafeInteger()`方法返回的都是`true`。数字`outside`是第一个有问题的整数值，虽然它仍是一个整数，但却不是一个安全整数。大多数情况下，当你在`JavaScript`中进行整数计算或比较运算时，只希望处理安全的整数，因此，用`Number.isSafeInteger()`方法来验证输入是个好主意。

## 新的 Math 方法

`ECMAScript 6`引入定型数组来增强游戏和图形体验，此举让`JavaScript`引擎可以进行更有效的数学计算。但是诸如`asm.js`的优化策略，一方面利用一部分`JavaScript`来提升性能，但是也需要更多信息才能以最快的速度执行计算，例如，基于硬件的操作远比基于软件的操作要快得多，能够区分 32 位整数与 64 位浮点数对这些操作来说至关重要。因此，`ECMAScript 6`为`Math`对象添加了几种方法，以提高通常的数学计算的速度，同时可以提高密集计算应用程序的总体速度。

## Unicode 标识符

`ECMAScript 6`对`Unicode`的支持比早期版本的`JavaScript`更好，并且更改了可用做标识符的字符。在`ECMAScript 5`中，可以将`Unicode`转义序列用作标识符，例如：

```javascript
//在ECMAScript 5和6中均合法
var a = 'abc';

console.log(a); //"abc"

//等价于
console.log(a); //"abc"
```

在此示例中，可以通过`var`语句之后的`\u0061`或`a`来访问变量。在`ECMAScript 6`中，还可以使用`Unicode`码位转义序列来作为标识符，如下所示：

```javascript
//在ECMAScript 5和6中均合法
var a = 'abc';

console.log(a); //"abc"

//等价于
console.log(a); //"abc"
```

这个示例只是用等效的码位替换了`\u0061`,除此之外与之前的示例代码完全一样。

## 正式化**proto**属性

`__proto__`不是一个新属性，即使在`ECMAScript 5`以前，几个`JavaScript`引擎就已实现该自定义属性，其可用于获取和设置`[[Prototype]]`属性。实际上，`__proto__`是`Object.getPrototypeOf()`方法和`Object.setPrototypeOf()`方法的早期实现。指望所有`JavaScript`引擎删除此属性是不现实的（多个流行的`JavaScript`库均使用了`__proto__`），所以在`ECMAScript6`也正式添加了`__proto__`特性。但正式标准出现在`ECMA-262`附录 B 中，并附加一段警告：

_这些特性被认为不属于`ECMAScript`语言核心的一部分，在编写新的`ECMAScript`代码时，程序员不应使用这些功能和特性，也不应假定它们是存在的。除非在`Web`浏览器中或者需要像`Web`浏览器一样执行遗留的`ECMAScript`代码，否则不鼓励`ECMAScript`实现这些功能。_

`ECMAScript`标准建议使用`Object.getPrototypeOf()`方法和`Object.setPrototypeOf()`方法，缘于`__proto__`具有以下特性：

-   只能在对象字量中指定一次`__proto__`，如果指定两个`__proto__`属性则会抛出错误，这是唯一具有该限制的对象字面量属性。
-   可计算形式的`["__proto__"]`的行为类似于普通属性，不会设置或返回当前对象的原型，在与对象字面量属性相关的所有规则中，可计算形式与非计算形式一般是等价的，只有`proto`例外。

尽管应该避免使用`__proto__`属性，但是需要注意规范定义该属性的方式。在`ECMAScript 6`引擎中，`Object.prototype.__proto__`被定义为一个访问器属性，其`get`方法会调用`Object.setPrototypeOf()`方法。因此，使用`__proto__`和使用`Object.getPrototypeOf()`或`Object.setPrototypeOf()`方法的区别在于，`__proto__`可以直接设置对象字面量的原型。以下这段代码展示了二者的区别。

```javascript
let person = {
    getGreeting() {
        return 'Hello';
    },
};

let dog = {
    getGreeting() {
        return 'Woof';
    },
};

//原型是person
let friend = {
    __proto__: person,
};

console.log(friend.getGreeting()); //Hello
console.log(Object.getPrototypeOf(friend) === person); //true
console.log(friend.__proto__ === person); //true

//将原型设置为dog
friend.__proto__ = dog;
console.log(friend.getGreeting()); //Woof
console.log(friend.__proto__ === dog); //true
console.log(Object.getPrototypeOf(friend) === dog); //true
```

此示例没有通过调用`Object.create()`方法来创建`friend`对象，而是创建一个标准对象字面量，并将一个值赋给`__proto__`属性。而另一方面，当使用`Object.create()`方法创建对象时，必须为对象的任意附加属性指定完整的属性描述符。
