# 改进的数组功能

## 创建数组

如果想将一个类数组对象（具有数组索引和`length`属性的对象）转换为数组，可选的方法也十分有限，经常需要编写额外的代码。为了进一步简化`JavaScript`数组的创建过程，`ECMAScript 6`新增了`Array.of()`和`Array.from()`两种方法。

### Array.of()方法

`ECMAScript 6`之所以向`JavaScript`添加新的创建方法，是要帮助开发者们规避通过`Array`构造函数创建数组时的怪异行为。事实上，`Array`构造函数表现得与传入的参数类型及数量有些不符，例如：

```javascript
let items = new Array(2);
console.log(items.length); //2
console.log(items[0]); //undefined
console.log(items[1]); //undefined

items = new Array('2');
console.log(items.length); //1
console.log(items[0]); //"2"

items = new Array(1, 2);
console.log(items.length); //2
console.log(items[0]); //1
console.log(items[1]); //2

items = new Array(3, '2');
console.log(items.length); //2
console.log(items[0]); //3
console.log(items[1]); //"2"
```

如果给`Array`构造函数传入一个数值型的值，那么数组的`length`属性会被设为该值；如果传入一个非数值类型的值，那么这个值会成为目标数据的唯一项；如果传入多个值，此时无论这些值是不是数值型的，都会变成数组的元素。这个特性令人感到困惑，你不可能总是注意传入数据的类型，所以存在一定的风险。

`ECMAScript 6`通过引入`Array.of()`方法来解决这个问题。`Array.of()`与`Array`构造函数的工作机制类似，只是不存在单一数值型参数值的特例，无论有多少参数，无论参数是什么类型的，`Array.of()`方法总会创建一个包含所有参数的数组。以下是一些`Array.of()`方法的调用示例：

```javascript
let items = Array.of(1, 2);
console.log(items.length); //2
console.log(items[0]); //1
console.log(items[1]); //2

items = Array.of(2);
console.log(items.length); //1
console.log(items[0]); //2

items = Array.of('2');
console.log(items.length); //1
console.log(items[0]); //"2"
```

要用`Array.of()`方法创建数组，只需传入你希望在数组中包含的值。但如果需要给一个函数传入`Array`的构造函数，则你可能希望传入`Array.of()`来确保行为一致。例如：

```javascript
function createArray(arrayCreator, value) {
    return arrayCreator(value);
}

let items = createArray(Array.of, value);
```

在这段代码中，`createArray()`函数接受两个参数，一个是数组创造者函数，另一个是插入数组的值。可以传入`Array.of()`作为`createArray()`方法的第一个参数来创建新数组，如果不能保证传入的值一定不是数字，那么直接传入`Array`会非常危险。

`Array.of()`方法不通过`Symbol.species`属性确定返回值的类型，它使用当前构造函数(也就是`of()`方法中的`this`值)来确定正确的返回数据的类型。

### Array.from()方法

`JavaScript`不支持直接将非数组对象转换为真实数组，`arguments`就是一种类数组对象，如果要把它当作数组使用则必须先转换该对象的类型，在`ECMAScript 5`中，可能需要编写如下函数把类数组转换为数组：

```javascript
function makeArray(arrayLike) {
    var result = [];
    for (let i = 0; i < arrayLike.length; i++) {
        result.push(arrayLike[i]);
    }
    return result;
}

function doSomething() {
    var args = makeArray(arguments);
    //使用args
}
```

这种方法先是手动创建一个`result`数组，再将`arguments`对象里的每一个元素复制到新数组中。尽管这种方法有效，但需要编写很多代码才能完成如此简单的操作。最终，开发者们发现了一种只需编写极少代码的新方法，调用数组原生的`slice()`方法可以将非数组对象转换为数组，就像这样：

```javascript
function makeArray(arrayLike) {
    return Array.prototype.slice.call(arrayLike);
}

function doSomething() {
    var args = makeArray(arguments);

    //使用的args
}
```

