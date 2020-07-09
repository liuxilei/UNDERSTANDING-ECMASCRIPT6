# Symbol 和 Symbol 属性

在`Symbol`出现以前，人们一直通过属性名来访问所有属性，无论属性名由什么元素构成，全部通过一个字符串类型的名称来访问；私有名称原本是为了让开发者们创建非字符串属性名称而设计的，但是一般的技术无法检测这些属性的`私有名称`。

私有名称最终演变成了`ECMAScript 6`中的`Symbol`,本章将讲解如何有效地使用它。虽然通过`Symbol`可以为属性添加非字符串名称，但是其隐私性就被打破了。最终，新标准中将`Symbol`属性与对象中的其他属性分别分类。

## 创建 Symbol

```javascript
let firstName = Symbol();
let person = {};

person[firstName] = 'Nicholas';
console.log(person[firstName]);
```

**由于`Symbol`是原始值，因此调用`new Symbol()`会导致程序抛出错误。也可以执行`new Object(你的Symbol)`创建一个`Symbol`的实例，但目前尚不清楚这个功能何时可以使用**

`Symbol`函数接受一个可选参数，其可以让你添加一段文本描述即将创建的`Symbol`，这段描述不可用于属性访问，但是建议你在每次创建`Symbol`时都添加这样一段描述，以便于阅读代码和调试`Symbol`程序。

```javascript
let firstName = Symbol('first name');
let person = {};

person[firstName] = 'Nicholas';
console.log('first name' in person); //false
console.log(person[firstName]); //Nicholas
console.log(firstName); //Symbol(first name)
```

`Symbol`的描述被存储在内部的`[[Description]]`属性中，只有当调用`Symbol`的`toString()`方法时才可以读取这个属性。在执行`console.log()`时隐式调用了`firstName`的`toString()`方法，所以它的描述会被打印到日志中，但不能直接在代码里访问`[[Description]]`

## `Symbol`的辨识方法

`Symbol`是原始值，且`ECMAScript 6`同时扩展了`typeof`操作符，支持返回`Symbol`,所以可以用`typeof`来检测变量是否为`Symbol`类型。

```javascript
let symbol = Symbol('test symbol');
console.log(typeof symbol); //symbol
```

通过其他间接方式也可以检测变量是否为`Symbol`类型，但是`typeof`操作符是最准确也是你最应首选的检测方式。

## Symbol 的使用方法

所有使用可计算属性名的地方，都可以使用`Symbol`。前面我们看到的都是在括号中使用`Symbol`,事实上，`Symbol`也可以用于可计算对象字面量属性名、`Object.defineProperty()`方法和`Object.defineProperties()`方法的调用过程中。

```javascript
let fristName = Symbol('first name');

//使用一个可计算对象字面量属性
let person = {
    [fristName]: 'Nicholas',
};

//将属性设置为只读
Object.defineProperty(person, fristName, { writable: false });

let lastName = Symbol('last name');

Object.defineProperties(person, {
    [lastName]: {
        value: 'Zakas',
        writable: false,
    },
});

console.log(person[fristName]); //Nicholas
console.log(person[lastName]); //Zakas
```

## Symbol 共享体系

有时我们可能希望在不同的代码中共享同一个`Symbol`,例如，在你的应用中有两种不同的对象类型，但是你希望它们使用同一个`Symbol`属性来表示一个独特的标识符。一般而言，在很大代码库中或跨文件追踪`Symbol`非常困难而且容易出错，处于这些原因，`ECMAScript 6`提供了一个可以随时访问全局`Symbol`注册表。

如果想创建一个可共享的`Symbol`,要使用`Symbol.for()`方法。它只接受一个参数，也就是即将创建的`Symbol`的字符串标识符，这个参数同样也被用作`Symbol`的描述，就像这样：

```javascript
let uid = Symbol.for('uid');
let object = {};

object[uid] = '123456';

console.log(object[uid]); //123456
console.log(uid); //Symbol(uid)
```

