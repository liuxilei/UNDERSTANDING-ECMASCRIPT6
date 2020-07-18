# 迭代器(Iterator)和生成器(Generator)

用循环语句迭代数据时，必须要初始化一个变量来记录每一次迭代在数据集合中的位置，而许多编程语言中，已经开始通过程序化的方法用迭代器对象返回迭代过程中集合的每一个元素。

迭代器的使用可以极大地简化数据操作，于是`ECMAScript 6`也向`JavaScript`中添加了这个迭代器特性。

## 循环语句的问题

```javascript
var colors = ['red', 'green', 'blue'];
for (var i = 0, len = colors.length; i < len; i++) {
    console.log(colors[i]);
}
```

虽然循环语句的语法简单，但是如果将多个循环嵌套则需要追踪多个变量，代码的复杂度会大大增加，一不小心就错误使用了其他`for`循环的跟踪变量，从而导致程序出错。迭代器的出现旨在消除这种复杂性并减少循环中的错误。

## 什么是迭代器

迭代器是一种特殊对象，它具有一些专门为迭代过程设计的专有接口，所有的迭代器对象都有一个`next()`方法，每次调用都返回一个结果对象。结果对象有两个属性：一个是`value`,表示下一个将要返回的值；另一个是`done`,它是一个布尔类型的值，当没有更多可返回数据时返回`true`。迭代器还会保存一个内部指针，用来指向当前集合中值的位置，每调用依次`next()`方法，都会返回下一个可用的值。

如果在最后一个值返回后调用`next()`方法，那么返回的对象中属性`done`的值为`true`,属性`value`则包含迭代器最终返回的值，这个返回值不是数据集的一部分，它与函数的返回值类似，是函数调用过程中最后一次给调用者传递信息的方法，如果没有相关数据则返回`undefined`。

了解了这些以后，我们用`ECMAScript 5`的语法创建一个迭代器：

```javascript
function createIterator(items) {
    var i = 0;
    return {
        next: function () {
            var done = i >= items.length;
            var value = !done ? items[i++] : undefined;

            return {
                done: done,
                value: value,
            };
        },
    };
}

var iterator = createIterator([1, 2, 3]);

console.log(iterator.next()); //{done: false, value: 1}
console.log(iterator.next()); //{done: false, value: 2}
console.log(iterator.next()); //{done: false, value: 3}
console.log(iterator.next()); //{done: true, value: undefined}

//之后所有的调用都会返回相同内容
console.log(iterator.next()); //{done: true, value: undefined}
```

## 什么是生成器

生成器是一种返回迭代器的函数，通过`function`关键字后的星号（`*`）来表示，函数中会用到新的关键字`yield`。星号可以紧挨着`function`关键字，也可以在中间添加一个空格，就像这样：

```javascript
//生成器

function* createIterator() {
    yield 1;
    yield 2;
    yield 3;
}

//生成器的调用方式与普通函数相同，只不过返回的是一个迭代器
let iterator = createIterator();

console.log(iterator.next().value === 1);
console.log(iterator.next().value === 2);
console.log(iterator.next().value === 3);
```

在这个示例中，`createIterator()`前的星号表明它是一个生成器；`yield`关键字也是`ECMAScript 6`的新特性，可以通过它来指定调用迭代器的`next()`方法时的返回值及返回顺序。生成迭代器后，连续 3 次调用它的`next()`方法返回 3 个不同的值，分别是 1、2 和 3。生成器的调用过程与其他函数一样，最终返回的是创建好的迭代器。

生成器函数最有趣的部分大概是，每当执行完一条`yield`语句后函数就会自动停止执行。举个例子，在上面这段代码中，执行完语句`yield 1`之后，函数便不再执行其他任何语句，直到再次调用迭代器的`next()`方法才会继续执行`yield 2`语句。生成器函数的这种中止函数执行的能力有很多有趣的应用，我们将在本章后面"高级迭代器功能"一节中继续讲解它的应用。

使用`yield`关键字可以返回任何值或表达式，所以可以通过生成器函数批量地给迭代器添加元素。例如，可以在循环中使用`yield`关键字：

```javascript
function* createIterator() {
    for (let i = 0; i < items.length; i++) {
        yield items[i];
    }
}

let iterator = createIterator([1, 2, 3]);

console.log(iterator.next()); //{value: 1, done: false}
console.log(iterator.next()); //{value: 2, done: false}
console.log(iterator.next()); //{value: 3, done: false}
console.log(iterator.next()); //{value: undefined, done: true}

//之后所有的调用都会返回相同内容
console.log(iterator.next()); //{value: undefined, done: true}
```

生成器函数是`ECMAScript 6`中的一个重要特性，可以将其用于所有支持函数使用的地方。

### yield 的使用限制

`yield`关键字只可在生成器内部使用，在其他地方使用会导致程序抛出语法错误，即便在生成器内部的函数里使用也是如此：

```javascript
function *createIterator(items) {
    items.forEach(function(item) {
        //语法错误
        yield item + 1;
    });
}
```