这段代码的功能等价于之前的示例，将`slice()`方法执行时的`this`值设置为类数组对象，而`slice()`对象只需数值型索引和`length`属性就能够正确运行，所以任何类数组对象都能被转换为数组。

尽管这项技术不需要编写很多代码，但是我们调用`Array.prototype.slice.call(arrayLike)`时不能直觉地想到这是在"将`arrayLike`转换成一个数组"。所幸，`ECMAScript 6`添加了一个语义清晰、语法简洁地新方法`Array.from()`来将对象转换为数组。

`Array.from()`方法可以接受可迭代对象或类数组对象作为第一个参数，最终返回一个数组。请看以下这个示例：

```javascript
function doSomthing() {
    var args = Array.from(arguments);

    //使用args
}
```

`Array.from()`方法调用会基于`arguments`对象中的元素创建一个新数组，`args`是`Array`的一个实例，包含`arguments`对象中同位置的相同值。

**`Array.from()`方法也是通过`this`来确定返回数组的类型的。**

#### 映射转换

如果想要进一步转化数组，可以提供映射函数作为`Array.from()`的第二个参数，这个函数用来将类数组对象中的每一个值转换成其他形式，最后将这些结果储存在结果数组的相应索引中。请看以下示例：

```javascript
function translate() {
    return Array.from(arguments, (value) => value + 1);
}

let numbers = translate(1, 2, 3);

console.log(numbers); //[2, 3, 4]
```

在这段代码中，为`Array.from()`方法传入映射函数`value => value + 1`，数组中的每个元素在储存前都会加`1`。如果用映射函数处理对象，也可以给`Array.from()`方法传入第三个参数来表示映射函数的`this`值。

```javascript
let helper = {
    diff: 1,
    add(value) {
        return value + this.diff;
    },
};

function translate() {
    return Array.from(arguments, helper.add, helper);
}

let numbers = translate(1, 2, 3);

console.log(numbers); //[2, 3, 4]
```

此示例传入`help.add()`作为转换用的映射函数，由于该方法使用了`this.diff`属性，因此需要为`Array.from()`方法提供第三个参数来指定`this`的值，从而无须通过调用`bind()`方法或其他方式来指定`this`的值了。

### 用`Array.from()`转换可迭代对象

`Array.from()`方法可以处理类数组对象和可迭代对象，也就是说该方法能够将所有含有`Symbol.iterator`属性的对象转换为数组，例如：

```javascript
let numbers = {
    *[Symbol.iterator]() {
        yield 1;
        yield 2;
        yield 3;
    },
};

let numbers2 = Array.from(numbers, (value) => value + 1);
console.log(numbers2); //[2, 3, 4]
```

由于`numbers`是一个可迭代对象，因此可以直接将它传入`Array.from()`来转换数组。此处的映射函数将每一个数字加`1`,所以结果数组最终包含的值为`2`、`3`和`4`。

**如果一个对象既是类数组又是可迭代的，那么`Array.from()`方法会根据迭代器来决定转换哪个值。**

## 为所有数组添加的新方法

`ECMAScript 6`延续了`ECMAScript 5`的一贯风格，也为数组添加了几个新的方法。`find()`方法和`findIndex()`方法可以协助开发者在数组中查找任意值：`fill()`方法和`copyWithin()`方法的灵感则来自于定型数组的使用过程，定型数组也是`ECMAScript 6`中的新特性，是一种只包含数字的数组。

### find()方法和 findIndex()方法

在`ECMAScript 5`以前的版本中，由于没有内建的数组搜索方法，因此想在数组中查找元素会比较麻烦，于是`ECMAScript 5`正式添加了`indexOf()`和`lastIndexOf()`两个方法，可以用它们在数组中查找特定的值。虽然这是一个巨大的进步，但这两种方法仍有局限之处，即每次只能查找一个值，如果想在一系列数字中查找第一个偶数，则必须自己编写代码来实现。于是`ECMAScript 6`引入了`find()`和`findIndex()`方法来解决这个问题。

