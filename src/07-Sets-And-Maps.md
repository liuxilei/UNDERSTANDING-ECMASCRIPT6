# Set 集合与 Map 集合

## ECMAScript 5 中的 Set 集合与 Map 集合

在`ECMAScript 5`中，开发者们用对象属性来模拟这两种集合，就像这样：

```javascript
var set = Object.create(null);

set.foo = true;

//检查属性是否存在

if (set.foo) {
    //要执行的代码
}
```

模拟这两种集合对象的唯一区别是存储的值不同，以下这个示例是用对象模拟`Map`集合：

```javascript
var map = Object.create(null);
map.foo = 'bar';

//获取已知值
var value = map.foo;

console.log(value);
```

## 该解决方案的一些问题

如果程序很简单，确实可以用对象来模拟`Set`集合与`Map`集合，但如果触碰到对象属性的某些限制，那么这个方法就会变得更加复杂。例如，所有对象的属性名必须是字符串类型，必须确保每个键名都是字符串类型且在对象中是唯一的，请看这段代码。

```javascript
var map = Object.create(null);
map[5] = 'foo';

console.log(map['5']); //foo
console.log(map[5]); //foo
```

本例中将对象的某个属性赋值为字符串`"foo"`,而这个属性的键名是数值型的 5，它会被自动转换成字符串，所以`map["5"]`和`map[5]`引用的其实是同一个属性。如果你想分别用数字和字符串作为对象属性的键名，则内部的自动转换机制会导致很多问题。当然，用对象作为属性的键名也会遇到类似的问题，例如：

```javascript
var map = Object.create(null),
    key1 = {},
    key2 = {};
map[key1] = 'foo';

console.log(map[key2]); //foo
```

由于对象属性的键名必须是字符串，因而这段代码中的`key1`和`key2`将被转换为对象对应的默认字符串`"[object Object]"`,所以`map[key2]`和`map[key1]`引用的是同一属性。这种错误很难被发现，用不同对象作为对象属性的键名理论上应该指向多个属性，但实际上这种假设却不成立。

由于对象会被转换为默认的字符串表达方式，因此其很难用作对象属性的键名。

对于`Map`集合来说，如果它的属性值是假值，则在要求使用布尔值的情况下（例如在 if 语句中）会被自动转换成`false`。强制转换本身没有问题，但如果考虑这个值的使用场景，就有可能导致错误发生。例如：

```javascript
var map = Object.create(null);

map.count = 1;

//本意是检查"count"属性是否存在，实际上检查的是该值是否非零

if (map.count) {
    //要执行的代码
}
```

这个示例中有一些模棱两可的地方，比如我们应该怎样使用`map.count`?在`if`语句中，我们是检查`map.count`是否存在，还是检查值是否非零？在示例中，由于`value`的值是 1，为真值，`if`语句中的代码将被执行。然而，如果`map.count`的值为`0`或者不存在将不会被执行。

在大型软件应用中，一旦发生此类问题将难以定位及调试，从而促使`ECMAScript 6`在语言中加入`Set`集合与`Map`集合这两种新特性。

在`JavaScript`中有一个`in`运算符，其不需要读取对象的值就可以判断属性在对象中是否存在，如果存在就返回`true`。但是，`in`运算符也会检索对象的原型，只有当对象原型为`null`时使用这个方法才比较稳妥。即便是这样，实际开发中许多开发者仍然使用本例中的方法进行判断，并没有使用`in`运算符。

## ECMAScript 6 中的 Set 集合

## 创建 Set 集合并添加元素

```javascript
let set = new Set();
set.add(5);
set.add('5');

console.log(set.size); //2
```

在`Set`集合中，不会对所有值进行强制的类型转换，数字 5 和字符串"5"可以作为两个独立元素存在（引擎内部使用第 4 章介绍的`Object.is()`方法检测两个值是否一致，唯一的例外是，`Set`集合中的`+0`与`-0`被认为是相等的）。当然，如果向`Set`集合中添加多个对象，则它们之间彼此保持独立：

```javascript
let set = new Set(),
    key1 = {},
    key2 = {};

set.add(key1);
set.add(key2);

console.log(set.size); //2
```