从字面上看，`yield`关键字确实在`createIterator()`函数内部，但是它与`return`关键字一样，二者都不能穿透函数边界。嵌套函数中的`return`语句不能用做外部函数的返回语句，而此处嵌套函数中的`yield`语句会导致程序抛出语法错误。

### 生成器函数表达式

也可以通过函数表达式来创建生成器，只需在`function`关键字和小括号中间添加一个星号(`*`)即可：

```javascript
let createIterator = function* (items) {
    for (let i = 0; i < items.length; i++) {
        yield items[i];
    }
};

let iterator = createIterator([1, 2, 3]);

console.log(iterator.next()); //{value: 1, done: false}
console.log(iterator.next()); //{value: 2, done: false}
console.log(iterator.next()); //{value: 3, done: false}
console.log(iterator.next()); //{value: undefined, done: true}

//之后所有的调用都会返回相同内容
console.log(iterator.next()); //{value: undefined, done: true}
```

在这段代码中，`createIterator()`是一个生成器函数表达式，而不是一个函数声明。由于函数表达式是匿名的，因此星号直接放在`function`关键字和小括号之间。此外，这个示例基本与前例相同，使用也是`for`循环。

**不能用箭头函数来创建生成器**

### 生成器对象的方法

由于生成器本身就是函数，因而可以将它们添加到对象中。例如，在`ECMAScript 5`风格的对象字面量中，可以通过函数表达式来创建生成器，就像这样：

```javascript
let o = {
    createIterator: function* (items) {
        for (let i = 0; i < items.length; i++) {
            yield items[i];
        }
    },
};

let iterator = o.createIterator([1, 2, 3]);
```

也可以用`ECMAScript 6`的函数方法的简写方式来创建生成器，只需在函数名前添加一个星号（`*`）。

```javascript
let o = {
    *createIterator(items) {
        for (let i = 0; i < items.length; i++) {
            yield items[i];
        }
    },
};

let iterator = o.createIterator([1, 2, 3]);
```

这些示例使用了不同于之前的语法，但它们的功能实际上是等价的。在简写版本中，由于不使用`function`关键字来定义`createIterator()`方法，因此尽管可以在星号和方法名之间留白，但我们还是将星号紧贴在方法名之前。

## 可迭代对象和 for-of 循环

可迭代对象具有`Symbol.iterator`属性，是一种与迭代器密切相关的对象。`Symbol.iterator`通过指定的函数可以返回一个作用于附属对象的迭代器。在`ECMAScript 6`中，所有的集合对象（数组、`Set`集合及`Map`集合）和字符串都是可迭代对象，这些对象中都有默认的迭代器。`ECMAScript`中新加入的特性`for-of`循环需要用到可迭代对象的这些功能。

**由于生成器默认会为`Symbol.iterator`属性赋值，因此所有通过生成器创建的迭代器都是可迭代对象。**

在本章一开始，我们曾提到过循环内部索引跟踪的相关问题，要解决这个问题，需要两个工具：一个是迭代器，另一个是`for-of`循环。如此一来，便不需要再跟踪整个集合的索引，只需关注集合中要处理的内容。

`for-of`循环每执行一次都会调用可迭代对象的`next()`方法，并将迭代器返回的结果对象的`value`属性存储再一个变量中，循环将持续执行到这一过程直到返回对象的`done`属性的值为`true`。这里有个示例：

```javascript
let values = [1, 2, 3];

for (let num of values) {
    console.log(num);
}

//1
//2
//3
```

这段`for-of`循环的代码通过调用`values`数组的`Symbol.iterator`方法来获取迭代器，这一过程是在`JavaScript`引擎背后完成的。随后迭代器的`next()`方法被多次调用，从而返回对象的`value`属性读取值并存储在变量`num`中，依次为 1、2 和 3，当结果对象的`done`属性值为`true`时循环退出，所有`num`不会被赋值为`undefined`。

如果只需迭代数组或集合中的值，用`for-of`循环代替`for`循环是个不错的选择。相比传统的`for`循环，`for-of`循环的控制条件更简单，不需要追踪复杂的条件，所有更少出错。

**如果将`for-of`语句用于不可迭代对象、null 或 undefined 将会导致程序抛出错误。**

### 访问默认迭代器

可以通过`Symbol.iterator`来访问对象默认的迭代器，就像这样：

```javascript
let values = [1, 2, 3];
let iterator = values[Symbol.iterator]();

console.log(iterator.next()); //{value: 1, done: false}
console.log(iterator.next()); //{value: 2, done: false}
console.log(iterator.next()); //{value: 3, done: false}
console.log(iterator.next()); //{value: undefined, done: true}
```

在这段代码中，通过`Symbol.iterator`获取了数组`values`的默认迭代器，并用它遍历数组中的元素。在`JavaScript`引擎中执行`for-of`循环语句时也会有类似的处理过程。

由于具有`Symbol.iterator`属性的对象都有默认的迭代器，因此可以用它来检测对象是否为可迭代对象。