`Symbol.for()`方法首先在全局`Symbol`注册表中搜索键为"uid"的`Symbol`是否存在，如果存在，直接返回已有的`Symbol`;否则，创建一个新的`Symbol`,并使用这个键在`Symbol`全局注册表中注册，随即返回新创建的`Symbol`。

后续如果再传入同样的键调用`Symbol.for()`会返回相同的`Symbol`,像这样：

```javascript
let uid = Symbol.for('uid');
let object = {
    [uid]: '12345',
};

console.log(object[uid]); //12345
console.log(uid); //Symbol(uid)

let uid2 = Symbol.for('uid');

console.log(uid === uid2); //true
console.log(object[uid2]); //12345
console.log(uid2); //Symbol(uid)
```

在这个示例中，uid 和 uid2 包含相同的`Symbol`并且可以互换使用。第一次调用`Symbol.for()`方法创建这个`Symbol`,第二次调用可以直接从`Symbol`的全局注册表中检索到这个`Symbol`.

还有一个与`Symbol`共享有关的特性：可以使用`Symbol.keyFor()`方法在`Symbol`全局注册表中检索与`Symbol`有关的键。举个例子：

```javascript
let uid = Symbol.for('uid');
console.log(Symbol.keyFor(uid)); //uid

let uid2 = Symbol.for('uid');
console.log(Symbol.keyFor(uid2)); //uid

let uid3 = Symbol('uid');
console.log(Symbol.keyFor(uid3)); //undefined
```

`Symbol`全局注册表是一个类似全局作用域的共享环境，也就是说你不能假设目前环境中存在哪些键。当使用第三方组件时，尽量使用`Symbol`键的命名空间以减少命名冲突。举个例子，`jQuery`的代码可以为所有键添加”jquery"前缀，就像"jquery.element"或其他类似的键。

## Symbol 与类型强制转换

自动转型是`JavaScript`中的一个重要语言特性，利用这个特性能够在特定场景下将某个数据强制转换为其他类型。然而，其他类型没有与`Symbol`逻辑等价的值，因而`Symbol`使用起来不是很灵活，尤其是不能将`Symbol`强制转换为字符串和数字类型，否则如果不小心将其作为对象属性，最终会导致不一样的执行结果。

在本章的示例中，我们使用`console.log()`方法来输出`Symbol`的内容，它会调用`Symbol`的`String()`方法并输出有用的信息。也可以像这样直接调用`String()`方法来获得相同得内容：

```javascript
let uid = Symbol.for('uid'),
    desc = String(uid);

console.log(desc); //Symbol(uid)
```

`String()`函数调用了`uid.toString()`方法，返回字符串类型得`Symbol`描述里的内容。但是，如果你尝试将`Symbol`与一个字符串拼接，会导致程序抛出错误：

```javascript
let uid = Symbol.for('uid'),
    desc = uid + ''; //报错：Cannot convert a Symbol value to a string
```

将`uid`与空字符串拼接，首先要将`uid`强制转换为一个字符串，而`Symbol`不可以被转换为字符串，故程序直接抛出错误。

同样，也不能将`Symbol`强制转换为数字类型。将`Symbol`与每一个数学运算符混合使用都会导致程序抛出错误，就像这样：

```javascript
let uid = Symbol.for('uid'),
    desc = uid / 2; //报错：index.js:2 Uncaught TypeError: Cannot convert a Symbol value to a number
```

## Symbol 属性检索

`Object.keys()`方法和`Object.getOwnPropertyNames()`方法可以检索对象中所有的属性名：前一个方法返回所有可枚举的属性名；后一个方法不考虑属性的可枚举性一律返回。然而为了保持`ECMAScript 5`函数的原有功能，这两个方法都不支持`Symbol`属性，而是在`ECMAScript 6`中添加一个`Object.getOwnProperty-Symbols()`方法来检索对象中的`Symbol`属性。

`Object.getOwnPropertySymbols()`方法的返回值是一个包含所有`Symbol`自有属性的数组，就像这样：