`find()`和`findIndex()`方法都接受两个参数：一个是回调函数；另一个是可选参数，用于指定回调函数中`this`的值。执行回调函数时，传入的参数分别为：数组中的某个元素和该元素在数组中的索引及数组本身，于传入`map()`和`forEach()`的参数相同。如果给定的值满足定义的标准，回调函数应返回`true`,一旦回调函数返回`true`,`find()`方法和`findIndex()`方法会立即停止搜索数组剩余的部分。

二者唯一的区别，是`find()`方法返回查找到的值，`findIndex()`方法返回查找到的值的索引。请看以下这个示例：

```javascript
let numbers = [25, 30, 35, 40, 45];

console.log(numbers.find((n) => n > 33)); //35
console.log(numbers.findIndex((n) => n > 33)); //2
```

如果要在数组中根据某个条件查找匹配的元素，那么`find()`方法和`findIndex()`方法可以很好地完成任务；如果只想查找与某个值匹配的元素，则`indexOf()`方法和`lastIndexOf()`方法是更好的选择。

### fill()方法

`fill()`方法可以用指定的值填充一至多个数组元素。当传入一个值时，`fill()`方法会用这个值重写数组中的所有值，例如：

```javascript
let numbers = [1, 2, 3, 4];
numbers.fill(1);

console.log(numbers.toString()); //1,1,1,1
```

在此示例中，调用`numbers.fill(1)`方法后`numbers`中所有的值会变成`1`,如果只想改变数组某一部分的值，可以传入开始索引和不包含结束索引（不包含索引当前值）这两个可选参数，就像这样：

```javascript
let numbers = [1, 2, 3, 4];

numbers.fill(1, 2);

console.log(numbers.toString()); //1,2,1,1

numbers.fill(0, 1, 3);

console.log(numbers.toString()); //1,0,0,1
```

**如果开始索引或结束索引为负值，那么这些值会与数组的`length`属性相加来作为最终位置。例如，如果开始位置为`-1`,那么索引的值实际为`array.length - 1`，`array`为调用`fill()`方法的数组。**

### copyWithin()方法

`copyWithin()`方法与`fill()`方法相似，其也可以同时改变数组中的多个元素。`fill()`方法是将数组元素赋值为一个指定的值，而`copyWithin()`方法则是从数组中复制元素的值。调用`copyWithin()`方法时需要传入两个参数：一个是该方法开始填充值的索引位置，另一个是开始复制值的索引位置。

举个例子，复制数组前两个元素的值到后两个元素，需要这样做：

```javascript
let numbers = [1, 2, 3, 4];

//从数组的索引2开始粘贴值
//从数组的索引0开始复制值
numbers.copyWithin(2, 0);

console.log(numbers.toString()); //1,2,1,2
```

这段代码从`numbers`的索引`2`开始粘贴值，所以索引`2`和`3`将被重写。给`copyWithin()`传入第二个参数`0`表示，从索引`0`开始复制值并持续给没有更多可复制的值。

默认情况下，`copyWithin()`会一直复制直到数组末尾的值，但是你可以提供可选的第三个参数来限制被重写元素的数量。第三个参数是不包括结束索引，用于指定停止复制值的位置。在代码中它是这样的：

```javascript
let numbers = [1, 2, 3, 4];

//从数组的索引2开始粘贴值
//从数组的索引0开始复制值
//当位于索引1时停止复制值
numbers.copyWithin(2, 0, 1);

console.log(numbers.toString()); //1,2,1,4
```

在这个示例中，由于可选的索引被设置为了`1`,因此只有索引`0`的值被复制了，数组中的最后一个元素保持不变。

**正如`fill()`方法一样，`copyWithin()`方法的所有参数都接受负数值，并且会自动与数组长度相加来作为最终使用的索引。**

可能此时你尚不知晓`fill()`方法和`copyWithin()`方法的实际用途，其原因是这两个方法起源于定型数组，为了保持数组方法的一致性才添加到常规数组中的。无论如何，正如我们将在下一节要学习的，如果使用定型数组来操作数字的比特，这些方法将大显身手。