```javascript
function isIterator(object) {
    return typeof object[Symbol.iterator] === 'function';
}

console.log(isIterator([1, 2, 3]));
console.log(isIterator('Hello'));
console.log(isIterator(new Map()));
console.log(isIterator(new Set()));
console.log(isIterator(new WeakMap()));
console.log(isIterator(new WeakSet()));
```

这里的`isIterator()`函数可以检查指定对象中是否存在默认的函数类型迭代器，而`for-of`循环在执行前也会做相似的检查。

截止目前，本节的示例已经展示了如何使用内建的可迭代对象类型的`Symbol.iterator`,当前，也可以使用`Symbol.iterator`来创建你自己的迭代器。

### 创建可迭代对象

默认情况下，开发者定义的对象都是不可迭代对象，但如果给`Symbol.iterator`属性添加一个生成器，则可以将其变为可迭代对象，例如：

```javascript
let collection = {
    items: [],
    *[Symbol.iterator]() {
        for (let item of this.items) {
            yield item;
        }
    },
};

collection.items.push(1);
collection.items.push(2);
collection.items.push(3);

for (let x of collection) {
    console.log(x);
}

//1
//2
//3
```

在这个示例中，先创建一个生成器（注意，星号仍然在属性名前）并将其赋值给对象的`Symbol.iterator`属性来创建默认的迭代器；而在生成器中，通过`for-of`循环迭代`this.items`并用`yield`返回每一个值。`collection`对象默认迭代器的返回值由迭代器`this.items`自动生成，而非手动遍历来定义返回值。

现在我们已了解了如何使用默认的数组迭代器，而在`ECMAScript 6`中还有很多内建迭代器可以简化集合数据的操作。

## 内建迭代器

迭代器是`ECMAScript 6`的一个重要组成部分，在`ECMAScript 6`中，已经默认为许多内建类型提供了内建迭代器，只有当这些内建迭代器无法实现你的目标时才需要自己创建。通常来说当你定义自己的对象和类时才会遇到这种情况，否则，完全可以依靠内建的迭代器完成工作，而最常使用的可能是集合的那些迭代器。

### 集合对象迭代器

在`ECMAScript 6`中有 3 中类型的集合对象：数组、`Map`集合与`Set`集合。为了更好的访问对象中的内容，这 3 种对象都内建了以下 3 种迭代器：

-   `entries()` 返回一个迭代器，其值为多个键值对
-   `values()` 返回一个迭代器，其值为集合的值
-   `keys()` 返回一个迭代器，其值为集合中的所有键名

调用以上 3 个方法都可以访问集合的迭代器。

#### entries()迭代器

每次调用`next()`方法时，`entries()`迭代器都会返回一个数组，数组中的两个元素分别表示集合中每个元素的键与值。如果被遍历的对象是数组，则第一个元素是数字类型的索引；如果是`Set`集合，则第一个元素与第二个元素都是值(`Set`集合中的值被同时作为键与值使用)；如果是`Map`集合，则第一个元素为键名。

这里有几个`entries()`迭代器的使用示例：

```javascript
let colors = ['red', 'green', 'blue'];
let tracking = new Set([1234, 5678, 9012]);
let data = new Map();

data.set('title', 'Understanding ECMAScript 6');
data.set('format', 'ebook');

for (let entry of colors.entries()) {
    console.log(entry);
}

for (let entry of tracking.entries()) {
    console.log(entry);
}

for (let entry of data.entries()) {
    console.log(entry);
}
```

#### values()迭代器

调用`values()`迭代器时会返回集合中所存的所有值，例如：

```javascript
let colors = ['red', 'green', 'blue'];
let tracking = new Set([1234, 5678, 9012]);
let data = new Map();

data.set('title', 'Understanding ECMAScript 6');
data.set('format', 'ebook');

for (let value of colors.values()) {
    console.log(value);
}

for (let value of tracking.values()) {
    console.log(value);
}

for (let value of data.values()) {
    console.log(value);
}
```

#### keys()迭代器

`keys()`迭代器会返回集合中存在的每一个键。如果遍历的是数组，则会返回数字类型的键，数组本身的其他属性不会被返回；如果是`Set`集合，由于键与值是相同的，因此`keys()`和`values()`返回的也是相同的迭代器；如果是`Map`集合，则`keys()`迭代器会返回每个独立的键。请看以下这个示例：

```javascript
let colors = ['red', 'green', 'blue'];
let tracking = new Set([1234, 5678, 9012]);
let data = new Map();

data.set('title', 'Understanding ECMAScript 6');
data.set('format', 'ebook');

for (let key of colors.keys()) {
    console.log(key);
}

for (let key of tracking.keys()) {
    console.log(key);
}

for (let key of data.keys()) {
    console.log(key);
}
```

#### 不同集合类型的默认迭代器

每个集合类型都有一个默认的迭代器，在`for-of`循环中，如果没有显示指定则使用默认的迭代器。数组和`Set`集合的默认迭代器是`values()`方法，`Map`集合的默认迭代器是`entries()`方法。有了这些默认的迭代器，可以更轻松地在`for-of`循环中使用集合对象。请看以下示例：