```javascript
let uid = Symbol.for('uid');
let object = {
    [uid]: '12345',
};

let symbols = Object.getOwnPropertySymbols(object);

console.log(symbols.length); //1
console.log(symbols[0]); //Symbol(uid)
console.log(object[symbols[0]]); //12345
```

## 通过 well-known Symbol 暴露内部操作

`ECMAScript 5`的一个中心主旨是将`JavaScript`中的一些"神奇"的部分暴露出来，并详尽定义了这些开发者们在当时模拟不了的功能。`ECMAScript 6`延续了这个传统，新标准中主要通过原型链上定义了与`Symbol`相关的属性来暴露更多的语言内部逻辑。

`ECMAScript 6`开放了以前`JavaScript`中常见的内部操作，并通过预定义一些`Well-known Symbol`来表示。每一个这类`Symbol`都是`Symbol`对象的一个属性，例如`Symbol.match`。

这些`well-known Symbol`包括：

-   `Symbol.hasInstance`一个在执行`instanceof`时调用的内部方法，用于检测对象的继承信息。
-   `Symbol.isConcatSpreadable` 一个布尔值，用于表示当传递一个集合作为`Array.prototype.concat()`方法的参数时，是否应该将集合内的元素规整到同一级别。
-   `Symbol.iterator` 一个返回迭代器的方法。
-   `Symbol.match` 一个调用`String.prototype.match()`方法时调用的方法，用于比较字符串。
-   `Symbol.replace` 一个在调用`String.prototype.replace()`方法时调用的方法，用于替换字符串的子串。
-   `Symbol.search` 一个在调用`String.prototype.search()`方法时调用的方法，用于在字符串中定位字串。
-   `Symbol.split` 一个在调用`String.prototype.split()`方法时调用的方法，用于分割字符串。
-   `Symbol.toPrimitive` 一个返回对象原始值的方法
-   `Symbol.toStringTag` 一个在调用`Object.prototype.toString()`方法时使用的字符串，用于创建对象描述。
-   `Symbol.unscopables` 一个定义了一些不被`with`语法引用的对象属性名称的对象集合。

## Symbol.hasInstance 方法

每一个函数中都有一个`Symbol.hasInstance`方法，用于确定对象是否为函数的实例。该方法在`Function.prototype`中定义，所以所有函数都继承了`instanceof`属性的默认行为。为了确保`Symbol.hasInstance`不会被意外重写，该方法被定义为不可写、不可配置并且不可枚举。

`Symbol.hasInstance`方法只接受一个参数，即要检查的值。如果传入的值是函数的实例，则返回`true`。为了帮助你更好地理解`Symbol.hasInstance`的运行机制，我们看以下这行代码：

```javascript
obj instanceof Array;
```

以上这行代码等价于下面这行：

```javascript
Array[Symbol.hasInstance](obj);
```

本质上，`ECMAScipt 6`只是将`instanceof`操作符重新定义为此方法的简写语法。**现在引入方法调用后，就可以随意改变`instanceof`的运行方式了**。

举个例子，假设你想定义一个无实例的函数，就可以将`Symbol.hasInstance`的返回值硬编码为`false`:

```javascript
function MyObject() {
    //空函数
}

Object.defineProperty(MyObject, Symbol.hasInstance, {
    value: function () {
        return false;
    },
});

let obj = new MyObject();
console.log(obj instanceof MyObject); //false
```

只有通过`Object.defineProperty()`方法才能够改写一个不可写属性，上面的示例调用这个方法来改写`Symbol.hasInstance`，为其定义一个总是返回`false`的新函数，即使`obj`实际上确实是`MyObject`类的实例，在调用过`Object.defineProperty()`方法之后，`instanceof`运算符返回的也是`false`。

当然，也可以基于任意条件，通过值检查来确定被检测的是否为实例。举个例子，可以将`1~100`的数字定义为一个特殊数字类型的实例，具体实现的代码如下：

