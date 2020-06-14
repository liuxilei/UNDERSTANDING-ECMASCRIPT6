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

`Function`构造函数是`JavaScript`语法中很少被用到的一部分，通常我们用它来动态创建新的函数。这种构造函数接受字符串形式的参数，分别为函数的参数及函数体。

```javascript
var add = new Function("first", "second", "return first + second");
console.log(add(1, 1)); //2
```

`ECMAScript 6`增强了`Function`构造函数的功能，支持在创建函数时定义默认参数和不定参数。唯一需要做的是在参数名后添加一个等号及默认值，就像这样：

```javascript
var add = new Function("first", "second = first", "return first + second");

console.log(add(1, 1)); //1
console.log(add(1)); //1
```

定义不定参数，只需在最后一个参数前添加...，像这样

```javascript
var pickFirst = new Function("...args", "return args[0]");

console.log(pickFirst(1, 2)); //1
```

## 展开运算符

```javascript
let value1 = 25,
    value2 = 50;

console.log(Math.max(value1, value2)); //50
```

`Math.max()`方法不允许传入数组，所以在`ECMAScript5`及早期版本中，可能需要手动实现从数组中遍历取值，或者像这样使用`apply()`方法：

```javascript
let values = [25, 50, 75, 100];

console.log(Math.max.apply(Math, values)); //100
```

使用`ECMAScript 6`中的展开运算符就可以简化上述示例。

```javascript
let values = [25, 50, 75, 100];

console.log(Math.max(...values)); //100
```

## name属性

### 如何选择合适的名称

`ECMAScript 6`程序中所有的函数的`name`属性都有一个合适的值。在接下来的示例中展示了一个函数和一个函数表达式，并打印了各自的`name`属性：

```javascript
function doSomething() {
    //空函数
}

var doAntherThing = function() {
    //空函数
}

console.log(doSomething.name); //doSomething
console.log(doAntherThing.name); //doAntherThing
```

在这段代码中，`doSomething()`函数的`name`属性值为`doSomething`,对应着声明时的函数名称；匿名函数表达式`doAnotherThing()`的`name`属性值为`doAnotherThing`,对应着被赋值为该匿名函数的变量的名称。

### name属性的特殊情况

尽管确定函数声明和函数表达式的名称很容易，`ECMAScript6`还是做了更多的改进来确保所有函数都有合适的名称，请看接下来的这段程序：

```javascript
var doSomething = function doSomethingElse() {
    //空函数
}

var person = {
    get firstName() {
        return "Nicholas"
    },
    sayName: function() {
        console.log(this.nama);
    }
};

console.log(doSomething.name); //doSomethingElse
console.log(person.sayName.name); //sayName
console.log(person.firstName.name); //undefined
```

还有另外两个有关函数名称的特例：通过`bind()`函数创建的函数，其名称将带有`bound`前缀；通过`Function`构造函数创建的函数，其名称将是`anonymous`，正如如下示例：

```javascript
var doSomething = function() {
    //空函数
};

console.log(doSomething.bind().name); //bound doSomething
console.log((new Function()).name); //anonymous
```

切记，函数`name`属性的值不一定引用同名变量，它只是协助调试用的额外信息，所以不能使用`name`属性的值来获取对于函数的引用。

## 明确函数的多重用途

`ECMAScript 5`及早期版本中的函数具有多重功能，可以结合`new`使用，函数内的`this`值将指向一个新对象，函数最终会返回这个新对象，如本示例所示：

```javascript
function Person(name) {
    this.name = name;
}

var person = new Person("Nicholas");
var notAPerson = Person("Nicholas");

console.log(person); //Person {name: "Nicholas"}
console.log(notAPerson); //undefined
```

`JavaScript`函数有两个不同的内部方法：`[[Call]]`和`[[Construct]]`.当通过`new`关键字调用函数时，执行的是`[[Construct]]`函数，它负责创建一个通常被称作实例的新对象，然后再执行函数体，将`this`绑定到实例上；如果不通过`new`关键字调用函数，则执行`[[Call]]`函数，从而直接执行代码中的函数体。具有`[[Construct]]`方法的函数被统称为构造函数。

切记，不是所有函数都有`[[Construct]]`方法，因此不是所有函数都可以通过`new`来调用，例如，我们在本章后面讲解的箭头函数就没有这个`[[Construct]]`方法。

### 在ECMAScript5中判断函数被调用的方法

在`ECMAScript5`中，如果想确定一个函数是通过`new`关键字被调用(或者说，判断该函数是否作为构造函数被调用)，最流行的方式是使用`instanceof`,举个例子：

```javascript
function Person(name) {
    if (this instanceof Person) {
        this.name = name;
    } else {
        throw new Error("必须通过new关键字来调用Person");
    }
}

var person = new Person("Nicholas");
console.log(person); //Person {name: "Nicholas"}
var notAPerson = Person("Nicholas"); //抛出错误
```