```javascript
let colors = ['red', 'green', 'blue'];
let tracking = new Set([1234, 5678, 9012]);
let data = new Map();

data.set('title', 'Understanding ECMAScript 6');
data.set('format', 'print');

//与调用colors.values()方法相同

for (let value of colors) {
    console.log(value);
}

//与调用tracking.values()方法相同
for (let value of tracking) {
    console.log(value);
}

//与使用data.entries()方法相同
for (let entry of data) {
    console.log(entry);
}
```

默认情况下，如果是数组和`Set`集合，会逐一返回集合中所有的值；如果是`Map`集合，则按照`Map`构造函数参数的格式返回相同的数组内容。而`WeakSet`集合与`WeakMap`集合就没有内建的迭代器，由于要管理弱引用，因而无法确切地知道集合中存在的值，也就无法迭代这些集合了。

### 解构与`for-of`循环

如果要在`for-of`循环中使用解构语法，则可以利用`Map`集合默认构造函数的行为简化编码过程，就像这样：

```javascript
let data = new Map();

data.set('title', 'Understanding ECMAScript 6');
data.set('format', 'ebook');

//与使用data.entries()方法相同

for (let [key, value] of data) {
    console.log(key + '=' + value);
}

//format=ebook
```

### 字符串迭代器

自`ECMAScript 5`发布以后，`JavaScript`字符串慢慢变得更像数组了，例如，`ECMAScript 5`正式规定可以通过方括号访问字符串中的字符(也就是说，`text[0]`可以获取字符串`text`的第一个字符，并以此类推)。由于方括号操作的是编码单元而非字符，因此无法正确访问双字节字符，就像这样：

```javascript
var message = 'A 𠮷 B';

for (let i = 0; i < message.length; i++) {
    console.log(message[i]);
}

//A
//
//
//�
//�
//
//B
```

在这段代码中，访问`message`的`length`属性获取索引值，并通过方括号访问来迭代打印一个单字符字符串，但是输出的结果却与预期不符：

由于双节点字符被视作两个独立的编码单元，从而最终在`A`与`B`之间打印出`4`个空行。

所幸，`ECMAScript 6`的目标是全面支持`Unicode`,并且我们可以通过改变字符串的默认迭代器来解决这个问题，使其操作字符而不是编码单元。现在，我们修改前一个示例中字符串的默认迭代器，让`for-of`循环输出正确的内容，这是调整后的代码：

```javascript
var message = 'A 𠮷 B';

for (let c of message) {
    console.log(c);
}

//A
//
//𠮷
//
//B
```

### NodeList 迭代器

`DOM`标准中有一个`NodeList`类型，代表页面文档中所有元素的集合。对于编写`Web`浏览器环境中的`JavaScript`的开发者来说，需要花一点功夫去理解`NodeList`对象和数组之间的差异。二者都使用`length`属性来表示集合中元素的数量，都可以通过方括号来访问集合中的独立元素；而在内部实现中，二者的表现非常不一致，因而会造成很多困扰。

自从`ECMAScript 6`添加了默认迭代器后，`DOM`定义中的`NodeList`类型（定义在`HTML`标准而不是`ECMAScript 6`标准中）也拥有了默认迭代器，其行为与数组的默认迭代器完全一致。所以可以将`NodeList`应用于`for-of`循环及其他支持对象默认迭代器的地方。

```javascript
var divs = document.getElementsByTagName('body');
for (let div of divs) {
    console.log(div);
}
```

## 展开运算符于非数组可迭代对象

回想以下第 7 章，我们通过展开运算符（...）把`Set`集合转换成了一个数组，就像这样：

```javascript
let set = new Set([1, 2, 3, 3, 3, 4, 5]),
    array = [...set];

console.log(array); //[1, 2, 3, 4, 5]
```

这段代码中的展开运算符把`Set`集合的所有值填充到了一个数组字面量里，它可以操作所有可迭代对象，并根据默认迭代器来选取要引用的值，从迭代器读取所有值。然后按照返回顺序将它们依次插入到数组中。`Set`集合是一个可迭代对象，所以示例代码可正常运行。展开运算符也可以用于其他可迭代对象，这里有另外一个示例：

```javascript
let map = new Map([
        ['name', 'Nicholas'],
        ['age', 25],
    ]),
    array = [...map];

console.log(array); //[["name", "Nicholas"], ["age", 25]]
```

在此示例中，展开运算符把`Map`集合转换成包含多个数组的数组，`Map`集合的默认迭代器返回的是多组键值对，所以结果数组与执行`new Map()`时传入的数组看起来一样。

在数组字面量中可以多次使用展开运算符，将可迭代对象中的多个元素依次插入新数组中，替换原先展开运算符所在的位置。示例如下：

```javascript
let smallNumbers = [1, 2, 3],
    bigNumbers = [100, 101, 102],
    allNumbers = [0, ...smallNumbers, ...bigNumbers];

console.log(allNumbers.length); //7
console.log(allNumbers); //[0, 1, 2, 3, 100, 101, 102]
```