```javascript
function SpecialNumber() {
    // 空函数
}

Object.defineProperty(SpecialNumber, Symbol.hasInstance, {
    value: function (v) {
        return v instanceof Number && v >= 1 && v <= 100;
    },
});

var two = new Number(2),
    zero = new Number(0);

console.log(two instanceof SpecialNumber); //true
console.log(zero instanceof SpecialNumber); //false
```

在这段代码中定义了一个`Symbol.hasInstance`方法，当值为`Number`的实例且其值在`1~100`之间时返回`true`。所以即使`SpecialNumber`函数和变量`two`之间没有直接关系，变量`two`也会被确认为`SpecialNumber`的实例。注意，如果要触发`Symbol.hasInstanceof`调用，`instanceof`的左操作数必须是一个对象，如果左操作数为非对象会导致`instanceof`总是返回`false`。

**也可以重写所有内建函数（例如 Date 和 Error 函数）默认的 Symbol.hasInstance 属性。但是这样做的后果是代码的运行结果变得不可预期且有可能令人感到困惑，所以我们不推荐你这样做，最好的做法是，只在必要情况下改写你自己声明的函数的 Symbol.hasInstanceof 属性。**

## Symbol.isConcatSpreadable 属性

JavaScipt 数组的`concat()`方法被设计用于拼接两个数组，使用方法如下：

```javascript
let colors1 = ['red', 'green'],
    colors2 = colors1.concat(['blue', 'black']);

console.log(colors2.length); //4
console.log(colors2); //["red", "green", "blue", "black"]
```

这段代码将数组`colors1`与一个临时数组拼接并创建新数组`colors2`,这个数组中包含前两个数组中的所有元素。`concat()`方法也可以接受非数组参数，此时该方法只会将这些参数逐一添加到数组末尾，就像这样：

```javascript
let colors1 = ['red', 'green'],
    colors2 = colors1.concat(['blue', 'black'], 'brown');

console.log(colors2.length); //5
console.log(colors2); //["red", "green", "blue", "black", "brown"]
```

在这段代码中，额外为`concat()`方法传入一个字符串参数"brown"作为数组 colors2 的第 5 个元素。为什么数组参数就要区别对待呢？`JavaScript`规范声明，凡是传入了数组参数，就会自动将它们分解为独立元素。在`ECMAScript 6`标准以前，我们根本无法调整这个特性。

`Symbol.isConcatSpreadable`属性是一个布尔值，如果该属性值为`true`，则表示对象有`length`属性和数字键，故它的数值型属性值应该被独立添加到`concat()`调用的结果中。它与其他`well-known Symbol`不同的是，这个`Symbol`属性默认情况下不会出现在标准对象中，它只是一个可选属性，用于增强作用于特定对象类型的`concat()`方法的功能，有效简化其默认特性。可以通过以下方法，定义一个在`concat()`调用中与数组行为相近的新类型：

```javascript
let collection = {
    0: 'Hello',
    1: 'world',
    length: 2,
    [Symbol.isConcatSpreadable]: true,
};

let message = ['Hi'].concat(collection);

console.log(message); //["Hi", "Hello", "world"]
```

在这个示例中，定义了一个类数组对象`collection`:它有一个`length`属性，还有两个数字键，`Symbol.isConcatSpreadable`属性值为`true`表明属性值应当作为独立元素添加到数组中。将`collection`传入`concat()`方法后，最后生成的数组中的元素分别是"hi"、"Hello"及"world"。

也可以在派生数组子类中将`Symbol.isConcatSpreadable`属性值设置为`false`,从而防止元素在调用`concat()`方法时被分解。

## Symbol.match、Symbol.replace、Symbol.search 和 Symbol.split 属性

-   match(regex) 确定给定字符串是否匹配正则表达式 regex
-   replace(regex, replacement) 将字符串中匹配正则表达式 regex 的部分替换为 replacement
-   search(regex) 在字符串中定位匹配正则表达式 regex 的位置索引
-   split(regex) 按照匹配正则表达式 regex 的元素将字符串分切，并将结果存入数组中

