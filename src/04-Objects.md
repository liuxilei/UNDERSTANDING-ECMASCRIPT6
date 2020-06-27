# 扩展对象的功能性

## 对象类别

- **普通（Ordinary）对象** 具有JavaScript对象所有的默认内部行为。
- **特异（Exotic）对象** 具有某些与默认行为不符的内部行为。
- **标准（Standard）对象** ECMAScript 6规范中定义的对象，例如`Array`、`Date`等。标准对象既可以是普通对象，也可以是特异对象。
- **内建对象** 脚本开始执行时存在于JavaScript执行环境中的对象，所有标准对象都是内建对象。

## 对象字面量语法扩展

### 属性初始值的简写

当一个对象的属性与本地变量同名时，不必再写冒号和值，简单地只写属性名即可。

```javascript
function createPerson(name, age) {
    return {
        name,
        age
    }
}
```

### 对象方法的简写语法

在`ECMAScript 5`及早期版本中，如果为对象添加方法，必须通过指定名称并完整定义函数来实现，就像这样：

```javascript
var person = {
    name: "Nicholas",
    sayName: function() {
        console.log(this.name);
    }
};
```

而在`ECMAScript 6`中，语法更简洁，消除了冒号和`function`关键字。可以将以上的示例重写如下：

```javascript
var person = {
    name: "Nicholas",
    sayName() {
        console.log(this.name);
    }
};
```

二者唯一的区别是，简写方法可以使用`super`关键字

通过对象方法简写语法创建的方法有一个`name`属性，其值为小括号前的名称，在上述示例中，`person.sayName()`方法的`name`属性的值为`"sayName"`

### 可计算属性名（Computed Property Name）

在`ECMAScript 5`及早期版本的对象实例中，如果想要通过计算得到属性名，就需要用方括号代替点记法。有些包括某些字符的字符串字面量作为标识符会出错，其和变量放在方括号中都是被允许的。请看这个示例：

```javascript
var person = {},
    lastName = "last name";

person["first name"] = "Nicholas";
person[lastName] = "Zakas";

console.log(person["first name"]); //Nicholas
console.log(person[lastName]); //Zakas
```

变量`lastName`被赋值为字符串`"last name"`,引用的两个属性名称中都含有空格，因而不可使用点记法引用这些属性，却可以使用方括号，因为它支持通过任何字符串值作为名称访问属性的值。

此外，在对象字面量中，可以直接使用字符串字面量作为属性名称，就像这样：

```javascript
var person = {
    "first name": "Nicholas"
};

console.log(person["first name"]); //Nicholas
```

这种模式适用于属性名提前已经或可被字符串字面量表示的情况。然而，如果属性名称`"first name"`被包含在一个变量中（就像之前示例中的那样），或者需要通过计算才能得到该变量的值，那么在`ECMAScript 5`中是无法为一个对象字面量定义该属性的。

而在`ECMAScript 6`中，可在对象字面量中使用可计算属性名称，其语法与引用对象实例的可计算属性名称相同，也是使用方括号。举个例子：

```javascript
let lastName = "last name";

let person = {
    "first name": "Nicolas",
    [lastName]: "Zakas"
};

console.log(person["first name"]); //Nicolas
console.log(person[lastName]); //Zakas
```

在对面字面量中使用方括号表示的该属性名称是可计算的，它的内容将被求值并被最终转化为一个字符串，因而同样可以使用表达式作为属性的可计算名称，例如：

```javascript
var suffix = " name";

var person = {
    ["first" + suffix]: "Nicholas",
    ["last" + suffix]: "Zakas"
};

console.log(person["first name"]); //Nicholas   
console.log(person["last name"]); //Zakas
```

## 新增方法

### `Object.is()`方法

```javascript
console.log(+0 == -0); //true
console.log(+0 === -0); //true
console.log(Object.is(+0, -0)); //false

console.log(NaN == NaN); //false
console.log(NaN === NaN); //false
console.log(Object.is(NaN, NaN)); //true

console.log(5 == 5); //true
console.log(5 == "5"); //true
console.log(5 === 5); //true
console.log(5 === "5"); //false
console.log(Object.is(5, 5)); //true
console.log(Object.is(5, "5")); //false
```

对于`Object.is()`方法来说，其运行结果在大部分情况中与`===`运算符相同，唯一的区别在于`+0`与`-0`被识别为不相等并且`NaN`与`NaN`等价。但是你大可不必抛弃等号运算符，是否选择用`Object.is()`方法而不是`==`或`===`取决于那些特殊情况如何影响代码。

### `Object.assign()`方法

混合（Mixin）是JavaScript中实现对象组合最流行的一种模式。在一个`mixin`方法中，一个对象接收来自另一个对象的属性和方法，许多JavaScript库中都有类似的`mixin`方法：