创建一个变量`allNumbers`,用展开运算符将`smallNumbers`和`bigNumbers`里的值依次添加到`allNumbers`中。首先存入`0`,然后存入`small`中的值，最后存入`bigNumbers`中的值。当然，原始数组中的值只是被复制到`allNumbers`中，它们本身并未改变。

由于展开运算符可以作用于任意可迭代对象，因此如果想将可迭代对象转换为数组，这是最简单的方法。你既可以将字符串中的每一个字符(不是编码单元)存入新数组中，也可以将浏览器中`NodeList`对象中的每一个节点存入新的数组中。

## 高级迭代器功能

迭代器的基础功能可以辅助我们完成很多任务，通过生成器创建迭代器的过程也很便捷，除了这些简单的集合遍历任务外，迭代器也可以用于完成一些复杂的任务。在`ECMAScript 6`的开发任务中，出现了许多独立的思想和语言模式，创造者们深受鼓舞，为这门语言添加了更多的功能。即使这些功能微不足道，但是聚合在一起却可以完成一些有趣的交互，下面的章节我们将讨论这些有趣的实践。

### 给迭代器传递参数

在本章的示例中，已经展示了一些迭代器向外传值的方法，既可以用迭代器的`next()`方法返回值，也可以在生成器内部使用`yield`关键字来生成值。如果给迭代器的`next()`方法传递参数，则这个参数的值就会替代生成器内部上一条`yield`语句的返回值。而如果要实现更多像异步编程这样的高级功能，那么这种给迭代器传值的能力就变得至关重要。请看这个简单的示例：

```javascript
function* createIterator() {
    let first = yield 1;
    let second = yield first + 2;
    yield second + 3;
}

let iterator = createIterator();

console.log(iterator.next()); //{value: 1, done: false}
console.log(iterator.next(4)); //{value: 6, done: false}
console.log(iterator.next(5)); //{value: 8, done: false}
console.log(iterator.next()); //{value: undefined, done: true}
```

这里有一个特例，第一次调用`next()`方法时无论传入什么参数都会被丢弃。由于传给`next()`方法的参数会替代上一次`yield`的返回值，而在第一次调用`next()`方法前不会执行任何`yield`语句，因此在第一次调用`next()`方法时传递参数是毫无意义的。

第二次调用`next()`方法传入数值`4`作为参数，它最后被赋值给生成器函数内部的变量`first`。在一个含参`yield`语句中，表达式右侧等价于第一次调用`next()`方法后的下一个返回值，表达式左侧等价于第二次调用`next()`方法后，在函数继续执行前得到的返回值。第二次调用`next()`方法传入的值为`4`,它会被赋值给变量`first`,函数则继续执行。

第二条`yield`语句在第一次`yield`的结果上加`2`,最终的返回值为`6`。第三次调用`next()`方法时，传入数值`5`,这个值被赋值给`second`,最后用于第三条`yield`语句并最终返回数值`8`。

如果想理解程序内部的具体细节，想清楚这些会对你很有帮助：在生成器内部，代码每次继续执行前，正在执行的代码是哪一段。

给迭代器的`next()`方法传值时，`yield`语句可以返回相应计算后的值，而在生成器的内部，还有很多诸如此类的执行技巧可以使用，例如在迭代器中手动抛出错误。

### 在迭代器中抛出错误

除了给迭代器传递数据外，还可以给它传递错误条件。通过`throw()`方法，当迭代器恢复执行时可令其抛出一个错误。这种主动抛出错误的能力对于异步编程至关重要，也能为你提供模结束函数执行的两种方法（返回值或抛出错误），从而增强生成器内部的编程弹性。将错误对象传给`throw()`方法后，在迭代器继续执行时其会被抛出。例如：

```javascript
function* createIterator() {
    let first = yield 1;
    let second = yield first + 2; //yield 4 + 2,然后抛出错误
    yield second + 3;
}

let iterator = createIterator();

console.log(iterator.next()); //{value: 1, done: false}
console.log(iterator.next(4)); //{value: 6, done: false}
console.log(iterator.throw(new Error('Boom'))); //报错 Boom
```

### 生成器返回语句

由于生成器也是函数，因此可以通过`return`语句提前退出函数执行，对于最后依次`next()`方法调用，可以主动为其指定一个返回值。在本章的绝大多数示例中，最后一次调用返回的都是`undefined`,正如在其他函数中那样，你可以通过`return`语句指定一个返回值。而在生成器中，`return`表示所有操作已经完成，属性`done`被设置为`true`;如果同时提供了相应的值，则属性`value`会被设置为这个值。这里有一个简单的示例：

```javascript
function* createIterator() {
    yield 1;
    return;
    yield 2;
    yield 3;
}

let iterator = createIterator();

console.log(iterator.next()); //{value: 1, done: false}
console.log(iterator.next()); //{value: undefined, done: true}
```