由于 key1 和 key2 不会被转换为字符串，因而它们在`Set`集合中是两个独立的元素；如果被转换，则二者的值都是`"[object Object]"`。

如果多次调用`add()`方法并传入相同的值作为参数，那么后续的调用实际上会被忽略：

```javascript
let set = new Set();
set.add(5);
set.add('5');
set.add(5); //重复 - 本次调用直接被忽略

console.log(set.size); //2
```

也可以用数组来初始化`Set`集合，`Set`构造函数同样会过滤掉重复的值从而保证集合中的元素各自唯一。

```javascript
let set = new Set([1, 2, 3, 4, 5, 5, 5, 5]);
console.log(set.size); //5
```

在这个示例中，我们用一个含重复元素的数组来初始化`Set`集合，数组中有 4 个数字 5，而在生成的集合中只有一个。自动去重的功能对于将已有代码或`JSON`结构转换为`Set`集合执行得非常好。

实际上，`Set`构造函数可以接受所有可迭代对象作为参数，数组、`Set`集合、`Map`集合都是可迭代得，因而都可以作为`Set`构造函数得参数使用；构造函数通过迭代器从参数中提取值。

通过`has()`方法可以检测`Set`集合中是否存在某个值：

```javascript
let set = new Set();
set.add(5);
set.add('5');
console.log(set.has(5)); //true
console.log(set.has(6)); //false
```

### 移除元素

调用`delete()`方法可以移除`Set`集合中的某一个元素，调用`clear()`方法会移除集合中的所有元素。请看以下这段代码：

```javascript
let set = new Set();
set.add(5);
set.add('5');

console.log(set.has(5)); //true

set.delete(5);

console.log(set.has(5)); //false
console.log(set.size); //1

set.clear();

console.log(set.has('5')); //false
console.log(set.size); //0
```

如果你想在`Set`集合中添加元素并在每一个元素上执行操作呢？这时候`forEach()`方法就派上用场了。

### Set 集合的 forEach()方法

`forEach()`方法的回调函数接受以下 3 个参数：

-   `Set`集合中下一次索引的位置
-   与第一个参数一样的值
-   被遍历的`Set`集合本身

`Set`集合的`forEach()`方法与数组中的`forEach()`方法有一个奇怪的差别：回调函数前两个参数的值竟然是一样的。尽管这看起来像是一个错误，但其实也解释得通。

数组和`Map`集合的`forEach()`方法的回调函数都接受 3 个参数，前两个分别是值和键名(对于数组来说就是数值型索引值)

然而`Set`集合没有键名，`ECMAScript 6`标准制定委员会本可以规定`Set`集合的`forEach()`函数的回调函数只接受两个参数，但这可能导致几个方法之间分歧过大，于是它们最终决定所有函数都接受 3 个参数：`Set`集合中的每个元素也按照键名和值的形式储存，从而才能保证在所有`forEach()`方法的回调函数中前两个参数具有相同含义。

```javascript
let set = new Set([1, 2]);

set.forEach((value, key, ownerSet) => {
    console.log(key + ' ' + value);
    console.log(ownerSet === set);
});

//1 1
//true
//2 2
//true
```

在`Set`集合的`forEach()`方法中，第二个参数也与数组的一样，如果需要在回调函数中使用`this`引用，则可以将它作为第二个参数传入`forEach()`函数：

```javascript
let set = new Set([1, 2]);

let processor = {
    output(value) {
        console.log(value);
    },
    process(dataSet) {
        dataSet.forEach(function (value) {
            this.output(value);
        }, this);
    },
};

processor.process(set);
```

在这个示例中，`processor.process()`方法调用了`Set`集合的`forEach()`方法并将`this`传入作为回调函数的`this`值，从而`this.output()`方法可以正确地调用到`processor.output()`方法。`forEach()`方法的回调函数只使用了第一个参数`value`,所以直接省略了其他参数。在这里也可以使用箭头函数，这样就无须再将`this`作为第二个参数传入回调函数了。

```javascript
let set = new Set([1, 2]);

let processor = {
    output(value) {
        console.log(value);
    },
    process(dataSet) {
        dataSet.forEach((value) => this.output(value));
    },
};

processor.process(set);

//1
//2
```