```javascript
function mixin(receiver, supplier) {
    Object.keys(supplier).forEach(function(key) {
        receiver[key] = supplier[key];
    });
    return receiver;
}
```

`mixin()`函数遍历`supplier`的自有属性并复制到`receiver`中(此处的复制行为是浅复制，当属性值为对象时只复制对象的引用)。这样一来，`receiver`不通过继承就可以获得新属性，请参考这段代码：

```javascript
function mixin(receiver, supplier) {
    Object.keys(supplier).forEach(function(key) {
        receiver[key] = supplier[key];
    });
    return receiver;
}

function EventTarget() {}

EventTarget.prototype = {
    constructor: EventTarget,
    emit: function() {},
    on: function() {}
};

var myObject = {};
mixin(myObject, EventTarget.prototype);

console.log(myObject); //{constructor: ƒ, emit: ƒ, on: ƒ}
```

这种混合模式非常流行，因而`ECMAScript 6`添加了`Object.assign()`方法来实现相同的功能，这种方法接受一个接收对象和任意数量的源对象，最终返回接收对象。`mixin()`方式使用赋值操作符（assignment operator）= 来复制相关属性，却不能复制访问器属性到接收对象中，因此最终添加的方法弃用`mixin`而改用`assign`作为方法名。

`Object.assign()`方法可以接受任意数量的源对象，并按指定的顺序将属性复制到接收对象中。所以如果多个源对象具有同名属性，则排位靠后的源对象会覆盖排位靠前的，就像这段代码这样：

```javascript
var receiver = {};

Object.assign(receiver,
    {
        type: "js",
        name: "file.js"
    },
    {
        type: "css"
    }
);

console.log(receiver.type); //css
console.log(receiver.name); //file.js
```

请记住，`Object.assign()`方法不能将提供者的访问器属性复制到接收对象中。由于`Object.assign()`方法执行了赋值操作，因此提供者的访问器属性最终会转变为接收对象中的一个数据属性。举个例子：

```javascript
var receiver = {},
    supplier = {
        get name() {
            return "file.js"
        }
    };

Object.assign(receiver, supplier);

var descriptor = Object.getOwnPropertyDescriptor(receiver, "name");

console.log(descriptor.value); //file.js
console.log(descriptor.get); //undefined
```

## 重复的对象字面量属性

ECMAScript 5严格模式中加入了对象字面量重复属性的校验，当同时存在多个同名属性时会抛出错误。

```javascript
"use strict";

var person = {
    name: "Nicholas",
    name: "Greg", //ES5严格模式下会有语法错误
};
```

当运行在`ECMAScript 5`严格模式下，第二个`name`属性会触发一个语法错误；但是在`ECMAScript 6`中重复属性检查被移除了，无论是在严格模式还是非严格模式下，代码不再检查重复属性；对于每一组重复属性，都会选取最后一个取值，就像这样：

```javascript
"use strict";

var person = {
    name: "Nicholas",
    name: "Greg", //ES6严格模式下会有语法错误
};

console.log(person.name); //"Greg"
```

## 自有属性枚举顺序

`ECMAScript 5`中未定义对象属性的枚举顺序，由JavaScript引擎厂商自行决定。然而，`ECMAScript 6`严格规定了对象的自有属性被枚举时的返回顺序，这会影响到`Object.getOwnPropertyNames()`方法及`Reflect.ownKeys`返回属性的方式，`Object.assign()`方法处理属性的顺序也将随之改变。

自由属性枚举顺序的基本规则是：

1. 所有数字键按升序排序。
2. 所有字符串按照它们被加入对象的顺序排序。
3. 所有`Symbol`键按照它们被加入对象的顺序排序。

请看以下示例：

```javascript
var obj = {
    a: 1,
    0: 1,
    c: 1,
    2: 1,
    b: 1,
    1: 1
};

obj.d = 1;
console.log(Object.getOwnPropertyNames(obj).join("")); //012acbd
```

## 增强对象原型

### 改变对象的原型

正常情况下，无论是通过构造函数还是`Object.create()`方法构建对象，其原型是在对象被创建时指定的。对象原型是实例化之后保持不变，直到`ECMAScript5`都是通过`JavaScript`编程最重要的设定之一，虽然在`ECMAScript5`中添加了`Object.getPrototypeOf()`方法来返回任意指定对象的原型，但仍缺少对象在实例化后改变原型的标准方法。

所以，在`ECMAScript6`中添加了`Object.setPrototypeOf()`方法来改变这一现状，通过这个方法可以改变任意指定对象的原型，它接受两个参数：被改变原型的对象及替代第一个参数原型的对象。举个例子：