这段代码中的生成器包含多条`yield`语句和一条`return`语句，其中`return`语句紧随一条`yield`语句，其后的`yield`语句将不会被执行。

在`return`语句中可以指定一个返回值，该值将被赋值给返回对象的`value`属性：

```javascript
function* createIterator() {
    yield 1;
    return 42;
}

let iterator = createIterator();

console.log(iterator.next()); //{value: 1, done: false}
console.log(iterator.next()); //{value: 42, done: true}
console.log(iterator.next()); //{value: undefined, done: true}
```

在此示例中，第二次调用`next()`方法时返回对象的`value`属性值为`42`,`done`属性首次设为`true`;第三次调用`next()`方法依然返回一个对象，只是`value`属性的值会变成`undefined`。因此，通过`return`语句指定的返回值，只会在返回对象中出现一次，在后续调用返回的对象中，`value`属性会被重置为`undefined`。

**展开运算符与`for-of`语句循环语句会直接忽略通过`return`语句指定的任何返回值，只要`done`一变成`true`就立即停止读取其他的值。不管怎样，迭代器的返回值依然是一个非常有用的特性，比如即将要讲到的委托生成器。**

### 委托生成器

在某些情况下，我们需要将两个迭代器合二为一，这时可以创建一个生成器，再给`yield`语句添加一个星号，就可以将生成数据的过程委托给其他迭代器。当定义这些生成器时，只需将星号放置在关键字`yield`和生成器的函数名之间即可，就像这样：

```javascript
function* createNumberIterator() {
    yield 1;
    yield 2;
}

function* createColorIterator() {
    yield 'red';
    yield 'green';
}

function* createCombinedIterator() {
    yield* createNumberIterator();
    yield* createColorIterator();
    yield true;
}

var iterator = createCombinedIterator();

console.log(iterator.next()); //{ value: 1, done: false }
console.log(iterator.next()); //{ value: 2, done: false }
console.log(iterator.next()); //{ value: "red", done: false }
console.log(iterator.next()); //{ value: "green", done: false }
console.log(iterator.next()); //{ value: true, done: false }
console.log(iterator.next()); //{ value: undefinded, done: true}
```

这里的生成器`createCombinedIterator()`先后委托了另外两个生成器`createNumberIterator()`和`createColorIterator()`。仅根据迭代器的返回值来看，它就像是一个完整的迭代器，可以生成所有的值。每一调用`next()`方法就会委托相应的迭代器生成相应的值，直到最后由`createNumberIterator()`和`createColorIterator()`创建的迭代器无法返回更多的值，此时执行最后一条`yield`语句并返回`true`。

有了生成器委托这个新功能，你可以进一步利用生成器的返回值来处理复杂任务，例如：

```javascript
function* createNumberIterator() {
    yield 1;
    yield 2;
    return 3;
}

function* createRepeatingIterator(count) {
    for (let i = 0; i < count; i++) {
        yield 'repeat';
    }
}

function* createCombinedIterator() {
    let result = yield* createNumberIterator();
    yield* createRepeatingIterator(result);
}

var iterator = createCombinedIterator();

console.log(iterator.next()); //{ value: 1, done: false }
console.log(iterator.next()); //{ value: 2, done: false }
console.log(iterator.next()); //{ value: "repeat", done: false }
console.log(iterator.next()); //{ value: "repeat", done: false }
console.log(iterator.next()); //{ value: "repeat", done: false }
console.log(iterator.next()); //{ value: undefined, done: true }
```

在生成器`createCombinedIterator()`中，执行过程先被委托给了生成器`createNumberIterator()`，返回值会被赋值给变量`result`,执行到`return 3`时会返回数值`3`。这个值随后被传入`createRepeatingIterator()`作为它的参数，因而生成字符串`"repeat"`的`yield`语句会被执行三次。

注意，无论通过何种方式调用迭代器的`next()`方法，数值`3`永远不会被返回，它只存在于生成器`createCombinedIterator()`的内部。但如果想输出这个值，则可以额外添加一条`yield`语句，例如：

```javascript
function* createNumberIterator() {
    yield 1;
    yield 2;
    return 3;
}

function* createRepeatingIterator(count) {
    for (let i = 0; i < count; i++) {
        yield 'repeat';
    }
}

function* createCombinedIterator() {
    let result = yield* createNumberIterator();
    yield result;
    yield* createRepeatingIterator(result);
}

var iterator = createCombinedIterator();

console.log(iterator.next()); //{ value: 1, done: false }
console.log(iterator.next()); //{ value: 2, done: false }
console.log(iterator.next()); //{ value: 3, done: false }
console.log(iterator.next()); //{ value: "repeat", done: false }
console.log(iterator.next()); //{ value: "repeat", done: false }
console.log(iterator.next()); //{ value: "repeat", done: false }
console.log(iterator.next()); //{ value: undefined, done: true }
```

此处新添加的`yield`语句显式地输出了生成器`createNumberIterator()`的返回值。

**`yield *`也可以直接应用于字符串，例如`yield * "hello"`,此时将使用字符串的默认迭代器。**