在这段代码中，首先检查`this`的值，看它是否为构造函数的实例，如果是，则继续正常执行；如果不是，则抛出错误。由于`[[Construct]]`方法会创建一个`Person`新实例，并将`this`绑定到新实例上，通常来说这样做是正确的，但这个方法也不完全可靠，因为有一种不依赖`new`关键字的方法也可以将`this`绑定到`Person`的实例上，如下所示：

```javascript
function Person(name) {
    if (this instanceof Person) {
        this.name = name;
    } else {
        throw new Error("必须通过new关键字来调用Person.");
    }
}

var person = new Person("Nicholas");
var notAPerson = Person.call(person, "Michael");

console.log(person);//Person {name: "Nicholas"}
console.log(notAPerson); //undefined
```

### 元属性（Metaproperty）new.target

为了解决判断函数是否通过`new`关键字调用的问题，`ECMAScript6`引入了`new.target`这个元属性。元属性是指非对象的属性，其可以提供非对象目标的补充信息（例如`new`）.当调用函数的`[[Construct]]`方法时，`new.target`被赋值为`new`操作符的目标，通常是新创建对象实例，也就是函数体内`this`的构造函数；如果调用`[[Call]]`方法，则`new.target`的值为`undefined`.

```javascript
function Person(name) {
    if (typeof new.target !== "undefined") {
        this.name = name;
    } else {
        throw new Error("必须通过new关键字来调用Person.");
    }
}

var person = new Person("Nicholas");
var notAPerson = Person.call(person, "Michael"); //抛出错误
```

也可以检查`new.target`是否被某个特定构造函数所调用，举个例子：

```javascript
function Person(name) {
    if (new.target === Person) {
        this.name = name;
    } else {
        throw new Error("必须通过new关键字来调用Person。");
    }
}

function AnotherPerson(name) {
    Person.call(this, name);
}

var person = new Person("Nicholas");
var notAPerson = new AnotherPerson("Nicholas"); //抛出错误
```

## 块级函数

在`ECMAScript 3`和早期版本中，在代码块中声明一个块级函数严格来说是一个语法错误，但是所有的浏览器仍然支持这个特性。但是很不幸，每个浏览器对这个特性的支持都稍有不同，所以最好不要使用这个特性（最好的选择是使用函数表达式）。

为了遏制这种相互不兼容的行为，`ECMAScript 5`的严格模式中引入了一个错误提示，当在代码内部声明时程序会抛出错误：

```javascript
"use strict";

if (true) {
    //在ES5中抛出错误，在ES6中不报错
    function doSomething() {
        //空函数
    }
}
```

在ECMAScript 5中，代码会抛出语法错误；在`ECMAScript 6`中，会将`doSomething()`函数视作一个块级声明，从而可以在定义函数的代码块内访问和调用它。举个例子：

```javascript
"use strict";

if (true) {
    console.log(typeof doSomething);

    function doSomething() {
        //空函数
    }

    doSomething();
}

console.log(typeof doSomething)

//function
//undefined
```

在定义函数块内，块级函数会被提升至顶部，所以`typeof doSomething`的值为`function`,这也佐证了，即使你在函数定义的位置前调用它，还是能返回正确结果；但是一旦`if`语句代码块结束执行，`doSomething()`函数将不再存在。

### 块级函数的使用场景

块级函数与`let`函数表达式类似，一旦执行过程流出了代码块，函数定义立即被移除。二者的区别是，在该代码块中，块级函数会被提升至块的顶部，而用`let`定义的函数表达式不会被提升。如以下代码所示：

```javascript
"use strict";

if (true) {
    console.log(typeof doSomething);

    let doSomething = function() {
        //空函数
    }

    doSomething();
}

//Cannot access 'doSomething' before initialization(TDZ)
```

### 非严格模式下的块级函数

在`ECMAScript 6`中，即使处于非严格模式下，也可以声明块级函数，但其行为与严格模式下稍有不同。这些函数不再提升至代码块的顶部，而是提升至外围函数或全局作用域的顶部。举个例子：

```javascript
//ECMAScript 6中的行为
if (true) {
    console.log(typeof doSomething);

    function doSomething() {
        //空函数
    }

    doSomething();
}

console.log(typeof doSomething);

//function
//function
```

在这个例子中，`doSomething()`函数被提升至全局作用域，所以在`if`代码块处也可以访问到。`ECMAScript 6`将这个行为标准化了，移除了之前存在于个浏览器之间不兼容的行为，所以所有`ECMAScript 6`的运行时环境都将执行这一标准。

将块级函数标准化有助于提升声明函数的能力，与此同时，`ECMAScript 6`标准还引入了另外一种全新的方式来声明函数。