请记住，尽管`Set`集合更适合用来跟踪多个值，而且又可以通过`forEach()`方法操作集合中的每一个元素，但是你不能像访问数组元素那样直接通过索引访问集合中的元素。如有需要，最好先将`Set`集合转换成一个数组。

### 将 Set 集合转换为数组

将数组转换为`Set`集合的过程很简单，只需给`Set`构造函数传入数组即可；将`Set`集合再转回数组的过程同样很简单，我们需要用到在第 3 章中介绍的展开运算符(...)，它可以将数组中的元素分解为各自独立的函数参数。展开运算符也可以将诸如`Set`集合的可迭代对象转换为数组。举个例子：

```javascript
let set = new Set([1, 2, 3, 3, 3, 4, 5]),
    array = [...set];

console.log(array); //[1, 2, 3, 4, 5]
```

在这里，用一个含重复元素的数组初始化`Set`集合，集合会自动移除这些重复元素；然后再用展开运算符将这些元素放到一个新的数组中。`Set`集合依然保留创建时接受的元素(1、2、3、4、5),新数组中保存着这些元素的副本。

如果已经创建过一个数组，想要复制它并创建一个无重复元素的新数组，则上述这个方法就非常有用：

```javascript
function eliminateDuplicates(items) {
    return [...new Set(items)];
}

let numbers = [1, 2, 3, 4, 5],
    noDuplicates = eliminateDuplicates(numbers);

console.log(noDuplicates); //[1, 2, 3, 4, 5]
```

在`eliminateDuplicates()`函数中，`Set`集合仅是用来过滤重复值的临时中介，最后会输出新创建的无重复元素的数组。

### Weak Set 集合

将对象存储在`Set`的实例与存储在变量中完全一样，只要`Set`实例中的引用存在，垃圾回收机制就不能释放该对象的内存空间，于是之前提到的`Set`类型可以被看作是一个强引用的`Set`集合。举个例子：

```javascript
let set = new Set(),
    key = {};

set.add(key);
console.log(set.size); //1

//移除原始引用
key = null;

console.log(set.size); //1

//重新取回原始引用

key = [...set][0];
console.log(key); //{}
```

在这个示例中，将变量`key`设置为`null`时便清除了对初始对象的引用，但是`Set`集合却保留了这个引用，你仍然可以使用展开运算符将`Set`集合转换成数组格式并从数组的首个元素取出该引用。大部分情况下这段代码运行良好，但有时候你会希望当其他所有引用都不再存在时，让`Set`集合中的这些引用随之消失。举个例子，如果你在`Web`页面中通过`JavaScript`代码记录了一些`DOM`元素，这些元素有可能被另一段脚本移除，而你又不希望自己的代码保留这些`DOM`元素的最后一个引用。(这个情景被称作内存泄漏)。

为了解决这个问题，`ECMAScript 6`中引入了另外一个类型：`Weak Set`集合(弱引用`Set`集合)。`Weak Set`集合只存储对象的弱引用，并且不可以存储原始值；集合中的弱引用如果是对象唯一的引用，则会被回收并释放相应内存。

### 创建 Weak Set 集合

用`WeakSet`构造函数可以创建`Weak Set`集合，集合支持 3 个方法：`add()`、`has()`和`delete()`。下面这个示例创建了一个集合并分别调用这 3 个方法：

```javascript
let set = new WeakSet(),
    key = {};

//向集合set中添加对象
set.add(key);

console.log(set.has(key)); //true

set.delete(key);

console.log(set.has(key)); //false
```

`Weak Set`集合的使用方式与`Set`集合类似，可以向集合中添加引用，从中移除引用，也可以检查集合中是否存在指定对象的引用。也可以调用`WeakSet`构造函数并传入一个可迭代对象来创建`Weak Set`集合。

```javascript
let key1 = {},
    key2 = {},
    set = new WeakSet([key1, key2]);

console.log(set.has(key1)); //true
console.log(set.has(key2)); //true
```