## 异步任务执行

生成器令人兴奋的特性多与异步编程有关，`JavaScript`中的异步编程有利有弊：简单任务的异步化非常容易；而复杂任务的异步化会带来很多管理代码的挑战。由于生成器支持在函数中暂停代码执行，因而可以深入挖掘异步处理的更多用法。

执行异步操作的传统方式一般是调用一个函数并执行相应回调函数。举个例子，我们用`Node.js`编写一段从磁盘读取文件的代码：

```javascript
let fs = require('fs');

fs.readFile('config.json', function (err, contents) {
    if (err) {
        throw err;
    }

    console.log(contents);
});
```

调用`fs.readFile()`方法时要求传入要读取的文件名和一个回调函数，操作结束后会调用该回调函数并检查是否存在错误，如果没有就可以处理返回的内容。如果要执行的任务很少，那么这样的方式可以很好地完成任务；如若需要嵌套回调或序列化一系列地异步操作，事情会变得非常复杂。此时，生成器和`yield`语句就派上用场了。

### 简单任务执行器

由于执行`yield`语句会暂停当前函数地执行过程并等待下一次调用`next()`方法，因此你可以创建一个函数，在函数中调用生成器生成相应地迭代器，从而在不用回调函数的基础上实现异步调用`next()`方法，就像这样：

```javascript
function run(taskDef) {
    //创建一个无使用限制的迭代器
    let task = taskDef();

    //开始执行任务
    let result = task.next();

    //循环调用next()的函数
    function step() {
        //如果任务未完成，则继续执行
        if (!result.done) {
            result = task.next();
            step();
        }
    }

    //开始迭代执行
    step();
}
```

函数`run()`接受一个生成器函数作为参数，这个函数定义了后续要执行的任务，生成一个迭代器并将它储存在变量`task`中。首次调用迭代器的`next()`方法时，返回的结果被储存起来稍后继续使用。`step()`函数会检查`result.done`的值，如果为`false`则执行迭代器的`next()`方法，并再次执行`step()`操作。每次调用`next()`方法时，返回的最新信息总会覆写变量`result`。在代码的最后，初始化执行`step()`函数并开始整个的迭代过程，每次通过检查`result.done`来确定是否有更多任务需要执行。

借助这个`run()`函数，可以像这样执行一个包含多条`yield`语句的生成器。

```javascript
function run(taskDef) {
    //创建一个无使用限制的迭代器
    let task = taskDef();

    //开始执行任务
    let result = task.next();

    //循环调用next()的函数
    function step() {
        //如果任务未完成，则继续执行
        if (!result.done) {
            result = task.next();
            step();
        }
    }

    //开始迭代执行
    step();
}

run(function* () {
    console.log(1);
    yield;
    console.log(2);
    yield;
    console.log(3);
});

//1
//2
//3
```

这个示例最终会向控制台输出多次调用`next()`方法的结果，分别为数值`1`、数值`2`和`3`。当然，简单输出迭代次数不足以展示迭代器高级功能的实用之处，下一步我们将在迭代器与调用者之间互相传值。

### 向任务执行器传递数据

给任务执行器传递数据最简单的办法是，把`yield`返回的值传入下一次`next()`方法的调用。在这段代码中，只需将`result.value`传入`next()`方法即可：

```javascript
function run(taskDef) {
    //创建一个无使用限制的迭代器
    let task = taskDef();

    //开始执行任务
    let result = task.next();

    //循环调用next()的函数
    function step() {
        //如果任务未完成，则继续执行
        if (!result.done) {
            result = task.next(result.value);
            step();
        }
    }

    //开始迭代执行
    step();
}

run(function* () {
    let value = yield 1;
    console.log(value);
    value = yield value + 3;
    console.log(value);
});

//1
//4
```

此示例会向控制台输出两个数值`1`和`4`。其中，数值`1`取自`yield 1`语句中回传给变量`value`的值；而`4`取自给变量`value`加`3`后回传给`value`的值。现在数据已经能够在`yield`调用间互相传递了，只需一个小小的改变便能支持异步调用。

### 异步任务执行器

之间的示例只是在多个`yield`调用间来回传递静态数据，而等待一个异步过程有些不同。任务执行器需要知晓回调函数是什么以及如何使用它。由于`yield`表达式会将值返回给任务执行器，所有的函数调用都会返回一个值。因而在某种程度上这也是一个异步操作，任务执行器会一直等待直到操作完成。

下面我们定义一个异步操作：

```javascript
function fetchData() {
    return function (callback) {
        callback(null, 'Hi');
    };
}
```

本示例的原意是让任务执行器调用的所有函数都返回一个可以执行回调过程的函数，此处`fetchData()`函数的返回值是一个可接受回调函数作为参数的函数，当调用它时会传入一个字符串`Hi!`作为回调函数的参数并执行。参数`callback`需要通过任务执行器指定，以确保回调函数执行时可以与底层迭代器正确交互。尽管`fetchData()`是同步函数，但简单添加一个延迟方法即可将其变为异步函数：