在`ECMAScript 6`以前，以上 4 个方法无法使用开发者自定义的对象来替代正则表达式进行字符串匹配。而在`ECMAScript 6`中，定义了与上述 4 个方法相对应的 4 个`Symbol`,将语言内建的`RegExp`对象的原生特性完全外包出来。

`Symbol.match`、`Symbol.replace`、`Symbol.search`和`Symbol.split`这 4 个`Symbol`属性表示`match()`、`replace()`、`search()`和`split()`方法的第一个参数应该调用的正则表达式参数的方法，它们被定义在`RegExp.prototype`中，是字符串方法应该使用的默认实现。

了解了原理以后，我们可以使用类似于正则表达式的方式创建一个与字符串方法一起使用的对象，为此，可以在代码中使用以下`Symbol`函数：

-   **Symbol.match** 接受一个字符串类型的参数，如果匹配成功则返回匹配元素的数组，否则返回`null`
-   **Symbol.replace** 接受一个字符串类型的参数和一个替换用的字符串，最终依然返回一个字符串
-   **Symbol.search** 接受一个字符串参数，如果匹配到内容，则返回数字类型的索引位置，否则返回-1
-   **Symbol.split** 接受一个字符串参数，根据匹配内容将字符串分解，并返回一个包含分解后片段的数组。

如果可以在对象中定义这些属性，即使不使用正则表达式和以正则表达式为参的方法也可以在对象中实现模式匹配。下面的示例将展示`Symbol`的实际用法：

```javascript
// 实际上等价于/^.{10}$/

let hasLengthOf10 = {
    [Symbol.match]: function (value) {
        return value.length === 10 ? [value] : null;
    },

    [Symbol.replace]: function (value, replacement) {
        return value.length === 10 ? replacement : value;
    },

    [Symbol.search]: function (value) {
        return value.length === 10 ? 0 : -1;
    },

    [Symbol.split]: function (value) {
        return value.length === 10 ? [,] : [value];
    },
};

let message1 = 'Hello world', //11个字符
    message2 = 'Hello John'; //10个字符

let match1 = message1.match(hasLengthOf10),
    match2 = message2.match(hasLengthOf10);

console.log(match1); //null
console.log(match2); //["Hello John"]

let replace1 = message1.replace(hasLengthOf10),
    replace2 = message2.replace(hasLengthOf10);

console.log(replace1); //Hello world
console.log(replace2); //undefined

let search1 = message1.search(hasLengthOf10),
    search2 = message2.search(hasLengthOf10);

console.log(search1); //-1
console.log(search2); //0

let split1 = message1.split(hasLengthOf10),
    split2 = message2.split(hasLengthOf10);

console.log(split1); //["Hello world"]
console.log(split2); //[,]
```

## Symbol.toPrimitive 方法

在`JavaScript`引擎中，当执行特定操作时，经常会尝试将对象转换到相应的原始值，例如，比较一个字符串和一个对象，如果使用双等号(==)运算符，对象会在比较操作符执行前被转换为一个原始值。到底使用哪一个原始值以前是由内部操作决定的，但在`ECMAScript 6`的标准中，通过`Symbol.toPrimitive`方法可以更改那个暴露出来的值。

`Symbol.toPrimitive`方法被定义在每一个标准类型的原型上，并且规定了当对象被转换为原始值时应当执行的操作。每当执行原始值转换时，总会调用`Symbol.toPrimitive`方法并传入一个值作为参数，这个值在规范中被称作类型提示（hint）。类型提示参数的值只有三种选择：`"number"`、`"string"`或`"default"`,传递这些参数时，`Symbol.toPrimitive`返回的分别是：数字、字符串或无类型偏好的值。

对于大多数标准对象，数字模式有以下特性，根据优先级的顺序排列如下：

