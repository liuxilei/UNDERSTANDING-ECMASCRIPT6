# 了解 ECMAScript 7(2016)

## 指数运算符

`ECMAScript 2016`引入了唯一一个`JavaScript`语法变化是求幂运算符，它是一种将指数应用于基数的数学运算，`JavaScript`已有的`Math.pow()`方法可以执行求幂运算，但它也是为数不多的需要通过方法而不是正式的运算符来进行求幂运算的语言之一。此外，一些开发者认为运算符更易阅读和理解。求幂运算符是两个星号（\*\*）;左操作数是基数，右操作数是指数。例如：

```javascript
let result = 5 ** 2;

console.log(result); //25
console.log(result === Math.pow(5, 2)); //true
```

此示例计算`5^2`,得到的结果为`25`。你仍可以使用`Math.pow()`方法来获得相同的结果。

## 运算顺序

求幂运算符在`JavaScript`所有二进制中具有最高的优先级（一元运算符的优先级高于`**`），这意味着它首先应用于所有复合操作，如此示例所示：

```javascript
let result = 2 * 5 ** 2;
console.log(result); //50
```

先计算`5^2`,然后将得到的值乘以`2`，最终结果为`50`。

## 运算限制

取幂运算符确实有其他的运算符没有的一些不寻常的限制，它左侧的一元表达式只能使用`++`或`--`。例如，这段代码使用了无效的语法：

```javascript
//语法错误
let result = (-5) ** 2;
```

此示例中的`-5`的写法是一个语法错误，因为运算的顺序是不明确的。`-`是只适用于`5`呢，还是适用于表达式`5 ** 2`的结果？禁用求幂运算符左侧的一元表达式可以消除歧义。要明确指明意图，需要用括号包括`-5`或`5**2`，如下所示：

```javascript
//可以包裹5**2
let result1 = -(5 ** 2); //等于-25

//也可以包裹-5
let result2 = (-5) ** 2; //等于25
```

如果在表达式两端放置括号，则`-`将应用于整个表达式；如果在`-5`两端放置括号，则表明想计算`-5`的二次幂。

在求幂运算符左侧无须用括号就可以使用`++`和`--`,因为这两个运算符都明确定义了作用于操作数的行为。前缀`++`或`--`会在其他所有操作发生之前更改操作数，而后缀版本直到整个表达式过后才会进行改变。这两个用法在运算符左侧都是安全的，代码如下：

```javascript
let num1 = 2,
    num2 = 2;

console.log((++num1) ** 2); //9
console.log(num1); //3

console.log((num2--) ** 2); //4
console.log(num2); //1
```

在这个示例中，`num1`在应用取幂运算符之前先加`1`,所以`num1`变为`3`,运算结果为`9`;而`num2`取幂运算的值保持为`2`，之后再减`1`。

## Array.prototype.includes()方法

你可能还记得`ECMAScript 6`通过添加`String.prototype.includes()`方法来检查给定字符串中是否存在某些子字符串。起初，`ECMAScript 6`也通过引入`Array.prototype.includes()`方法来延续相似的字符串和数组处理方式。但在`ECMAScript 6`到期时`Array.prototype.includes()`的标准仍未完善，所以它最终出现在`ECMAScript 2016`中。

### 如何使用`Array.prototype.includes()`方法

`Array.prototype.includes()`方法接受两个参数：要搜索的值开始搜索的索引位置，第二个参数是可选的。提供第二个参数时，`includes()`将从该索引开始匹配（默认的开始索引位置为`0`）。如果在数组中找到要搜索的值，则返回`true`，否则返回`false`。例如：

```javascript
let values = [1, 2, 3];

console.log(values.includes(1)); //true
console.log(values.includes(0)); //false

//从索引2开始查找
console.log(values.includes(1, 2)); //false
```