```javascript
function fetchData() {
    return function (callback) {
        setTimeout(function () {
            callback(null, 'Hi');
        }, 50);
    };
}
```

在这个版本的`fetchData()`函数中，我们让回调函数延迟了`50ms`再被调用，所以这种模式在同步和异步状态中下都运行良好。只需保证每个要通过`yield`关键字调用的函数都按照与之相同的模式编写。

理解了函数中异步过程的运作方式，我们将任务执行器稍作修改。当`result.value`是一个函数时，任务执行器会先执行这个函数再将结果传入`next()`方法，代码更新如下：

```javascript
function run(taskDef) {
    //创建一个无使用限制的迭代器
    let task = taskDef();

    //开始执行任务
    let result = task.next();

    //循环调用`next()`函数
    function step() {
        //如果任务未完成，则继续执行
        if (typeof result.value === 'function') {
            result.value(function (err, data) {
                if (err) {
                    result = task.throw(err);
                    return;
                }

                result = task.next(data);
                step();
            });
        } else {
            result = task.next(result.value);
            step();
        }
    }

    //开始迭代执行
    step();
}
```

通过`===`操作符检查后，如果`result.value`是一个函数，会传入一个回调函数作为参数来调用它，回调函数遵循`Node.js`中有关执行错误的约定：所有可能的错误放在第一个参数（err）中，结果放在第二个参数中。如果传入了`err`,则意味着执行过程中产生了错误，这时会通过`task.throw()`正确输出了错误对象；如果没有错误产生，`data`被传入`task.run()`，其执行结果被储存起来，并继续执行`step()`方法。如果`result.value`不是一个函数，则直接将其传入`next()`方法。

现在，这个新版的任务执行器已经可以用于所有的异步任务了。在`Node.js`环境中，如果要从文件中读取一些数据，需要在`fs.readFile()`外围创建一个包装器（wrapper），与`fetchData()`类似，会返回一个函数，例如：

```javascript
let fs = require('fs');

function readFile(filename) {
    return function (filename) {
        fs.readFile(filename, callback);
    };
}
```

`readFile()`方法只接受一个文件名作为参数，返回一个可以执行回调函数的函数。回调函数被直接传入`fs.readFile()`方法，读取完成后会执行它。下面是一段通过关键字`yield`执行这个任务的代码：

```javascript
run(function* () {
    let contents = yield readFile('config.json');
    doSomethingWith(contents);
    console.log('Done');
});
```

在这段代码中没有任何回调变量，异步的`readFile()`操作却正常执行，除了`yield`关键字外，其他代码与同步代码完全一样，只不过函数执行的是异步操作。所以遵循相同的接口，可以编写一些读起来像是同步代码的异步逻辑。

当然，这些示例中使用的模式也有缺点，也就是你不能百分百确认函数中返回的其他函数一定是异步的。着眼当下，最重要的是你能理解任务执行过程背后的理论知识。`ECMAScript 6`中的新特性`Promise`可以提供一种更灵活的方式来调度异步任务。

## 小结

迭代器是`ECMAScipt 6`的一个重要组成部分，它是语言中某些关键语言元素的依赖。尽管迭代器看起来好像只是一种通过几个简单`API`返回一系列值的新特性，但在`ECMAScript 6`中，它还能被应用于许多更复杂的场景中。

`Symbol.iterator`被用来定义对象的默认迭代器，内建对象和开发者定义的对象都支持这个特性，通过这个`Symbol`定义的方法可以返回一个迭代器。如果对象中有`Symbol.iterator`这个属性，则此对象为可迭代对象。

`for-of`循环可以持续获取可迭代对象中的值，与传统的`for`循环迭代相比，`for-of`循环不需要追踪在集合中的位置，也不需要控制循环结束的时机，使用起来非常方便，它会自动地从迭代器中读取所有值，如果没有更多可返回值就自动退出循环。

为了降低`for-of`的使用成本，`ECMAScript 6`中的许多值都有默认迭代器。所有集合类型（例如数组、`Map`集合和`Set`集合）都有默认迭代器，字符串同样也有默认迭代器，其可以直接迭代字符串中的字符，避免了遍历编码单元带来的诸多问题。

展开运算符也可以作用域可迭代对象，通过迭代器从对象中读取相应的值并插入到一个数组中。

生成器是一种特殊函数，在定义时需要额外添加一个星号(`*`)，被调用时会自动创建一个迭代器，并通过关键字`yield`来标识每次调用迭代器的`next()`方法时的返回值。

借助生成器委托这个新特性，便可重用已有生成器来创建新的生成器，从而进一步封装更复杂的迭代器行为。新语法使用`yield *`来标识生成的值，新迭代器的返回值便可取自己有的多个迭代器。

在生成器和迭代器的所有应用场景中，最有趣且最令人兴奋的可能是用来创建更简洁的异步代码。这种方式无须在所有地方定义回调函数，其代码看起来像是同步代码，但实际上使用了`yield`生成的特性来等待异步操作最终完成。