1. 调用`valueOf()`方法，如果结果为原始值，则返回。
2. 否则，调用`toString()`方法，如果结果为原始值，则返回。
3. 如果再无可选值，则抛出错误。

同样，对于大多数标准对象，字符串模式有以下优先级顺序：

1. 调用`toString()`方法，如果结果为原始值，则返回。
2. 否则，调用`valueOf()`方法，如果结果为原始值，则返回。
3. 如果再无可选值，则抛出错误。

在大多数情况下，标准对象会将默认模式按数字模式处理（除了 Date 对象，在这种情况下，会将默认模式按字符串模式处理）。如果自定义`Symbol.toPrimitive`方法，则可以覆盖这些默认的强制转换特性。

如果要覆写默认的转换特性，可以将函数的`Symbol.toPrimitive`属性赋值为一个新的函数，举个例子：

```javascript
function Temperature(degress) {
    this.degress = degress;
}

Temperature.prototype[Symbol.toPrimitive] = function (hint) {
    switch (hint) {
        case 'string':
            return this.degress + '\u00b0'; //degress symbol
        case 'number':
            return this.degress;
        case 'default':
            return this.degress + ' degress';
    }
};

var freezing = new Temperature(32);

console.log(freezing + '! '); //32 degress!
console.log(freezing / 2); //16
console.log(String(freezing)); //32°
```

这段脚本定义了一个`Temperature`构造函数并且覆写了它原型上默认的`Symbol.toPrimitive`方法。新的方法根据参数`hint`指定的模式返回不同的值（参数 hint 由 JavaScript 引擎传入）。在字符串模式下，`Temperature()`函数返回`Unicode`编码的温度符号；在数字模式下，返回相应的数值；在默认模式下，将`degrees`这个单词添加到数字后。

每一条`console.log()`语句将触发不同的`hint`参数值，+运算符触发默认模式，`hint`被设置为`default`;运算符触发数字模式，`hint`被设置为`"number"`;`String()`函数触发字符串模式，`hint`被设置为`"string"`。针对三种模式返回不同的值是可行的，但是更常见的做法是，将默认模式设置成与字符串模式或数字模式相同的处理逻辑。

## Symbol.toStringTag 属性

`JavaScript`中有很多有趣的问题，其中一个是有时会同时存在多个全局执行环境，比如在`Web`浏览器中，如果一个页面包含`iframe`标签，就会分别为页面和`iframe`内嵌页面生成两个全局执行环境。在大多数环境下，由于数据可以在不同环境间传递，不太需要担心；但是如果对象在不同对象间传递之后，你想确认它的类型呢？麻烦来了。

典型案例是从`iframe`向页面中传递一个数组，或者执行反向操作。而在`ECMAScript 6`的术语中，`iframe`和它的外围页面分别代表不同的领域（realm），而领域指的则是`JavaScript`的执行环境。所以每一个领域都有自己的全局作用域，有自己的全局对象，在任何领域中创建的数组，都是一个正规的数组。然而，如果将这个数组传递到另一个领域中，`instanceof Array`语句的检测结果会返回`false`,此时`Array`已是另一个领域的构造函数，显然被检测的数组不是由这个构造函数创建的。

#### 针对类型识别问题的解决方案

当面对数组类型识别这样的问题时，开发者们很快就找到了一个很好的解决方案。它们发现，如果调用对象中标准的`toString()`方法，每次都会返回预期的字符串。于是，许多`JavaScript`库开始引入这样的一段代码：

```javascript
function isArray(value) {
    return Object.prototype.toString.call(value) === '[object Arraty]';
}

console.log(isArray([]));
```

尽管这个解决方案看起来可能有点绕，但是由于在浏览器中识别数组而言效果相当不错。但不应当在数组上直接使用`toString()`方法来识别对象，虽然返回结果也是一个字符串，但字符串的内容是由数组元素拼接而成的。调用`Object.prototype`的`toString()`方法恰巧能达到目的，在返回的结果中，引入了一个内部定义的名称`[[Class]]`。开发者们可能通过对象的这个方法来确定在当前`JavaScript`环境中该对象的数据类型是什么。