这里，调用`values.includes()`方法时若传入`1`则返回`true`；若传入`0`则返回`false`,因为`0`不在数组中。当传入第二个参数时，从索引`2`（该位置的值为`3`）的位置开始搜索，`values.includes()`方法返回`false`,因为索引`2`到数组结尾这中间没有`1`这个值。

### 值的比较

用`includes()`方法进行值比较时，`===`操作符的使用有一个例外：即使`NaN===NaN`的计算结果为`false`,`NaN`也被认为是等于`NaN`,这与`indexOf()`方法的行为不同，后者严格使用`===`进行比较。我们通过以下代码来看二者的差异：

```javascript
let values = [1, NaN, 2];

console.log(values.includes(NaN)); //true
console.log(values.indexOf(NaN)); //-1
```

即使`NaN`包含在数组中，给`values.indexOf()`方法传入`NaN`时也会返回`-1`,而给`value.includes()`方法传入`NaN`时则返回`true`，因为它使用了一个不同的值比较运算符。

如果你想检查数组中是否存在某个不知道索引的值，由于给`includes()`方法和`indexOf()`方法分别传入`NaN`的结果差异，这里建议使用`includes()`方法。如果你想知道某个值在数组的那个位置，则必须使用`indexOf()`方法。

这个实现还有另外一个奇怪之处，`+0`和`-0`被认为是相等的。在这种情况下，`indexOf()`和`includes()`的表现行为相同。

```javascript
let values = [1, +0, 2];
console.log(values.indexOf(-0)); //1
console.log(values.indexOf(-0)); //true
```

在这个示例中，由于两个值被认为是相等的，因此传入`-0`时，`indexOf()`和`includes()`都会找到`+0`。请注意，这些方法与`Object.is()`方法的行为不同，它会将`+0`和`-0`识别为不同的值。

### 函数作用域严格模式的一处改动

当`ECMAScript 5`中引入严格模式时，其语言比起`ECMAScript 6`中的语言要简单得多，但在`ECMAScript 6`中仍然可以使用`"use strict"`指令来指定严格模式。当该指令被用于全局作用域时，所有代码都将运行在严格模式下；当该指令被用于函数作用域时，只有该函数运行在严格模式下。后者在`ECMAScript 6`中会引发一些问题，因为参数可能会以更复杂的方式来定义，特别是通过解构来定义和提供默认参数值时。

要理解问题所在，请看以下代码：

```javascript
function doSomething(first = this) {
    'use strict';
    return first;
}
```

在这示例中，首先将参数`first`赋值为`this`,你可能认为`ECMAScript 6`标准会指示`JavaScript`引擎在这种情况下用严格模式处理参数，所以`first`的值是`undefined`。但是函数中存在`"use strict"`时，实现运行在严格模式下的参数非常困难，因为参数默认值也可以是函数。这个难点导致大多数`JavaScript`引擎不实现此功能，而是将其等同于全局对象。

由于实现困难，`ECMAScript 2016`规定在参数被解构或有默认参数的函数中禁止使用`"use strict"`指令。只有参数为不包含解构或默认值的简单参数列表时才可以在函数体中使用`"use strict"`。以下是一些合法与非法使用指令的示例：

```javascript
//此处使用简单参数列表，可以运行
function okay(first, second) {
    'use strict';
    return first;
}

//抛出语法错误
function noOkay1(first, seconds = first) {
    'use strict';
    return first;
}

//抛出语法错误
function notOkay2({ first, second }) {
    'use strict';
    return first;
}
```

你仍然可以在应用简单参数列表的同时使用`"use strict"`指令，这也是`okay()`如预期运行的原因（就像`ECMAScript 2016`中，使用默认参数值的函数不能再使用"use strict"指令；同样，`noOkey2()`函数也会抛出语法错误，因为在有解构参数的函数中也不能使用`"use strict"`指令。）总而言之，这是`JavaScript`开发者感到迷惑的一点，这一改变消除了这些疑惑并解决了`JavaScript`引擎的一个实现问题。