## 箭头函数

它与传统的JavaScript函数有些许不同，主要集中在以下方面：

- `没有this、super、arguments和new.target绑定` 箭头函数中的`this`、`super`、`arguments`及`new.target`这些值由外围最近一层非箭头函数决定。

- `不能通过new关键字调用` 箭头函数没有`[[Construct]]`方法，所以不能被用作构造函数，如果通过`new`关键字调用箭头函数，程序会抛出错误。

- `没有原型` 由于不可以通过`new`关键字调用箭头函数，因而没有构造原型的需求，所有箭头函数不存在`prototype`这个属性。

- `不可以改变this的绑定` 函数内部的`this`值不可被改变，在函数的生命周期内始终保持一致。

- `不支持arguments对象` 函数内部没有`arguments`绑定，所以你必须通过命名参数和不定参数这两种形式访问函数的参数。

- `不支持重复的命名参数` 无论是在严格还是非严格模式下，箭头函数都不支持重复的命名参数；而在传统函数的规定中，只有在严格模式下才不能有重复的命名参数。

### 箭头函数语法

```javascript
let reflect = value = value;

let sum = (num1, num2) => num1 + num2;

let getName = () => "Nicholas";
```

如果你希望为函数编写由多个表达式组成的更传统的函数体，那么需要用花括号包裹函数体，并显式地定义一个返回值，就像这个版本的`sum()`函数一样：

```javascript
let sum = (num1, num2) => {
    return num1 + num2;
}
```

除了`arguments`对象不可用以外，某种程度上你都可以将花括号里的代码视作传统的函数体定义。

如果想创建一个空函数，需要写一对没有内容的花括号，就像这样：

```javascript
let doNothing = () => {};
```

花括号代表函数体的部分，到目前为止一切都运行良好。但是如果想让箭头函数向外返回一个对象字面量，则需要将该字面量包裹在小括号里。举个例子：

```javascript
let getTempItem = id => ({ id, name: "Temp"});
```

将对象字面量包裹在小括号中是为了将其与函数体区分开来。

### 创建立即执行函数表达式

JavaScript函数的一个流行的使用方式是创建立即执行函数表达式(IIFE),你可以定义一个匿名函数并立即调用，自始至终不保存对该函数的引用。当你想创建一个与其他程序隔离的作用域时，这种模式非常方便。举个例子：

```javascript
let person = function(name) {
    return {
        getName: function() {
            return name;
        }
    }
}("Nicholas");

console.log(person.getName()); //Nicholas
```

只要将箭头函数包裹在小括号里，就可以用它来实现相同的功能：

```javascript
let person = (name => {
    return {
        getName: function() {
            return name;
        }
    }
})("Nicholas");

console.log(person.getName()); //Nicholas
```

### 函数体没有this绑定

函数内的`this`绑定是`JavaScript`中最常出现错误的因素，函数内的`this`值可以根据函数调用的上下文而改变，这有可能错误地影响其他对象。
思考以下这个示例：

```javascript
let PageHeader = {
    id: "123456",
    
    init: function() {
        document.addEventListener("click", function(event) {
            this.doSomething(event.type); //抛出错误
        }, false);
    },

    doSomething: function(type) {
        console.log("Handling " + type + " for " + this.id);
    }
};

PageHeader.init(); //index.js:6 Uncaught TypeError: this.doSomething is not a function
```

实际上，因为`this`绑定的是时间目标对象的引用（在这段代码中引用的是document），而没有绑定`PageHeader`,且由于`this.doSomthing()`在目标document中不存在，所以无法正常执行，尝试运行这段代码只会使程序在触发事件处理程序时抛出错误。

可以使用`bind()`方法显示地将函数的`this`绑定到`PageHeader`上来修正这个问题，就像这样：

```javascript
let PageHeader = {
    id: "123456",
    
    init: function() {
        document.addEventListener("click", (function(event) {
            this.doSomething(event.type); 
        }).bind(this), false);
    },

    doSomething: function(type) {
        console.log("Handling " + type + " for " + this.id);
    }
};

PageHeader.init(); //Handling click for 123456
```

现在代码如预期的运行，但可能看起来任然有点儿奇怪，调用`bind(this)`后事实上创建了一个新函数，它的`this`被绑定到当前的`this`,也就是`PageHeader`。为了避免创建一个额外的函数，我们可以通过一个更好的方式来修正这段代码：使用箭头函数。

```javascript
let PageHeader = {
    id: "123456",

    init: function () {
        document.addEventListener("click",
            event => this.doSomething(event.type), false);
    },

    doSomething: function (type) {
        console.log("Handling " + type + " for " + this.id);
    }
};

PageHeader.init(); //Handling click for 123456
```