在这个示例中，向`WeakSet`构造函数传入一个含有两个对象的数组，最终创建一个包含这两个对象的`Weak Set`集合。请记住，`WeakSet`构造函数不接受任何原始值，如果数组中包含其他非对象值，程序会抛出错误。

### 两种 Set 类型的主要区别

两种`Set`类型之间最大的区别是`Weak Set`保存的是对象值的弱引用，下面这个示例将展示二者间的差异：

```javascript
let set = new WeakSet(),
    key = {};

//向集合Set中添加对象
set.add(key);

console.log(set.has(key)); //true

//移除对象key的最后一个强引用(Weak Set中的引用也自动移除)
key = null;
```

这段代码执行过后，就无法访问`Weak Set`中`key`的引用了。由于我们需要向`has()`方法传递一个强引用才能验证这个弱引用是否已被移除，因此测试有点儿难以进行下去，但是请你相信，`JavaScript`引擎一定会正确地移除最后一个弱引用。

以上示例展示了一些`Weak Set`集合与普通`Set`集合的共同特性，但是它们之间还有下面几个差别：

-   在`WeakSet`的实例中，如果向`add()`方法传入非对象参数会导致程序报错，而向`has()`和`delete()`方法传入非对象参数则会返回 false。

-   `Weak Set`集合不可迭代，所以不能被用于`for-of`循环。
-   `Weak Set`集合不暴露任何迭代器(例如`keys()`和`values()`方法），所以无法通过程序本身来检测其中的内容。
-   `Weak Set`集合不支持`forEach()`方法
-   `Weak Set`集合不支持`size`属性。

`Weak Set`集合的功能看似受限，其实这是为了让它能够正确地处理内存中的数据。总之，如果你只需要跟踪对象引用，你更应该使用`Weak Set`集合而不是普通的`Set`集合。

`Set`类型可以用来处理列表中的值，但是不适用于处理键值对这样的信息结构。`ECMAScript 6`也添加了`Map`集合来解决类似的问题。

## ECMAScript 6 中的 Map 集合

`ECMAScript 6`中的`Map`类型是一种储存着许多键值对的有序列表，其中的键名和对应的值支持所有的数据类型。键名的等价性判断是通过调用`Object.is()`方法是实现的，所以数字`5`与字符串`"5"`会被判定为两种类型，可以分别作为独立的两个键出现在程序中，这一点与对象中不太一样，因为对象的属性名总会被强制转换成字符串类型。

如果要向`Map`集合中添加新的元素，可以调用`set()`方法并分别传入键名和对应值作为两个参数；如果要从集合中获取信息，可以调用`get()`方法。就像这样：

```javascript
let map = new Map();
map.set('title', 'Understanding ECMAScript 6');
map.set('year', 2016);

console.log(map.get('title')); //Understanding ECMAScript 6
console.log(map.get('year')); //2016
```

如果调用`get()`方法时传入的键名在`Map`集合中不存在，则会返回`undefined`

在对象中，无法用对象作为对象属性的键名；但是在`Map`集合中，却可以这样做：

```javascript
let map = new Map(),
    key1 = {},
    key2 = {};

map.set(key1, 5);
map.set(key2, 42);

console.log(map.get(key1)); //5
console.log(map.get(key2)); //42
```

### Map 集合支持的方法

-   `has(key)` 检测指定的键名在`Map`集合与`Set`集合中是否已经存在。
-   `delete(key)` 从`Map`集合中移除指定键名及其对应的值。
-   `clear()` 移除`Map`集合中的所有键值对

`Map`集合同样支持`size`属性，其代表当前集合中包含的键值对数量。下面这段代码展示了 3 个方法及`size`属性的使用方式。

```javascript
let map = new Map();
map.set('name', 'Nicholas');
map.set('age', 25);

console.log(map.size === 2);

console.log(map.has('name') === true);
console.log(map.get('name') === 'Nicholas');
console.log(map.has('age') === true);
console.log(map.get('age') === 25);

map.delete('name');
console.log(map.has('name') === false);
console.log(map.get('name') === undefined);
console.log(map.size === 1);

map.clear();
console.log(map.has('name') === false);
console.log(map.get('name') === undefined);
console.log(map.has('age') === false);
console.log(map.get('age') === undefined);
console.log(map.size === 0);
```

### Map 集合的初始化方法

可以向`Map`构造函数传入数组来初始化一个`Map`集合，这一点同样与`Set`集合相似。数组中的每个元素都是一个子数组，子数组中包含一个键值对的键名与值两个元素。因此，整个`Map`集合中包含的全是这样的两元素数组：

```javascript
let map = new Map([
    ['name', 'Nicholas'],
    ['age', 24],
]);

console.log(map.has('name') === true);
console.log(map.get('name') === 'Nicholas');
console.log(map.has('age') === true);
console.log(map.get('age') === 24);
console.log(map.size === 2);
```

初始化构造函数之后，键名`"name"`个`"age"`分别被添加到`Map`集合中。数组包裹数组的模式看起来可能有点奇怪，但由于`Map`集合可以接受任意数据类型的键名，为了确保它们在被存储到`Map`集合中之前不会被强制转换为其他数据类型，因而只能将它们放在数组中，因为这是唯一一种可以准确地呈现键名类型的方式。

### Map 集合的 forEach()方法

`Map`集合的`forEach()`方法与`Set`集合和数组中的`forEach()`方法类似，回调函数都接受 3 个参数：

-   `Map`集合中下一次索引的位置
-   值对应的键名
-   `Map`集合本身

这些回调参数与数组中的更相似，第一个参数是值，第二个是键名(在数组中对应的是数值型的索引值)。请看这个示例：

```javascript
let map = new Map([
    ['name', 'Nicholas'],
    ['age', 24],
]);

map.forEach(function (value, key, ownerMap) {
    console.log(key + ' ' + value);
    console.log(ownerMap === map);
});

//name Nicholas
//age 24
```

### Weak Map 集合

`Weak Set`是弱引用`Set`集合，相对的，`Weak Map`是弱引用`Map`集合，也用于存储对象的弱引用。`Weak map`集合中的键名必须是一个对象，如果使用非对象键名会报错；集合中保存的是对这些对象的弱引用，如果在弱引用之外不存在其他强引用，引擎的垃圾回收机制会自动回收这个对象，同时也会移除`Weak Map`集合中的键值对。但是只有集合的键名遵从这个规则，键名对应的值如果是一个对象，则保存的是对象的强引用，不会触发垃圾回收机制。

`Weak Map`集合最大的用途是保存`Web`页面中移除保存过的`DOM`元素，如果通过库本身将这些对象从集合中清除；否则，库在`DOM`元素无用后可能依然保持对它们的引用，从而导致内存泄漏，最终程序不再正常执行。如果用`Weak Map`集合来跟踪`DOM`元素，这些库仍然可以通过自定义的对象整合每一个`DOM`元素，而且当`DOM`元素消失时，可自动销毁集合中的相关对象。

### 使用 Weak Map 集合

`ECMAScript 6`中的`Weak Map`类型是一种存储着许多键值对的无序列表，列表的键名必须是非`null`类型的对象，键名对应的值则可以是任意类型。`Weak Map`的接口与`Map`非常相似，通过`set()`方法添加数据，通过`get()`方法获取数据：

```javascript
let map = new Map(),
    element = document.createElement('div');

document.body.append(element);

map.set(element, 'Original');

let value = map.get(element);
console.log(value === 'Original');

//移除element元素
element.parentNode.removeChild(element);
element = null;

//此时Weak Map集合为空
```

### Weak Map 集合的初始化方法

`Weak Map`集合的初始化过程与`Map`集合类似，调用`WeakMap`构造函数并传入一个数组容器，容器内包含其他数组，每一个数组由两个元素构成：第一个元素是一个键名，传入的值必须是非`null`的对象；第二个元素是这个键对应的值（可以是任意类型）。举个例子：

```javascript
let key1 = {},
    key2 = {},
    map = new WeakMap([
        [key1, 'Hello'],
        [key2, 42],
    ]);

console.log(map.has(key1) === true);
console.log(map.get(key1) === 'Hello');
console.log(map.has(key2) === true);
console.log(map.get(key2) === 42);
```

### Weak Map 集合支持的方法

`Weak Map`集合只支持两个可以操作键值对的方法：`has()`方法可以检测给定键在集合中是否存在；`delete()`方法可以移除指定的键值对。`Weak Map`集合与`Weak Set`集合一样，二者都不支持键名枚举，从而也不支持`clear()`方法。以下示例分别使用了`has()`和`delete()`方法：

#### 私有对象数据

尽管`Weak Map`集合会被大多数开发者用于储存 DOM 元素，但它其实也有许多其他的用途（无疑有一些用途尚未被发现），其中的一个实际应用是存储对象实例的私有数据。在`ECMAScript 6`中对象的所有属性都是公开的，如果想要储存一些只对对象开放的数据，则需要一些创造力，请看一下这个示例：

```javascript
function Person(name) {
    this._name = name;
}

Person.prototype.getName = function () {
    return this._name;
};
```

在这段代码中，约定前缀为下划线\_的属性为私有属性，不允许在对象实例外改变这些属性。例如，只能通过`getName()`方法读取`this._name`属性，不允许改变它的值。然而没有任何标准规定如何写`_name`属性，所以它也有可能在无意间被覆写。

在`ECMAScript 5`中，可以通过以下这种模式创建一个对象接近真正的私有数据：

```javascript
var Person = (function () {
    var privateData = {},
        privatedId = 0;

    function Person(name) {
        Object.defineProperty(this, '_id', {
            value: privatedId++,
        });

        privateData[this._id] = {
            name: name,
        };
    }

    Person.prototype.getName = function () {
        return privateDate[this._id].name;
    };

    return Person;
})();
```

在上面的示例中，变量`Person`由一个立即调用函数表达式(IIFE)生成，包括两个私有变量：`privateData`和`privateId`。`privateData`对象储存的是每一个实例的私有信息，`privateId`则为每个实例生成一个独立`ID`。当调用`Person`构造函数时，属性`_id`的值会被加 1，这个属性不可枚举、不可配置并且不可写。

然后，新的条目会被添加到`privateData`对象中，条目的键名是对象实例的 ID；`privateData`对象中储存了所有实例对应的名称。调用`getName()`函数，即可通过`this._id`获得当前实例的 ID，并以此从`privateData`对象中提取实例名称。在`IIFE`外无法访问`privateData`对象，即使可以访问`this._id`,数据实际上也很安全。

这种方法最大的问题是，如果不主动管理，由于无法获知对象实例何时被销毁，因此`privateData`中的数据就永远不会消失。而使用`Weak Map`集合就可以解决这个问题，就像这样：

```javascript
let Person = (function () {
    let privateDate = new WeakMap();

    function Person(name) {
        privateData.set(this, {
            name: name,
        });
    }

    Person.prototype.getName = function () {
        return privateDate.get(this).name;
    };

    return Person;
})();
```

经过改进后的`Person`构造函数选用一个`Weak Map`集合来存放私有数据。由于`Person`对象的实例可以直接作为集合的键使用，无须单独维护一套 ID 的体系来跟踪数据。调用`Person`构造函数时，新条目会被添加到`Weak Map`集合中，条目的键是`this`,值是对象包含的私有信息，在这个示例中，值是一个包含`name`属性的对象。调用`getName()`函数时会将`this`传入`privateData.get()`方法作为参数获取私有信息，亦即获取`value`对象并且访问`name`属性。只要对象实例被销毁，相关信息也会被销毁，从而保证了信息的私有性。

#### Weak Map 集合的使用方式及使用限制

当你要在`Weak Map`集合与普通的`Map`集合之间做出选择时，需要考虑的主要问题是，是否只用对象作为集合的键名。如果是，那么`Weak Map`集合是最好的选择。当数据再也不可访问后集合存储的相关引用和数据都会被自动回收，这有效地避免了内存泄漏地问题，从而优化了内存的使用。

请记住，相对`Map`集合而言，`Weak Map`集合对用户的可见度更低，其不支持通过`forEach()`方法、`size`属性及`clear()`方法来管理集合中的元素。如果你非常需要这些特性，那么`Map`集合是一个更好的选择，只是一定要留意内存的使用情况。

当然，如果你只想使用非对象作为键名，那么普通的`Map`集合是你唯一的选择。