开发者们很快意识到，由于无法改变这个特性，但是可以用相同的方法来区分原生对象和开发者自建的对象，最重要的案例莫过于`ECMAScript 5`中的`JSON`对象了。

在`ECMAScript 5`以前，许多开发者们曾使用`Douglas Crockford`的`json2.js`来创建全局`JSON`对象后，就有必要区分`JSON`对象是`JavaScript`环境本身提供的还是由其他的库植入的。许多开发者用与上面展示的`isArray()`函数相同的方法创建了如下函数：

```javascript
function supportsNativeJSON() {
    return typeof JSON !== 'undefined' && Object.prototype.toString.call(JSON) === '[object JSON]';
}
```

`Object.prototype`能跨越`iframe`的边界来识别数组，使用类似特性就能区分原生与自建`JSON`。原生`JSON`对象返回的是`[object JSON]`,而自建的则返回`[object Object]`。事实上，这个方法后来演变为识别原生对象的标准方法。

### 在`ECMAScript 6`中定义对象字符串标签

`ECMAScript 6`重新定义了原生对象过去的状态，通过`Symbol.toStringTag`这个`Symbol`改变了调用`Object.prototype.toString()`时返回的身份标识。这个`Symbol`所代表的属性在每一个对象中都存在，其定义了调用对象的`Object.prototype.toString.call()`方法时返回的值。对于数组，调用了那个函数返回的值通常是`"Array"`,它正是存储在对象的`Symbol.toStringTag`属性中。

同样地，可以为你自己的对象定义`Symbol.toStringTag`的值：

```javascript
function Person(name) {
    this.name = name;
}

Person.prototype[Symbol.toStringTag] = 'Person';

var me = new Person('Nicholas');

console.log(me.toString()); //[object Person]
console.log(Object.prototype.toString.call(me)); //[object Person]
```

在此示例中，在`Person.prototype`上定义了一个`Symbol.toStringTag`属性作为创建字符串表示名称时的默认值。`Person.prototype`继承了`Object.prototype.toString()`方法，所以调用`me.toString()`方法时也使用了`Symbol.toStringTag`的返回值。然而，你仍然可以定义自己的`toString()`方法，这不会影响`Object.prototype.toString.call()`方法的使用，但却可以提供一个不同的值。这段代码看起来是这样的：

```javascript
function Person(name) {
    this.name = name;
}

Person.prototype[Symbol.toStringTag] = 'Person';

Person.prototype.toString = function () {
    return this.name;
};

var me = new Person('Nicholas');

console.log(me.toString()); //Nicholas
console.log(Object.prototype.toString.call(me)); //[object Person]
```

除非另有说明，所有对象都会从`Object.prototype`继承`Symbol.toStringTag`这个属性，且默认的属性值为`"Object"`。

对于开发者定义的对象来说，不限制`Symbol.toStringTag`属性的值的范围。例如，语言本身不会阻止你使用`Array`作为`Symbol.toStringTag`属性的值，就像这样：

```javascript
function Person(name) {
    this.name = name;
}

Person.prototype[Symbol.toStringTag] = 'Array';

Person.prototype.toString = function () {
    return this.name;
};

var me = new Person('Nicholas');

console.log(me.toString()); //Nicholas
console.log(Object.prototype.toString.call(me)); //[object Array]
```

在这段代码中，调用`Object.prototype.toString()`方法得到的结果是`"object Array"`,跟你从一个真实数组中得到的结果完全一样。这也就意味着，`Object.prototype.toString()`不是一个十分可靠的识别对象类型的方法。

同样可以修改原生对象的字符串标签，只需要修改对象原型上`Symbol.toStringTag`属性的值即可，就像这样：

```javascript
Array.prototype[Symbol.toStringTag] = 'Magic';

var values = [];

console.log(Object.prototype.toString.call(values)); //[object Magic]
```