```javascript
let person = {
    getGreeting() {
        return "Hello";
    }
};

let dog = {
    getGreeting() {
        return "Woof";
    }
};

//以person对象为原型
let friend = Object.create(person);
console.log(friend.getGreeting()); //Hello
console.log(Object.getPrototypeOf(friend) === person); //true

//将原型设置为dog
Object.setPrototypeOf(friend, dog);
console.log(friend.getGreeting()); //Woof
console.log(Object.getPrototypeOf(friend) === dog); //true
```

### 简化原型访问的Super引用

正如之前提及的，原型对于`JavaScript`而言非常重要，`ECMAScript6`中许多改进的最终目标就是为了使其更易用。以此为目标，`ECMAScript6`引入了`Super`引用的特性，使用它可以便捷地访问对象原型。举个例子，如果你想重写对象实例的方法，又需要调用与它同名的原型方法，则在`ECMAScript5`中可以这样实现：

```javascript
let person = {
    getGreeting() {
        return "Hello";
    }
};

let dog = {
    getGreeting() {
        return "Woof";
    }
};

let friend = {
    getGreeting() {
        return Object.getPrototypeOf(this).getGreeting.call(this) + ", hi!";
    }
};

//将原型设置为person
Object.setPrototypeOf(friend, person);
console.log(friend.getGreeting()); //Hello, hi!
console.log(Object.getPrototypeOf(friend) === person); //true

//将原型设置为dog
Object.setPrototypeOf(friend, dog);
console.log(friend.getGreeting()); //Woof, hi!
console.log(Object.getPrototypeOf(friend) === dog); //true
```

在这个示例中，friend对象的getGreeting()方法调用了同名的原型方法。
`Object.getPrototypeOf()`方法可以确保调用正确的原型，并向输出字符串叠加另一个字符串；后面的`.call(this)`可以确保正确设置原型方法中的`this`值。

要准确记得如何使用`Object.getPrototypeOf()`方法和`.call(this)`方法来调用原型上的方法实在有些复杂，所以`ECMAScript6`引入了`super`关键字。简单来说，`Super`引用相当于指向对象原型的指针，实际上也就是`Object.getPrototypeOf(this)`的值。于是，可以这样简化上面的`getGreeting()`方法：

```javascript
let person = {
    getGreeting() {
        return "Hello";
    }
};

let dog = {
    getGreeting() {
        return "Woof";
    }
};

let friend = {
    getGreeting() {
        return super.getGreeting() + ", hi!";
    }
};

//将原型设置为person
Object.setPrototypeOf(friend, person);
console.log(friend.getGreeting()); //Hello, hi!
console.log(Object.getPrototypeOf(friend) === person); //true

//将原型设置为dog
Object.setPrototypeOf(friend, dog);
console.log(friend.getGreeting()); //Woof, hi!
console.log(Object.getPrototypeOf(friend) === dog); //true
```

调用`super.getGreeting()`方法相当于在当前上下文中调用`Object.getPrototypeOf(this).getGreeting.call(this)`。同样，可以通过`Super`引用调用对象原型上所有其他的方法。当然，必须要在使用简写方法的对象中使用`Super`引用，但如果在其他方法声明中使用会导致语法错误，就像这样：

```javascript
let friend = {
    //语法报错
    getGreeting: function() {
        return super.getGreeting() + ", hi!";
    }
};
```

在这个示例中使用匿名`function`定义一个属性，由于在当前上下文中`Super`引用是非法的，因此当调用`super.getGreeting()`方法时会抛出语法错误。
`Super`引用在多重继承的情况下非常有用，因为在这种情况下，使用`Object.getPrototypeOf()`方法将会出现问题，举个例子：

```javascript
let person = {
    getGreeting() {
        return "Hello";
    }
};

//以person对象为原型
let friend = {
    getGreeting() {
        return Object.getPrototypeOf(this).getGreeting.call(this) + ", hi!";
    }
};
Object.setPrototypeOf(friend, person);

//原型是friend

let relative = Object.create(friend);

console.log(person.getGreeting()); //Hello
console.log(friend.getGreeting()); //Hello,hi!
console.log(relative.getGreeting()); //报错
```

在`ECMAScript5`中很难解决这个问题，但在`ECMAScript6`中，使用`Super`引用便可以迎刃而解：

```javascript
let person = {
    getGreeting() {
        return "Hello";
    }
};

//以person对象为原型
let friend = {
    getGreeting() {
        return super.getGreeting.call(this) + ", hi!";
    }
};
Object.setPrototypeOf(friend, person);

//原型是friend

let relative = Object.create(friend);

console.log(person.getGreeting()); //Hello
console.log(friend.getGreeting()); //Hello,hi!
console.log(relative.getGreeting()); //Hello,hi!
```

Super引用不是动态变化的，它总是指向正确的对象，在这个示例中，无论有多少其他方法继承了`getGreeting`方法，`super.getGreeting()`始终指向`person.getGreeting()`方法。

## 正式的方法定义