箭头函数缺少正常函数所拥有的`prototype`属性，它的设计初衷是"即用即弃"，所以不能用它来定义新的类型。如果尝试通过`new`关键字调用一个箭头函数，会导致程序抛出错误，就像这个示例一样：

```javascript
var MyType = () => {},
    object = new MyType(); //Uncaught TypeError: MyType is not a constructor
```

在这段代码中，`MyType`是一个没有`[[Construct]]`方法的箭头函数，所以不能正常执行`new MyType()`。也正是因为箭头函数不能与`new`关键字混用，所以`JavaScript`引擎可以进一步优化它们的行为。

同样，箭头函数中的`this`值取决于该函数外部非箭头函数的`this`值，且不能通过`call()`、`apply()`或`bind()`方法来改变`this`的值。

### 箭头函数和数组

诸如`sort()`、`map()`、`reduce()`这些可以接受回调函数的数组方法，都可以通过箭头函数语法简化编码过程并减少编码量。

### 箭头函数没有arguments绑定

### 箭头函数的辨识方法

尽管箭头函数与传统函数的语法不同，但它同样可以被识别出来，请看以下这段代码：

```javascript
var comparator = (a, b) => a - b;

console.log(typeof comparator); //function
console.log(comparator instanceof Function); //true
```

## 尾调用优化

`ECMAScript6`关于函数最有趣的变化可能是尾调用系统的引擎优化。尾调用指的是函数作为另一个函数的最后一条语句被调用，就像这样：

```javascript
function doSomething() {
    return doSomethingElse();
}

function doSomethingElse() {
    
}
```

在`ECMAScript5`的引擎中，尾调用的实现与其他调用的实现类似；创建一个新的栈帧（stack frame），将其推入调用栈来表示函数调用。也就是说，在循环调用中，每一个未用完的栈帧都会被保存在内存中，当调用栈变得过大时会造成程序问题。

### ECMAScript6中的尾调用优化

`ECMAScript 6`缩减了严格模式下尾调用栈的大小(非严格模式下不受影响)，如果满足以下条件，尾调用不再创建新的栈帧，而是清除并重用当前栈帧：

- 尾调用不访问当前栈帧的变量（也就是说函数不是一个闭包）
- 在函数内部，尾调用是最后一条语句
- 尾调用的结果作为函数值返回

以下这段示例代码满足上述的三个条件，可以被JavaScript引擎自动优化：

```javascript
"use strict";

function doSomething() {
    //优化后
    return doSomethingElse();
}
```

在这个函数中，尾调用`doSomethingElse()`的结果立即返回，不调用任何局部作用域变量。如果做一个小改动，不返回最终结果，那么引擎就无法优化当前函数：

```javascript
"use strict";

function doSomething() {
    //无法优化，无返回
    doSomethingElse();
}
```

同样地，如果你定义一个函数，在尾调用返回后执行其他操作，则函数也无法得到优化：

```javascript
"use strict";

function doSomething() {
    //无法优化
    return 1 + doSomethingElse();
}
```

还有另外一种意外情况，如果把函数调用的结果存储在一个变量里，最后再返回这个变量，则可能导致引擎无法优化，就像这样：

```javascript
"use strict";

function doSomething() {
    //无法优化，调用不在尾部
    let result = doSomethingElse();
    return result;
}
```

由于没有立即返回`doSomethingElse()`函数的值，因此此例中的代码无法被优化。

可能最难避免的情况是闭包的使用，它可以访问作用域中的所有变量，因而导致尾调用优化失效，举个例子：

```javascript
"use strict"

function doSomething() {
    var num = 1,
        func = () => num;
    
    //无法优化，该函数是一个闭包
    return func();
}
```

在此示例中，闭包`func()`可以访问局部变量`num`,即使调用`func()`后立即返回结果，也无法对这段代码进行优化。

### 如何利用尾调用优化

实际上，尾调用的优化发生在引擎背后，除非你尝试优化一个函数，否则无需思考此类问题。递归函数是其最主要的应用场景，此时尾调用优化的效果最显著。请看下面这个阶乘函数：

```javascript
function factorial(n) {
    if (n <= 1) {
        return 1;
    } else {
        return n * factorial(n - 1);
    }
}
```

由于在递归调用前执行了乘法操作，因而当前版本的阶乘函数无法被引擎优化。如果`n`是一个非常大的数，则调用栈的尺寸就会不断增长并存在最终导致栈溢出的潜在风险。

优化这个函数，首先要确保乘法不会在函数调用后执行，你可以通过默认参数来将乘法移出`return`语句，结果函数可以携带着临时结果进入到下一个迭代中。以下这段新代码具有相同的行为，但可以被`ECMAScript 6`引擎优化：

```javascript
function factorial(n, p = 1) {
    if (n <= 1) {
        return 1 * p;
    } else {
        let result = n * p;
        return factorial(n - 1, result);
    }
}
```