# 代理(Proxy)和(Reflection)API

`ECMAScript 6`添加了一些内建对象，赋予开发者更多访问`JavaScript`引擎的能力。代理(`Proxy`)是一种可以拦截并改变底层`JavaScript`引擎操作的包装器，在新语言中通过它暴露内部运作的对象。本章首先详细描述代理解决的问题，然后讨论如何有效地创建并使用代理。

## 数组问题

在`ECMAScript 6`出现以前，开发者不能通过自己定义的对象模仿`JavaScript`数组对象的行为方式。当给数组的特定元素赋值时，影响到该数组的`length`属性，也可以通过`length`属性修改数组元素。例如：

```javascript
let colors = ['red', 'green', 'blue'];

console.log(colors.length); //3

colors[3] = 'black';

console.log(colors.length); //4
console.log(colors[3]); //black

colors.length = 2;

console.log(colors.length); //2
console.log(colors[3]); //undefined
console.log(colors[2]); //undefined
console.log(colors[1]); //green
```

`colors`数组一开始有 3 个元素，将`colors[3]`赋值为`"black"`时`length`属性会自动增加到`4`，将`length`属性设置为`2`时会移除数组的后两个元素而只保留前两个。在`ECMAScript 5`之前开发者无法自己实现这些行为，但现在通过代理就可以了。

**数值属性和`length`属性具有这种非标准行为，因而在`ECMAScript 6`中数组被认为是奇异对象。**

## 代理与反射

调用`new Proxy()`可创建代替其他目标（target）对象的代理，它虚拟化了目标，所以二者看起来功能一致。

代理可以拦截`JavaScript`引擎内部目标的底层对象操作，这些底层操作被拦截后会触发响应特定操作的陷阱函数。

反射 API 以`Reflect`对象的形式出现，对象中方法的默认特性与相同的底层操作一致，而代理可以覆写这些操作，每个代理陷阱对应一个命名和参数都相同的`Reflect`方法。表`12-1`总结了代理陷阱的特性。

表`12-1` JavaScript 中的代理陷阱

| 代理陷阱 | 覆写的特性 | 默认特性 |
| :-- | :-- | :-- |
| get | 读取一个属性值 | `Reflect.get()` |
| set | 写入一个属性 | `Reflect.set()` |
| has | `in`操作符 | `Reflect.has()` |
| deleteProperty | `delete`操作符 | `Reflect.deleteProperty()` |
| getPrototypeOf | `Object.getPrototypeOf()` | `Reflect.getPrototypeOf()` |
| setPrototypeOf | `Object.setPrototypeOf()` | `Reflect.setPrototypeOf()` |
| isExtensible | `Object.isExtensible()` | `Reflect.isExtensible()` |
| preventExtensions | `Object.preventExtensions()` | `Reflect.preventExtensions()` |
| getOwnPropertyDescriptor | `Object.getOwnPropertyDescriptor()` | `Reflect.getOwnPropertyDescriptor()` |
| defineProperty | `Object.defineProperty()` | `Reflect.defineProperty()` |
| ownKeys | `Object.keys()`、`Object.getOwnPropertyNames()`和`Object.getOwnPropertySymbols()` | `Reflect.ownKeys()` |
| apply | 调用一个函数 | `Reflect.apply()` |
| construct | 用`new`调用一个函数 | `Reflect.construct()` |

每个陷阱覆写`JavaScript`对象的一些内建特性，可以用它们拦截并修改这些特性。如果仍需使用内建特性，则可以使用相应的反射`API`方法。创建代理会让代理和反射`API`的关系变得清楚，所以我们最好深入进去看一些示例。

## 创建一个简单的代理

用`Proxy`构造函数创建代理须要传入两个参数：目标（target）和处理程序（handler）。处理程序是定义一个或多个陷阱的对象，在代理中，除了专门为操作定义的陷阱外，其余操作均使用默认特性。不使用任何陷阱的处理程序等价于简单的转发代理，就像这样：

```javascript
let target = {};
let proxy = new Proxy(target, {});

proxy.name = 'proxy';
console.log(proxy.name); //"proxy"
console.log(target.name); //"prpxy"

target.name = 'target';
console.log(proxy.name); //target
console.log(target.name); //target
```

这个示例中的代理将所有操作直接转发给目标，将`"proxy"`赋值给`proxy.name`属性时会在目标上创建`name`，代理只是简单地将操作转发给目标，他不会储存这个属性。由于`proxy.name`和`target.name`引用的都是`target.name`，因此二者的值相同，从而为`target.name`设置新值后，`proxy.name`也一同变化。当然，没有陷阱的代理不是很有趣，如果定义一个陷阱会发生什么呢？

## 使用 set 陷阱验证属性

假设你想创建一个属性值是数字的对象，对象中每新增一个属性都要加倍加以验证，如果不是数字必须抛出错误。为了实现这个任务，可以定义一个`set`陷阱来覆写设置值的默认特性。`set`陷阱接受 4 个参数：

-   `target`用于接收属性（代理的目标）的对象。
-   `key`要写入的属性键（字符串或`Symbol`类型）
-   `value`被写入属性的值。
-   `receiver` 操作发生的对象（通常是代理）

`Reflect.set()`是`set`陷阱对应的反射方法和默认特性，它和`set`代理陷阱一样也接受相同的 4 个参数，以方便在陷阱中使用。如果属性已设置陷阱应该返回`true`，如果未设置则返回`false`。（`Reflect.set()`方法基于操作是否成功来返回恰当的值。）

可以使用`set`陷阱并检查传入的值来验证属性值，例如：

```javascript
let target = {
    name: 'target',
};

let proxy = new Proxy(target, {
    set(trapTarget, key, value, receiver) {
        //忽略不希望受到影响的已有属性
        if (!trapTarget.hasOwnProperty(key)) {
            if (isNaN(value)) {
                throw new TypeError('属性值必须是数字');
            }
        }
        //添加属性
        return Reflect.set(trapTarget, key, value, receiver);
    },
});

//添加一个属性
proxy.count = 1;
console.log(proxy.count); //1
console.log(target.count); //1

//由于目标已有name属性
proxy.name = 'proxy';
console.log(proxy.name); //proxy
console.log(target.name); //proxy

//给不存在的属性赋值会抛出错误
proxy.anotherName = 'proxy';
```

这段代码定义了一个代理来验证添加到`target`的新属性，当执行`proxy.count = 1`时，`set`陷阱被调用，此时`trapTarget`的值等于`target`，`key`等于`"count"`，`value`等于`1`，`receiver`等于`proxy`。由于`target`上没有`count`属性，因此代理将继续将`value`值传入`isNaN()`,如果结果是`NaN`,则证明传入的属性值不是数字，同时也抛出一个错误。在这段代码中，`count`被设置为`1`，所以代理调用`Reflect.set()`方法并传入陷阱接受的 4 个参数来添加属性。

`proxy.name`可以成功被赋值为一个字符串，这是因为`target`已经拥有一个`name`属性，但通过调用`trapTarget.hasOwnProperty()`方法验证检查后被排除了，所以目标已有的非数字属性值仍然可以被操作。

然而，将`proxy.anotherName`赋值为一个字符串时会抛出错误。目标上没有`anotherName`属性，所以它的值需要被验证，而由于`"proxy"`不是一个数字值，因此抛出错误。

`set`代理陷阱可以拦截写入属性的操作，`get`代理陷阱可以拦截读取属性的操作。

## 用 get 陷阱验证对象结构（Object Shape）

`JavaScript`有一个时常令人感到困惑的特殊行为，即读取不存在的属性时不会抛出错误，而是用`undefined`代替被读取属性的值，就像在这个示例中：

```javascript
let target = {};

console.log(target.name); //undefined
```

在大多数其他语言中，如果`target`没有`name`属性，尝试读取`target.name`会抛出一个错误。但`JavaScript`却用`undefined`来代替`target.name`的值。如果你曾接触过大型代码库，应该直到这个特性会导致重大问题，特别是当错误输入属性名称的时候，而代理可以通过检查对象结构来帮助你回避这个问题。

对象结构是指对象中所有可用属性和方法的集合，`JavaScript`引擎通过对象结构来优化代码，通常会创建类来表示对象，如果你可以安全地假定一个对象将始终具有相同的属性和方法，那么当程序试图访问不存在的属性时会抛出错误，这对我们很有帮助。代理将对象结构检验变得简单。

因为只有当读取属性时才会检验属性，所以无论对象中是否存在某个属性，都可以通过`get`陷阱来检测，它接受 3 个参数：

-   `trapTarget` 被读取属性的源对象（代理的目标）
-   `key` 要读取的属性键（字符串或`Symbol`）
-   `receiver` 操作发生的对象（通常是代理）

由于`get`陷阱不写入值，所以它复刻了`set`陷阱中除`value`外的其他 3 个参数，`Reflect.get()`也接受同样 3 个参数并返回属性的默认值。

如果属性在目标上不存在，则使用`get`陷阱和`Reflect.get()`时会抛出错误，就像这样：

```javascript
let proxy = new Proxy(
    {},
    {
        get(trapTarget, key, receiver) {
            if (!(key in receiver)) {
                throw new TypeError('属性 ' + key + ' 不存在');
            }
            return Reflect.get(trapTarget, key, receiver);
        },
    },
);

//添加一个属性，程序仍正常运行
proxy.name = 'proxy';
console.log(proxy.name); //proxy

//如果属性不存在，则抛出错误
console.log(proxy.nme); //错误：属性 nme 不存在
```

此示例中的`get`陷阱可以拦截属性读取操作，并通过`in`操作符来判断`receiver`上是否具有被读取的属性，这里之所以用`in`操作符来检查`receiver`而不检查`trapTarget`，是为了防止`receiver`代理含有`has`陷阱。在这种情况下检查`trapTarget`可能或忽略掉`has`陷阱，从而得到错误结果。属性如果不存在会抛出一个错误，否则就使用默认行为。

这段代码展示了如何在没有错误的情况下给`proxy`添加新属性`name`，并写入值和读取值。最后一行包含一个输入错误：`proxy.nme`有可能是`proxy.name`，由于`nme`是一个不存在的属性，因而抛出错误。

## 使用 has 陷阱隐藏已有属性

可以用`in`操作符来检测给定对象中是否含有某个属性，如果自有属性或原型属性匹配这个或`Symbol`就返回`true`。例如：

```javascript
let target = {
    value: 42,
};

console.log('value' in target); //true
console.log('toString' in target); //true
```

`value`是一个自有属性，`toString`是一个继承自`Object`的原型属性，二者在对象上都存在，所以用`in`操作赋检测二者都返回`true`。在代理中使用`has`陷阱可以拦截这些`in`操作并返回一个不同的值。

每当使用`in`操作符时都会调用`has` 陷阱，并传入两个参数：

-   trapTarget 读取属性的对象（代理的目标）
-   key 要检查的属性键（字符串或 Symbol）

`Reflect.has()`方法也接受这些参数并返回`in`操作符的默认响应，同时使用`has`陷阱和`Reflect.has()`可以改变一部分属性被`in`检测时的行为，并恢复另外一些属性的默认行为。例如，可以像这样隐藏之前示例中的`value`属性：

```javascript
'let target = {
    name: "target",
    value: 42
};

let proxy = new Proxy(target, {
    has(trapTarget, key) {
        if (key === "value") {
            return false;
        } else {
            return Reflect.has(trapTarget, key);
        }
    }
});

console.log("value" in proxy); //false
console.log("name" in proxy); //true
console.log("toString" in proxy); //true
```

代理中的`has`陷阱会检查`key`是否为`"value"`，如果是的话返回`false`,若不是则调用`Reflect.has()`方法返回默认行为。结果是，即使`target`上实际存在`value`属性，但用`in`操作符检查还是会返回`false`，而对于`name`和`toString`则正确返回`true`。

## 用 deleteProperty 陷阱防止删除属性

`delete`操作符可以从对象中移除属性，如果成功则返回`true`,不成功则返回`false`。在严格模式下，如果你尝试删除一个不可配置(noconfigurable)属性则会导致程序抛出错误，而在非严格模式下只是返回`false`。这里有一个例子：

```javascript
let target = {
    name: 'target',
    value: 42,
};

Object.defineProperty(target, 'name', {
    configurable: false,
});

console.log('value' in target); //true

let result1 = delete target.value;
console.log(result1); //false

console.log('value' in target); //true

//注意， 在严格模式下，下面这行代码会抛出错误
('use strict');
let result2 = delete target.value;
console.log(result2); //false

console.log('value' in target); //true
```

用`delete`操作符来删除`value`属性后，第三个`console.log()`调用中的`in`操作最终返回`false`。不可配置属性`name`无法被删除，所以`delete`操作返回`false`(如果这段代码运行在严格模式下会抛出错误)。在代理中，可以通过`deleteProperty`陷阱来改变这个行为。

每当通过`delete`操作符删除对象属性时，`deletePropery`陷阱都会被调用，他接受两个参数：

-   trapTarget 要删除属性的对象（代理的目标）
-   key 要删除的属性键（字符串或`Symbol`）

`Reflect.deleteProperty()`方法为`deleteProperty`陷阱提供默认实现，并且接受同样的两个参数。结合二者可以改变`delete`的具体表现行为，例如，可以像这样来确保`value`属性不会被删除：

```javascript
let target = {
    name: 'target',
    value: 42,
};

let proxy = new Proxy(target, {
    deleteProperty(trapTarget, key) {
        if (key === 'value') {
            return false;
        } else {
            return Reflect.deleteProperty(trapTarget, key);
        }
    },
});

//尝试删除proxy.value

console.log('value' in proxy); //true

let result1 = delete proxy.value;
console.log(result1); //false

console.log('value' in proxy); //true

//尝试删除proxy.name

console.log('name' in proxy); //true

let result2 = delete proxy.name;
console.log(result2); //true

console.log('name' in proxy); //false
```

这段代码与`has`陷阱的示例非常相似，`deleteProperty`陷阱检查`key`是否为`"value"`，如果是的话返回`false`，否则调用`Reflect.deleteProperty()`方法来使用默认行为。由于通过代理的操作被捕获，因此`value`属性无法被删除，但`name`属性就如期被删除了。如果你希望保护属性不被删除，而且在严格模式下不抛出错误，那么这个方法非常实用。

## 原型代理陷阱

第 4 章介绍了`ECMAScript 6`新增的`Object.setPrototypeOf()`方法，它被用于作为`ECMAScript 5`中的`Object.getPropertyOf()`方法的补充。通过代理中的`setPrototypeOf`陷阱和`getPrototypeOf`陷阱可以拦截这两个方法的执行过程，在这两种情况下，`Object`上的方法会调用代理中的同名陷阱来改变方法的行为。

两个陷阱均与代理有关，但具体到方法只与每个陷阱的类型有关，`setPrototypeOf`陷阱接受以下这些参数：

-   trapTarget 接受原型设置的对象（代理的目标）
-   proto 作为原型使用的对象

传入`Object.setPrototypeOf()`方法和`Reflect.setPrototypeOf()`方法的均是以上两个参数，另以一方面，`getPrototypeOf`陷阱中的`Object.getPrototypeOf()`方法和`Reflect.getPrototypeOf()`方法只接受参数`trapTarget`。

### 原型代理陷阱的运行机制

原型代理陷阱有一些限制。首先，`getPrototypeOf`陷阱必须返回对象或`null`，只要返回值必将导致运行时错误，返回值检查可以确保`Object.getPrototypeOf()`返回的总是预期的值；其次，在`setPrototypeOf`陷阱中，如果操作失败则返回的一定是`false`,此时`Object.setPrototypeOf()`会抛出错误，如果`setPrototypeOf`返回了任何不是`false`的值，那么`Object.setPrototypeOf()`便假设操作成功。

以下示例通过总是返回`null`，且不允许改变原型的方法隐藏了代理的原型：

```javascript
let target = {};
let proxy = new Proxy(target, {
    getPrototypeOf(trapTarget) {
        return null;
    },
    setPrototypeOf(trapTarget, proto) {
        return false;
    },
});

let targetProto = Object.getPrototypeOf(target);
let proxyProto = Object.getPrototypeOf(proxy);

console.log(targetProto === Object.prototype); //true
console.log(proxyProto === Object.prototype); //false
console.log(proxyProto); //null

//成功
Object.setPrototypeOf(target, {});

//抛出错误
Object.setPrototypeOf(proxy, {});
```

这段代码强调了`target`和`proxy`的行为差异。`Object.getPrototypeOf()`给`target`返回的是值，而给`proxy`返回值时，由于`getPrototypeOf`陷阱被调用，返回的是`null`；同样，`Object.setPrototypeOf()`成功为`target`设置原型，而给`prxoy`设置原型时，由于`setPrototypeOf`陷阱被调用，最终抛出一个错误。

如果你想使用这两个陷阱的默认行为，则可以使用`Reflect`上的相应方法。例如，下面的代码实现了`getPrototypeOf`和`setPrototypeOf`陷阱的默认行为：

```javascript
let target = {};
let proxy = new Proxy(target, {
    getPrototypeOf(trapTarget) {
        return Reflect.getPrototypeOf(trapTarget);
    },
    setPrototypeOf(trapTarget, proto) {
        return Reflect.setPrototypeOf(trapTarget, proto);
    },
});

let targetProto = Object.getPrototypeOf(target);
let proxyProto = Object.getPrototypeOf(proxy);

console.log(targetProto === Object.prototype); //true
console.log(proxyProto === Object.prototype); //true

//成功
Object.setPrototypeOf(target, {});

//同样也成功
Object.setPrototypeOf(proxy, {});
```

由于本示例中的`getPrototypeOf`陷阱和`setPrototypeOf`陷阱仅使用了默认行为，因此可以交换使用`target`和`paroxy`并得到相同结果。由于`Reflect.getPrototypeOf()`方法和`Reflect.setPrototypeOf()`方法与`Object`上的同名方法存在一些重要差异，因此区别使用它们是很重要的。

### 为什么有两组方法

令人困惑的是，`Reflect.getPrototypeOf()`方法和`Reflect.setPrototypeOf()`方法看起来疑似`Object.getPrototypeOf()`方法和`Object.setPrototypeOf()`方法，尽管两组方法执行相似的操作，但两者间仍有一些不同之处。

`Object.getPrototypeOf()`和`Object.setPrototypeOf()`是高级操作，创建伊始便是给开发者使用的；而`Reflect.getPrototypeOf()`方法和`Reflect.setPrototypeOf()`方法则是底层操作，其赋予开发者可以访问之前只在内部操作的`[[GetPrototypeOf]]`和`[[SetPrototypeOf]]`的权限。`Reflect.getPrototypeOf()`方法是内部`[[GetPrototypeOf]]`操作的包裹器（包含一些输入验证），`Reflect.setPrototypeOf()`方法与`[[SetPrototypeOf]]`的关系与之相同。`Objec`上相应的方法虽然也调用了`[[GetPrototypeOf]]`和`[[SetPrototypeOf]]`，但在此之前会执行一些额外步骤，并通过检查返回来决定下一步的操作。

如果传入的参数不是对象，则`Reflect.getPrototypeOf()`方法会抛出错误，而`Object.getPrototypeof()`方法贼会在操作执行前先将参数强制转换为一个对象。给这两个方法传入一个数字，会得到不同的结果：

```javascript
let result1 = Object.getPrototypeOf(1);
console.log(result1 === Number.prototype); //true

//抛出错误
Reflect.getPrototypeOf(1);
```

`Object.getPrototypeOf()`方法会强制让数字 1 变为`Number`对象，所以你可以检索它的原型并得到返回值`Number.prototype`；而由于`Reflect.getPrototypeOf()`方法不强制转化值的类型，而且 1 又不是一个对象，故会抛出一个错误。

`Reflect.setPrototypeOf()`方法与`Object.setPrototypeOf()`方法也不尽相同。具体而言，`Reflect.setPrototypeOf()`方法返回一个布尔值来表示操作是否成功，成功时返回`true`,失败则返回`false`；而`Object.setPrototypeOf()`方法一旦失败则会抛出一个错误。

正如之前“原型代理陷阱的运行机制”一节中的首个示例，当`setPrototypeOf`代理陷阱返回`false`时会导致`Object.setPrototypeOf()`抛出一个错误。`Object.setPrototypeOf()`方法返回第一个参数作为它的值，因此其不适合用于实现`setPrototypeOf`代理陷阱的默认行为。以下代码展示了这些差异：

```javascript
let target1 = {};
let result1 = Object.setPrototypeOf(target1, {});
console.log(result1 === target1); //true

let target2 = {};
let result2 = Reflect.setPrototypeOf(target2, {});
console.log(result2 === target2); //false
console.log(result2); //true
```

在这个示例中，`Object.setPrototypeOf()`返回`target1`,但`Reflect.setPrototypeOf()`返回的是`true`。这种微妙的差异非常重要，在`Object`和`Reflect`上还有更多看似重复的方法，但是在所有代理陷阱中一定要使用`Reflect`上的方法。

**当`Reflect.getPrototypeOf()/Object.getPrototypeOf()`和`Reflect.setPrototypeOf()/Object.setPrototypeOf()`被用于一个代理时将调用代理陷阱`getPrototypeOf`和`setPrototypeOf`。**

## 对象可扩展性陷阱

`ECMAScript 5`已经通过`Object.preventExtensions()`方法和`Object.isExtensible`方法修正了对象的可扩展性，`ECMAScript 6`可以通过代理中的`preventExtensions`和`isExtensible`陷阱拦截这两个方法并调用底层对象。两个陷阱都接受唯一参数`trapTarget`对象，并调用它上面的方法。`isExtensible`陷阱返回的一定是一个布尔值，表示对象是否可扩展；而`preventExtensions`陷阱返回的也一定是布尔值，表示操作是否成功。

`Reflect.preventExtensions()`方法和`Reflect.isExtensible()`方法实现了相应陷阱中的默认行为，二者都返回布尔值。

### 两个基础示例

以下这段代码是对象可扩展性陷阱的实际应用，实现了`isExtensible`和`preventExtensions`陷阱的默认行为：

```javascript
let target = {};
let proxy = new Proxy(target, {
    isExtensible(trapTarget) {
        return Reflect.isExtensible(trapTarget);
    },
    preventExtensions(trapTarget) {
        return Reflect.preventExtensions(trapTarget);
    },
});

console.log(Object.isExtensible(target)); //true
console.log(Object.isExtensible(proxy)); //true

Object.preventExtensions(proxy);

console.log(Object.isExtensible(target)); //false
console.log(Object.isExtensible(proxy)); //false
```

此示例展示了`Object.preventExtensions()`方法和`Object.isExtensible()`方法直接从`proxy`传递到`target`的过程，当然，可以改变这种默认行为，例如，如果你想让`Object.preventExtensions()`对于`proxy`失效，那么可以在`preventExtensions`陷阱中返回`false`:

```javascript
let target = {};
let proxy = new Proxy(target, {
    isExtensible(trapTarget) {
        return Reflect.isExtensible(trapTarget);
    },
    preventExtensions(trapTarget) {
        return false;
    },
});

console.log(Object.isExtensible(target)); //true
console.log(Object.isExtensible(proxy)); //true

Object.preventExtensions(proxy);

console.log(Object.isExtensible(target)); //true
console.log(Object.isExtensible(proxy)); //true
```

这里的`Object.preventExtensions(proxy)`调用实际上被忽略了，这是因为`preventExtensions`陷阱返回了`false`,所以操作不会转发到底层目标，`Object.isExtensible()`最终返回`true`。

### 重复的可扩展方法

你可能已经再一次注意到，看似更加相似的重复方法出现在`Object`和`Reflect`上。`Object.isExtensible()`方法和`Reflect.isExtensible()`方法非常相似，只有当传入非对象时，`Object.isExtensible()`返回`false`,而`Object.isExtensible()`则抛出一个错误，请看这个示例：

```javascript
let result1 = Object.isExtensible(2);
console.log(result1); //false

//抛出错误
let result2 = Reflect.isExtensible(2); //报错
```

这条限制类似于`Object.getPrototypeOf()`方法与`Reflect.getPrototypeOf()`方法之间的差异，因为相比高级功能方法而言，底层的具有更严格的错误检查。

`Object.preventExtensions()`方法和`Reflect.preventExtensions()`方法同样相似。无论传入`Object.preventExtensions()`方法的参数是否为一个对象，它总是返回该参数；而如果`Reflect.preventExtensions()`方法的参数不是对象就会抛出错误；如果参数是一个对象，操作成功时`Reflect.preventExtensions()`会返回`true`,否则返回`false`。例如：

```javascript
let result1 = Object.preventExtensions(2);
console.log(result1); //2

let target = {};
let result2 = Reflect.preventExtensions(target);
console.log(result2); //true

//抛出错误
let result3 = Reflect.preventExtensions(2);
```

在这里，即使值`2`不是一个对象，`Object.preventExtensions()`方法也将其透传作为返回值，而`Reflect.preventExtensions()`方法则会抛出错误，只有当传入对象时它才返回`true`。

## 属性描述符陷阱

`ECMAScript 5`最重要的特性之一是可以使用`Object.defineProperty()`方法定义属性特性（property attribute）。在早期版本的`JavaScript`中无法定义访问器属性，无法将属性设置为只读或不可配置。直到`Object.defineProperty()`方法出现之后才支持这些功能，并且可以通过`Object.getOwnPropertyDescriptor()`方法来获取这些属性。

在代理中可以分别用`defineProperty`陷阱和`getOwnPropertyDescriptor`陷阱拦截`Object.defineProperty()`方法和`Object.getOwnPropertyDescriptor()`方法的调用。`defineProperty()`陷阱接受以下参数：

-   trapTarget 要定义属性的对象
-   key 属性的键
-   descriptor 属性的描述符对象

`defineProperty`陷阱需要在操作成功后返回`true`,否则返回`false`。`getOwnPropertyDescriptor`陷阱只接受`trapTarget`和`key`两个参数，最终返回描述符。`Reflect.defineProperty()`方法和`Reflect.getOwnPropertyDescriptor()`方法与对应的陷阱接受相同参数。这个示例实现的是每个陷阱的默认行为：

```javascript
let proxy = new Proxy(
    {},
    {
        deleteProperty(trapTarget, key, descriptor) {
            return Reflect.defineProperty(trapTarget, key, descriptor);
        },
        getOwnPropertyDescriptor(trapTarget, key) {
            return Reflect.getOwnPropertyDescriptor(trapTarget, key);
        },
    },
);

Object.defineProperty(proxy, 'name', {
    value: 'proxy',
});

console.log(proxy.name); //proxy

let descriptor = Object.getOwnPropertyDescriptor(proxy, 'name');

console.log(descriptor.value); //proxy
```

这段代码通过`Object.defineProperty()`方法在代理上定义了属性`"name"`,该属性的描述符可通过`Object.getOwnPropertyDescriptor()`方法来获取。

## 给 Object.defineProperty()添加限制

`defineProperty`陷阱返回布尔值来表示操作是否成功。返回`true`时，`Object.defineProperty()`方法成功执行；返回`false`时，`Object.defineProperty()`方法抛出错误。这个功能可以用来限制`Object.defineProperty()`方法可定义的属性类型，例如，如果你希望组阻止`Symbol`类型的属性，则可以当属性键为`symbol`时返回`false`,就像这样：

```javascript
let proxy = new Proxy(
    {},
    {
        defineProperty(trapTarget, key, descriptor) {
            if (typeof key === 'symbol') {
                return false;
            }

            return Reflect.defineProperty(trapTarget, key, descriptor);
        },
    },
);

Object.defineProperty(proxy, 'name', {
    value: 'proxy',
});
console.log(proxy.name); //proxy

let nameSymbol = Symbol('name');

//抛出错误
Object.defineProperty(proxy, nameSymbol, {
    value: 'proxy',
});
```

当`key`是`Symbol`类型时`defineProperty`代理陷阱返回`false`,否则执行默认行为。调用`Object.defineProperty()`并传入`"name"`，因此键的类型是字符串所以方法成功执行；调用`Object.defineProperty()`方法并传入`nameSymbol`,`defineProperty`陷阱返回`false`所以抛出错误。

**如果让陷阱返回`true`并且不调用`Reflect.defineProperty()`方法，则可以让`Object.defineProperty()`方法静默失效，这既消除了错误又不会真正定义属性。**

### 描述符对象限制

为确保`Object.defineProperty()`方法和`Object.getOwnPropertyDescriptor()`方法的行为一致，传入`defineProperty`陷阱的描述对象已规范化。从`getOwnPropertyDescriptor`陷阱返回的对象总是由于相同原因被验证。

无论将什么对象作为第三个参数传递给`Object.defineProperty()`方法，都只有属性`enumerable`、`configurable`、`value`、`writable`、`get`和`set`将出现在传递给`defineProperty`陷阱的描述符对象中。例如：

```javascript
let proxy = new Proxy(
    {},
    {
        defineProperty(trapTarget, key, descriptor) {
            console.log(descriptor.value);
            console.log(descriptor.name);

            return Reflect.defineProperty(trapTarget, key, descriptor);
        },
    },
);

Object.defineProperty(proxy, 'name', {
    value: 'proxy',
    name: 'custom',
});

//proxy
//undefined
```

在这段代码中，调用`Object.defineProperty()`时传入包含非标准`name`属性的对象作为第三个参数。当`defineProperty`陷阱被调用时，`descriptor`对象有`value`属性却没有`name`属性，这是因为`descriptor`不是实际传入`Object.defineProperty()`方法的第三个参数的引用，而是一个只包含那些被允许使用的属性的新对象。`Reflect.defineProperty()`方法同样也忽略了描述符上的所有非标准属性。

`getOwnPropertyDescriptor`陷阱的的限制条件稍有不同，它的返回值必须是`null`、`undefined`或一个对象。如果返回对象，则对象自己的属性只能是`enumerable`、`configurable`、`value`、`writable`、`get`和`set`,在返回的对象中使用不被允许的属性会抛出一个错误，就像这样：

```javascript
let proxy = new Proxy(
    {},
    {
        getOwnPropertyDescriptor(trapTarget, key) {
            return {
                name: 'proxy',
            };
        },
    },
);

//抛出错误
//Uncaught TypeError: 'getOwnPropertyDescriptor' on proxy: trap reported non-configurability for property 'name' which is either non-existent or configurable in the proxy targe
let descriptor = Object.getOwnPropertyDescriptor(proxy, 'name');
```

属性描述符不允许有`name`属性，当调用`Object.getOwnPropertyDescriptor()`时，`getOwnPropertyDescriptor`的返回值会触发一个错误。这条限制可以确保无论代理中使用了什么方法，`Object.getOwnPropertyDescriptor()`返回值的结构总是可靠的。

### 重复的描述符方法

我们再一次在`ECMAScript 6`中看到这些令人困惑的相似方法：看起来`Object.defineProperty()`方法和`Object.getOwnPropertyDescriptor()`方法分别与`Reflect.defineProperty()`方法和`Reflect.getOwnPropertyDescriptor()`方法做了同样的事情。正如本章之前讨论的其他方法对，这 4 个方法也有一些微妙但却很重要但差异。

**defineProperty()方法**

`Object.defineProperty()`方法和`Reflect.defineProperty()`方法只有返回值不同：`Object.defineProperty()`方法返回第一个参数，而`Reflect.defineProperty()`的返回值与操作有关，成功则返回`true`，失败则返回`false`。例如：

```javascript
let target = {};

let result1 = Object.defineProperty(target, 'name', {
    value: 'target',
});

console.log(result1 === target); //true

let result2 = Reflect.deleteProperty(target, 'name', {
    value: 'reflect',
});

console.log(result2); //false
```

调用`Object.defineProperty()`时传入`target`，返回值是`target`；调用`Reflect.defineProperty()`时传入`target`，返回值是`true`,表示操作成功。由于`defineProperty`代理陷阱需要返回一个布尔值，因此必要时最好用`Reflect.defineProperty()`来实现默认行为。

**getOwnPropertyDescriptor()方法**

调用`Object.getOwnPropertyDescriptor()`方法时传入原始值作为第一个参数，内部会将这个值强制转换为一个对象；另一方面，若调用`Reflect.getOwnPropertyDescriptor()`方法时传入原始值作为第一个参数，则会抛出一个错误。这个示例展示了两者的区别：

```javascript
let descriptor1 = Object.getOwnPropertyDescriptor(2, 'name');
console.log(descriptor1); //undefined

//抛出错误
let descriptor2 = Reflect.getOwnPropertyDescriptor(2, 'name');
```

由于`Object.getOwnPropertyDescriptor()`方法将数值`2`转换为一个不含`name`属性的对象，因此它返回`undefined`,这是当对象中没有指定的`name`属性时的标准行为。然而当调用`Reflect.Object.getOwnPropertyDescriptor()`立即抛出一个错误，因为该方法不接受原始值作为第一个参数。

## ownKeys 陷阱

`ownKeys`代理陷阱可以拦截内部方法`[[OwnPropertyKeys]]`,我们通过返回一个数组的值可以覆写其行为。这个数组被用于`Object.keys()`、`Object.getOwnPropertyNames()`、`Object.getOwnPropertySymbols()`和`Object.assign()`4 个方法，`Object.assign()`方法用数组来确定需要复制的属性。

`ownKeys`陷阱通过`Reflect.ownKeys()`方法实现默认的行为，返回的数组中包含所有自有属性的键名，字符串类型和`Symbol`类型的都包含在内。`Object.getOwnPropertyNames()`方法和`Object.keys()`方法返回的结果将`Symbol`类型的属性名排除在外，`Object.getOwnPropertySymbols()`方法返回的结果将字符串类型的属性名排除在外。`Object.assign()`方法支持字符串和`Symbol`两种类型。

`ownKeys`陷阱唯一接受的参数是操作的目标，返回值必须是一个数组或类数组对象，否则就抛出错误。当调用`Object.keys()`、`Object.getOwnPropertyNames()`、`Object.getOwnPropertySymbols()`或`Object.assign()`方法时，可以用`ownKeys`陷阱来过滤掉不想使用的属性键。假设你不想引入任何以下划线字符（在`JavaScript`中下划线符号表示字符是私有的）开头的属性名称，则可以用`ownKeys`陷阱来过滤掉那些键，就像这样：

```javascript
let proxy = new Proxy(
    {},
    {
        ownKeys(trapTarget) {
            return Reflect.ownKeys(trapTarget).filter((key) => {
                return typeof key !== 'string' || key[0] !== '_';
            });
        },
    },
);

let nameSymbol = Symbol('name');

proxy.name = 'proxy';
proxy._name = 'privare';
proxy[nameSymbol] = 'symbol';

let names = Object.getOwnPropertyNames(proxy),
    keys = Object.keys(proxy),
    symbols = Object.getOwnPropertySymbols(proxy);

console.log(names.length); //1
console.log(names[0]); //name

console.log(keys.length); //1
console.log(keys[0]); //name

console.log(symbols.length); //1
console.log(symbols[0]); //Symbol(name)
```

这个示例使用了一个`ownKeys`陷阱，它首先调用`Reflect.ownKeys()`获取目标的默认键列表；接下来，用`filter()`过滤掉以下划线字符开始的字符串；然后，将`3`个属性添加到`proxy`对象：`name`、`_name`和`nameSymbol`。调用`Object.getOwnPropertyNames()`和`Object.keys()`时传入`proxy`,只返回`nameSymbol`。由于`_name`属性被过滤掉了，因此它不出现在这两次结果中。

`ownKeys()`陷阱也会影响`for-in`循环，当确定循环内部使用的键时会调用陷阱。

## 函数代理中`apply`和`construct`陷阱

所有代理陷阱中，只有`apply`和`construct`的代理目标是一个函数。回忆第 3 章，函数有两个内部方法`[[Call]]`和`[[Construct]]`，`apply`陷阱和`construct`陷阱可以覆写这些内部方法。若使用`new`操作符调用函数，则执行`[[Construct]]`方法；若不用，则执行`[[Call]]]`方法，此时会执行`apply`陷阱，它和`Reflect.apply()`都接受以下参数：

-   trapTarget 被执行的函数（代理的目标）
-   thisArg 函数被调用时内部`this`的值
-   argumentsList 传递给函数的参数数组

当使用`new`调用函数时调用的`construct`陷阱接受以下参数：

-   trapTarget 被执行的函数（代理的目标）
-   argumentsList 传递给函数的参数数组

`Reflect.construct()`方法也接受这两个参数，其还有一个可选的第三个参数`newTarget`。若给定这个参数，则该参数用于指定函数内部`new.target`的值。

有了`apply`和`construct`陷阱，可以完全控制任何代理目标函数的行为。要模拟函数的默认行为，可以这样做：

```javascript
let target = function () {
        return 42;
    },
    proxy = new Proxy(target, {
        apply: function (trapTarget, thisArg, argumentList) {
            return Reflect.apply(trapTarget, thisArg, argumentList);
        },
        construct: function (trapTarget, argumentList) {
            return Reflect.construct(trapTarget, argumentList);
        },
    });

//一个目标是函数的代理看起来也像一个函数
console.log(typeof proxy); //function

console.log(proxy()); //42

var instance = new proxy();
console.log(instance instanceof proxy); //true
console.log(instance instanceof target); //true
```

在这里，有一个返回数字`42`的函数，该函数代理分别使用`apply`陷阱和`construct`陷阱来将那些行为委托给`Reflect.apply()`方法和`Reflect.construct()`方法。最终结果是代理函数与目标函数完全相同，包括在使用`typeof`时将自己标识为函数。不用`new`调用代理返回`42`，用`new`调用时创建一个`instance`对象，它同时是代理和目标的实例，因为`instanceof`通过原型链来确定此信息，而原型链查找不受代理影响，这也就是代理和目标好像有相同原型的原因。

### 验证函数参数

`apply`陷阱和`construct`陷阱增加了一些可能改变函数执行方式的可能性，例如，假设你想验证所有参数都属于特定类型，则可以在`apply`陷阱中检查参数：

```javascript
//将所有参数相加

function sum(...values) {
    return values.reduce((previous, current) => previous + current, 0);
}

let sumProxy = new Proxy(sum, {
    apply: function (trapTarget, thisArg, argumentList) {
        argumentList.forEach((arg) => {
            if (typeof arg !== 'number') {
                throw new Error('所有参数必须是数字。');
            }
        });

        return Reflect.apply(trapTarget, thisArg, argumentList);
    },
    construct: function (trapTarget, argumentList) {
        throw new Error('该函数不可通过new来调用');
    },
});

console.log(sumProxy(1, 2, 3, 4)); //10

//给不存在的属性赋值会抛出错误
console.log(sumProxy(1, '2', 3, 4));

//同样抛出错误
let result = new sumProxy();
```

此示例使用`apply`陷阱来确保所有参数都是数字，`sum()`函数将所有传入的参数相加。如果传入非数字值，函数仍将尝试操作，可能导致意外结果发生。通过在`sumProxy()`代理中封装`sum()`，这段代码拦截了函数调用，并确保了每个参数在被调用前一定是数字。为了安全起见，代码还使用`construct`陷阱来确保函数不会被`new`调用。

还可以执行相反的操作，确保必须用`new`来调用函数并验证其参数为数字：

```javascript
function Numbers(...values) {
    this.value = values;
}

let NumbersProxy = new Proxy(Numbers, {
    apply: function (trapTarget, thisArg, argumentList) {
        throw new TypeError('该函数必须通过new来调用');
    },

    construct: function (trapTarget, argumentList) {
        argumentList.forEach((arg) => {
            if (typeof arg !== 'number') {
                throw new Error('所有参数必须是数字');
            }
        });
        return Reflect.construct(trapTarget, argumentList);
    },
});

let instance = new Number(1, 2, 3, 4);
console.log(instance.values);

//抛出错误
NumbersProxy(1, 2, 3, 4);
```

在这个示例中，`apply`陷阱抛出一个错误，而`construct`陷阱使用`Reflect.construct()`方法来验证输入并返回一个新实例。当然，也可以不借助代理而用`new.target`来完成相同的事情。

### 不用 new 调用构造函数

第 3 章介绍了`new.target`元属性，它是用`new`调用函数时对该函数的引用，所以可以通过检查`new.target`的值来确定函数是否是通过`new`来调用的，例如：

```javascript
function Numbers(...values) {
    if (typeof new.target === 'undefined') {
        throw new Error('该函数必须通过new来调用。');
    }

    this.values = values;
}

let instance = new Number(1, 2, 3, 4);
console.log(instance.values);

//抛出错误
Numbers(1, 2, 3);
```

在这段代码中，不用`new`调用`Numbers()`会抛出一个错误，这类似于"验证函数参数"一节中的第二个示例，但是没有使用代理。如果你的唯一目标是防止用`new`调用函数，则这样编写代码比使用代理简答得多。但有时你不能控制你要修改行为的函数，在这种情况下，使用代理才有意义。

假设`Numbers()`函数定义在你无法修改的代码中，你知道代码依赖`new.target`，希望函数避免检查却仍想调用函数。在这种情况下，用`new`调用时的行为已被设定，所以你只能使用`apply`陷阱：

```javascript
function Numbers(...values) {
    if (typeof new.target === 'undefined') {
        throw new TypeError('该函数必须通过new来调用。');
    }

    this.values = values;
}

let NumbersProxy = new Proxy(Numbers, {
    apply: function (trapTarget, thisArg, argumentList) {
        return Reflect.construct(trapTarget, argumentList);
    },
});

let instance = NumbersProxy(1, 2, 3, 4);

console.log(instance.values); //[1, 2, 3, 4]
```

`apply`陷阱用传入的参数调用`Reflect.construct()`就可以让`NumbersProxy()`函数无须使用`new`就能实现用`new`调用`Numbers()`的行为。`Numbers()`内部的`new.target`等于`Numbers()`，所以不会有错误抛出。尽管这个修改`new.target`的示例非常简单，但这样做显得更加直接。

### 覆写抽象基类构造函数

进一步修改`new.target`，可以将第三个参数指定为`Reflect.construct()`作为赋值给`new.target`的特定值。这项技术在函数根据已经值检查`new.target`时很有用，例如创建抽象基类构造函数。在一个抽象基类构造函数中，`new.target`理应不同于类的构造函数，就像在这个示例中：

```javascript
class AbstractNumbers {
    constructor(...values) {
        if (new.target === AbstractNumbers) {
            throw new TypeError('此函数必须被继承');
        }
        this.values = values;
    }
}

class Numbers extends AbstractNumbers {}

let instance = new Numbers(1, 2, 3, 4);
console.log(instance.values); //[1, 2, 3, 4]

//抛出错误
new AbstractNumbers(1, 2, 3, 4);
```

当调用`new AbstractNumbers()`时，`new.target`等于`AbstractNumbers`并抛出一个错误。调用`new Numbers()`仍然有效，因为`new.target`等于`Numbers`。可以手动用代理给`new.target`赋值来绕过构造函数限制。

```javascript
class AbstractNumbers {
    constructor(...values) {
        if (new.target === AbstractNumbers) {
            throw new TypeError('此函数必须被继承');
        }
        this.values = values;
    }
}

let AbstractNumbersProxy = new Proxy(AbstractNumbers, {
    construct: function (trapTarget, argumentList) {
        return Reflect.construct(trapTarget, argumentList, function () {});
    },
});

let instance = new AbstractNumbersProxy(1, 2, 3, 4);
console.log(instance.values); //[1, 2, 3, 4]
```

`AbstractNumbersProxy`使用`construct`陷阱来拦截对`new AbstractNumbersProxy()`方法的调用。然后传入陷阱的参数来调用`Reflect.construct()`方法，并添加一个空函数作为第三个参数。这个空函数被用作构造函数内部`new.target`的值。由于`new.target`不等于`AbstractNumbers`,因此不会抛出错误，构造函数可以完全执行。

### 可调用的类构造函数

第 9 章解释说，必须用`new`来调用类构造函数，因为类构造函数的内部方法`[[Call]]`被指定来抛出一个错误。但是代理可以拦截对`[[Call]]`方法的调用，这意味着你可以通过使用代理来有效地创建可调用类构造函数。例如，如果你希望类构造函数不用`new`就可以运行，那么可以使用`apply`陷阱来创建一个新实例。以下是一些演示代码：

```javascript
class Person {
    constructor(name) {
        this.name = name;
    }
}

let PersonProxy = new Proxy(Person, {
    apply: function (trapTarget, thisArg, argumentList) {
        return new trapTarget(...argumentList);
    },
});

let me = PersonProxy('Nicholas');
console.log(me.name); //Nicholas
console.log(me instanceof Person); //true
console.log(me instanceof PersonProxy); //true
```

`PersonProxy`对象是`Person`类构造函数的代理，类构造函数是函数，所以当它们被用于代理时就像函数一样。`apply`陷阱覆写默认行为并返回`trapTarget`的新实例，该实例与`Person`相等。（我们在本示例中使用`trapTarget`，表示不需要手动指定类）用展开运算符将`argumentList`传递给`trapTarget`来分别传递每个参数。不使用`new`调用`PersonProxy()`可以返回一个`Person`的实例，如果你尝试不使用`new`调用`Person()`,则构造函数将抛出一个错误。创建可调用类构造函数只能通过代理来进行。

## 可撤销代理

通常，在创建代理后，代理不能脱离其目标，本章中的所有示例都使用了不可撤销的代理。但是可能存在你想撤销代理的情况，然后代理便失去效力。无论是出于安全目的通过调用`API` 提供一个对象，还是在任意时间点切断访问，你将发现撤销代理非常有用。

可以使用`Proxy.revocable()`方法创建可撤销的代理，该方法采用与`Proxy`构造函数相同的参数：目标对象和代理处理程序。返回值是具有以下属性的对象：

-   proxy 可被撤销的代理对象
-   revoke 撤销代理要调用的函数

当调用`revoke()`函数时，不能通过`proxy`执行进一步的操作。任何与代理对象交互的尝试都会触发代理陷阱抛出错误。例如：

```javascript
let target = {
    name: 'target',
};

let { proxy, revoke } = Proxy.revocable(target, {});

console.log(proxy.name); //"target"

revoke();

//抛出错误
console.log(proxy.name);
```

此示例创建一个可撤销代理，它使用解构功能将`proxy`和`revoke`变量赋值给`Proxy.revocable()`方法返回的对象上的同名属性。之后，`proxy`对象可以像不可撤销代理对象一样使用。因此`proxy.name`返回`"target"`，因为它直接透传了`target.name`的值。然而，一旦`revoke()`函数被调用，`proxy`对象不再是可用的代理对象，尝试访问`proxy.name`会抛出一个错误，正如任何会触发代理上陷阱的其他操作一样。

## 解决数组问题

在本章开始的时候我曾解释过，在`ECMAScript 6`出现以前，开发者不能在`JavaScript`中完全模仿数组的行为。而`ECMAScript 6`中的代理和反射`API`可以用来创建一个对象，该对象的行为与添加和删除属性时内建数组类型的行为相同。下面这个示例展示了如何用代理模仿这些行为：

```javascript
let colors = ['red', 'green', 'blue'];

console.log(colors.length); //3

colors[3] = 'black';

console.log(colors.length); //4
console.log(colors[3]); //black

colors.length = 2;

console.log(colors.length); //2
console.log(colors[3]); //undefined
console.log(colors[2]); //undefined
console.log(colors[1]); //green
```

注意此示例中的两个特别重要的行为：

-   当给`color[3]`赋值时，`length`属性的值增加到`4`
-   当`length`属性被设置为`2`时，数组中最后两个元素被删除。

要完全重造内建数组，只需模拟上述两种行为。下面几节将讲解如何创建一个能正确模仿这些行为的对象。

### 检测数组索引

请记住，为整数属性键赋值是数组才有的的特性，因为它们与非整数键的处理方式不同。要判断一个属性是否是一个索引，可以参考`ECMAScript 6`规范提供的以下说明：

### 添加新元素时增加`length`的值

请注意，我们之前描述的数组行为都依赖属性赋值，只需用`set`代理陷阱即可实现之前提到的两个行为。请看以下这个示例，当操作的数组索引大于`length - 1`时，`length`属性也一同增加，这实现了两个特性中的前一个：

```javascript
function toUint32(value) {
    return Math.floor(Math.abs(Number(value))) % Math.pow(2, 32);
}

function isArrayIndex(key) {
    let numbericKey = toUint32(key);
    return String(numbericKey) == key && numbericKey < Math.pow(2, 32) - 1;
}

function createMyArray(length = 0) {
    return new Proxy(
        { length },
        {
            set(trapTarget, key, value) {
                let currentLength = Reflect.get(trapTarget, 'length');
                if (isArrayIndex(key)) {
                    let numbericKey = Number(key);
                    if (numbericKey >= currentLength) {
                        Reflect.set(trapTarget, 'length', numbericKey + 1);
                    }
                }

                //无论key是什么类型总是会执行该语句
                return Reflect.set(trapTarget, key, value);
            },
        },
    );
}

let colors = createMyArray(3);
console.log(colors.length); //3

colors[0] = 'red';
colors[1] = 'green';
colors[2] = 'blue';

console.log(colors.length); //3

colors[3] = 'black';

console.log(colors.length); //4
console.log(colors[3]); //"black"
```

这段代码用`set`代理陷阱来拦截数组索引的设置过程。如果键是数组索引，则将其转换为数字，因为键始终作为字符串传递。接下来，如果该数值大于或等于当前长度属性，则将`length`属性更新为比数字键多`1`（设置位置`3`意味着`length`必须是`4`）。然后，由于你希望被设置的属性能够接收到指定的值，因此调用`Reflect.set()`通过默认行为来设置该属性。

调用`createMyArray()`并传入`3`作为`length`的值来创建最初的自定义数组，然后立即添加这`3`个元素的值，在此之前`length`属性一直是`3`，直到把位置`3`赋值为值`"black"`,`length`才被设置为`4`。

第一个数组特性已经正常运转了，下面我们继续来看第二个特性。

### 减少 length 的值来删除元素

仅当数组索引大于等于`length`属性时才需要模拟第一个数组特性，第二个特性与之相反，即当`length`属性被设置为比之前还小的值时会移除数组元素。这不仅设计长度属性的改变，还要删除原本可能存在的元素。例如有一个长度为`4`的数组，如果将`length`属性设置为`2`，则会删除位置`2`和`3`中的元素。同样可以在`set`代理陷阱中完成这个操作，这不会影响到第一个特性。以下示例在之前的基础上更新了`createMyArray`方法：

```javascript
function toUint32(value) {
    return Math.floor(Math.abs(Number(value))) % Math.pow(2, 32);
}

function isArrayIndex(key) {
    let numbericKey = toUint32(key);
    return String(numbericKey) == key && numbericKey < Math.pow(2, 32) - 1;
}

function createMyArray(length = 0) {
    return new Proxy(
        { length },
        {
            set(trapTarget, key, value) {
                let currentLength = Reflect.get(trapTarget, 'length');
                if (isArrayIndex(key)) {
                    let numbericKey = Number(key);
                    if (numbericKey >= currentLength) {
                        Reflect.set(trapTarget, 'length', numbericKey + 1);
                    }
                } else if (key === 'length') {
                    if (value < currentLength) {
                        for (let index = currentLength - 1; index >= value; index--) {
                            Reflect.deleteProperty(trapTarget, index);
                        }
                    }
                }

                //无论key是什么类型总是会执行该语句
                return Reflect.set(trapTarget, key, value);
            },
        },
    );
}

let colors = createMyArray(3);
console.log(colors.length); //3

colors[0] = 'red';
colors[1] = 'green';
colors[2] = 'blue';
colors[3] = 'black';

console.log(colors.length); //4

colors.length = 2;

console.log(colors.length); //2

console.log(colors[3]); //undefined
console.log(colors[2]); //undefined
console.log(colors[1]); //green
console.log(colors[0]); //red
```

该代码中的`set`代理陷阱检查`key`是否为`"length"`，以便正确调整对象的其余部分。当开始检查时，首先用`Reflect.get()`获取当前长度值，然后与新的值进行比较，如果新值比当前长度小，则通过一个`for`循环删除目标上所有不再可用的属性，`for`循环从后往前从当前数组长度（currentLength）处开始删除每个属性，直到到达新的数组长度（value）为止。

此示例为`colors`添加了`4`种颜色，然后将它的`length`属性设置为`2`，位于位置`2`和`3`的元素被移除，因此当你尝试访问它们时返回的是`undefined`。`length`属性被正确设置为`2`,位置`0`和`1`中的元素仍可访问。

实现了这两个特性，就可以很轻松地创建一个模仿数组特性的对象了。但创建一个类来封装这些特性是更好的选择，所以下一步用一个类来实现这个功能。

### 实现 MyArray 类

想要创建使用代理的类，最简单的方法是像往常一样定义类，然后在构造函数中返回一个代理，那样的话，当类实例化时返回的对象是代理而不是实例（构造函数中`this`的值是该实例）。实例成为代理的目标，代理则像原本的实例那样被返回。实例完全私有化，除了通过代理间接访问外，无法直接访问它。下面是从一个类构造函数返回一个代理的简单示例：

```javascript
class Thing {
    constructor() {
        return new Proxy(this, {});
    }
}

let myThing = new Thing();
console.log(myThing instanceof Thing); //true
```

在这个示例中，类`Thing`从它的构造函数中返回一个代理，代理的目标是`this`，所以即使`myThing`是通过调用`Thing`构造函数创建的，但它实际上是一个代理。由于代理会将它们的特性透过目标，因此`myThing`仍然被认为是`Thing`的一个实例，故对任何使用`Thing`类的人来说代理是完全透明的。

从构造函数中可以返回一个代理，理解这个概念后，用代理创建一个自定义数组就相对简单了。其代码与之前"减少`length`的值来删除元素"一节中的代码大部分是一样的，你可以使用相同的代理代码，但这次需要把它放在一个类构造函数中。下面是完整的示例：

```javascript
function toUint32(value) {
    return Math.floor(Math.abs(Number(value))) % Math.pow(2, 32);
}

function isArrayIndex(key) {
    let numbericKey = toUint32(key);
    return String(numbericKey) == key && numbericKey < Math.pow(2, 32) - 1;
}

class MyArray {
    constructor(length = 0) {
        this.length = length;
        return new Proxy(this, {
            set(trapTarget, key, value) {
                let currentLength = Reflect.get(trapTarget, 'length');
                if (isArrayIndex(key)) {
                    let numbericKey = Number(key);
                    if (numbericKey >= currentLength) {
                        Reflect.set(trapTarget, 'length', numbericKey + 1);
                    }
                } else if (key === 'length') {
                    if (value < currentLength) {
                        for (let index = currentLength - 1; index >= value; index--) {
                            Reflect.deleteProperty(trapTarget, index);
                        }
                    }
                }

                //无论key是什么类型总是会执行该语句
                return Reflect.set(trapTarget, key, value);
            },
        });
    }
}

let colors = new MyArray(3);
console.log(colors instanceof MyArray); //true

console.log(colors.length); //3

colors[0] = 'red';
colors[1] = 'green';
colors[2] = 'blue';
colors[3] = 'black';

console.log(colors.length); //4

colors.length = 2;

console.log(colors[3]); //undefined
console.log(colors[2]); //undefined
console.log(colors[1]); //green
console.log(colors[0]); //red
```

这段代码创建了一个`MyArray`类，从它的构造函数返回一个代理。`length`属性被添加到构造函数中，初始化为传入的值或默认值`0`，然后创建代理并返回。`colors`变量看起来好像只是`MyArray`的一个实例，并实现了数组的两个关键特性。

虽然从类构造函数返回代理很容易，但这也意味着每创建一个实例都要创建一个新代理。然而，有一种方法可以让所有实例共享一个代理：将代理用作原型。

## 将代理用作原型

虽然可以将代理当作原型使用，但这与本章之前的示例相比更复杂一点。如果代理是原型，仅当默认操作继续执行到原型上时才会调用代理陷阱，这会限制作为原型的能力。请看下面这个示例。

```javascript
let target = {};
let newTarget = Object.create(
    new Proxy(target, {
        //不会被调用
        defineProperty(trapTarget, name, descriptor) {
            //如果调用会导致一个错误
            return false;
        },
    }),
);

Object.defineProperty(newTarget, 'name', {
    value: 'newTarget',
});

console.log(newTarget.name); //"newTarget"
console.log(newTarget.hasOwnProperty('name')); //true
```

创建`newTarget`对象，它的原型是一个代理。由于代理是透明的，用`target`作为代理的目标实际上让`target`成为`newTarget`的原型。现在，仅当`newTarget`上的操作被透传给目标时才会调用代理陷阱。

调用`Object.defineProperty()`方法并传入`newTarget`来创建一个名为`name`的自有属性。在对象上定义属性的操作不需要操作对象原型，所以代理中的`defineProperty`陷阱永远不会被调用，`name`作为自有属性被添加到`newTarget`上。尽管代理作为原型使用时极其受限，但有几个陷阱却仍然有用，下面我们来看具体细节。

### 在原型上使用 get 陷阱

调用内部陷阱`[[Get]]`读取属性的操作先查找自有属性，如果未找到指定名称的自有属性，则继续到原型中查找，直到没有更多可以查找的原型过程结束。

如果设置一个`get`代理陷阱，则每当指定名称的自有属性不存在时，又由于存在以上过程，往往会调用原型上的陷阱。当访问我们不能保证存在的属性时，则可以用`get`陷阱来预防意外的行为。只需创建一个对象，在尝试访问不存在的属性时抛出错误即可：

```javascript
let target = {};
let thing = Object.create(
    new Proxy(target, {
        get(trapTarget, key, receiver) {
            throw new Error(`${key} doesn't exist`);
        },
    }),
);

thing.name = 'thing';
console.log(thing.name); //thing

//抛出错误
let unknown = thing.unknown;
```

在这段代码中，用一个代理作为原型创建了`thing`对象，当调用它时，如果其上不存在给定的键，那么`get`陷阱会抛出错误。由于`thing.name`属性存在，故读取它的操作不会调用原型上的`get`陷阱，只有当访问不存在的`thing.unknown`属性时才会调用。

当执行最后一行时，由于`unknown`不是`thing`的自有属性，因此该操作继续在原型上查找，之后`get`陷阱会抛出一个错误。在`JavaScript`中，访问未知属性通常会静默返回`undefined`，这种抛出错误的特性（其他语言中的做法）非常有用。

要明白，在这个示例中，理解`trapTarget`和`receiver`是不同的对象很重要。当代理被用作原型时，`trapTargte`是原型对象，`receiver`是实例对象。在这种情况下，`trapTarget`与`target`相等，`receiver`与`thing`相等，所以可以访问代理的原始目标和要操作的目标。

### 在原型上使用 set 陷阱

内部方法`[[Set]]`同样会检查目标对象中是否含有某个自有属性，如果不存在则继续查找原型。当给对象属性赋值时，如果存在同名自有属性则赋值给它；如果不存在给定名称，则继续在原型上查找。最棘手的是，无论原型上是否存在同名属性，该该属性赋值时都将默认在实例中创建该属性。

为了更好的了解何时会在原型上调用`set`陷阱，请思考以下显示默认行为的示例：

```javascript
let target = {};
let thing = Object.create(
    new Proxy(target, {
        set(trapTarget, key, value, receiver) {
            return Reflect.set(trapTarget, key, value, receiver);
        },
    }),
);

console.log(thing.hasOwnProperty('name'));

//触发set代理陷阱
thing.name = 'thing';

console.log(thing.name); //thing
console.log(thing.hasOwnProperty('name')); //true

//不触发set代理陷阱
thing.name = 'boo';

console.log(thing.name); //boo
```

在这个示例中，`target`一开始没有自有属性，对象`thing`的原型是一个代理，其定义了一个`set`陷阱来捕获任何新属性的创建。当`thing.name`被赋值为`"thing"`时，由于`name`不是`thing`的自由属性，故`set`代理陷阱会被调用。在陷阱中，`trapTarget`等于`target`，`receiver`等于`thing`。最终该操作会在`thing`上创建一个新属性，很幸运，如果传入`receiver`作为第 4 个参数，`Reflect.set()`就可以实现这个默认行为。

一旦在`thing`上创建了`name`属性，那么在`thing.name`被设置为其他值时不再调用`set`代理陷阱，此时`name`是一个自由属性，所以`[[Set]]`操作不会继续在原型上查找。

### 在原型上使用 has 陷阱

回想一下`has`陷阱，他可以拦截对象中的`in`操作符。`in`操作符先根据给定名称搜索对象的自有属性，如果不存在，则沿着原型链依此搜索后续对象的自有属性，直到找到给定的名称或无更多原型为止。因此，只有在搜索原型链上的代理对象时才会调用`has`陷阱，而当你用代理作为原型时，只有当指定名称没有对象的自有属性时才会调用`has`陷阱。例如：

```javascript
let target = {};
let thing = Object.create(
    new Proxy(target, {
        has(trapTarget, key) {
            return Reflect.has(trapTarget, key);
        },
    }),
);

//触发has代理陷阱
console.log('name' in thing); //false

thing.name = 'thing';

//不触发has代理陷阱
console.log('name' in thing);
```

这段代码在`thing`的原型上创建了一个`has`代理陷阱，由于使用`in`操作符时会自动搜索原型，因此这个`has`陷阱不像`get`陷阱和`set`陷阱一样再传递一个`receiver`对象，它只操作与`target`相等的`trapTarget`。在此示例中，第一次使用`in`操作符时会调用`has`陷阱，因为属性`name`不是`thing`的自有属性；而给`thing.name`赋值时会再次使用`in`操作符，这一次不再调用`has`陷阱，因为`name`已经是`thing`的自有属性了，故不会继续在原型中查找。

在此前的原型示例中我们已经讲解了如何用`Object.create()`方法创建对象，但是如果你想创建一个原型是代理的类，过程会更复杂一些。

### 将代理用作类的原型

由于类的`prototype`属性是不可写的，因此不能直接修改类来使用代理作为类的原型。然而，可以通过继承的方法来让类误以为自己可以将代理用作自己的原型。首先，需要用构造函数创建一个`ECMAScript 5`风格的类型定义。请看一下这个示例：

```javascript
function NoSuchProperty() {}

NoSuchProperty.prototype = new Proxy(
    {},
    {
        get(trapTarget, key, receiver) {
            throw new ReferenceError(`${key} doesn't exist`);
        },
    },
);

let thing = new NoSuchProperty();

//在get代理陷阱中抛出错误
let result = thing.name;
```

`NoSuchProperty`表示类将继承的基类，函数的`prototype`属性没有限制，于是你可以用代理将它重写。当属性不存在时会通过`get`陷阱来抛出错误，`thing`对象作为`NoSuchProperty`的实例被创建，被访问的属性`name`不存在于是抛出错误。

下一步是创建一个从`NoSuchProperty`继承的类。简单来说可以使用在第 9 章讨论的扩展语法来将代理引入到类的原型链，就像这样：

```javascript
function NoSuchProperty() {}

NoSuchProperty.prototype = new Proxy(
    {},
    {
        get(trapTarget, key, receiver) {
            throw new ReferenceError(`${key} doesn't exist`);
        },
    },
);

class Square extends NoSuchProperty {
    constructor(length, width) {
        super();
        this.length = length;
        this.width = width;
    }
}

let shape = new Square(2, 6);
let area1 = shape.length * shape.width;
console.log(area1);

//由于"wdth"不存在于是抛出错误
let area2 = shape.length * shape.wdth;
```

`Square`类继承自`NoSuchProperty`，所以它的原型链中包含代理。之后创建的`shape`对象是`Square`对象是`Square`的新实例，它有两个自有属性：`length`和`width`。读取这两个属性的值时不会调用`get`代理陷阱，只有访问`shape`对象上不存在的属性时（例如`shape.wdth`，很明显这是一个错误拼写）才会触发`get`代理陷阱并抛出一个错误。另一方面这也说明代理确实在`shape`对象的原型链中。但是有一点不太明显的是，代理不是`shape`对象的直接原型，实际上它位于`shape`对象的原型链中，需要几个步骤才能到达，只需稍微修改前面的示例就能更清楚地看到这一点：

```javascript
function NoSuchProperty() {}

//存储一份代理的引用，后面其会作为原型使用
let proxy = new Proxy(
    {},
    {
        get(trapTarget, key, receiver) {
            throw new ReferenceError(`${key} doesn't exist`);
        },
    },
);

NoSuchProperty.prototype = proxy;

class Square extends NoSuchProperty {
    constructor(length, width) {
        super();
        this.length = length;
        this.width = width;
    }
}

let shape = new Square(2, 6);
let shapeProto = Object.getPrototypeOf(shape);

console.log(shapeProto === proxy); //false

let secondLevelProto = Object.getPrototypeOf(shapeProto);

console.log(secondLevelProto === proxy); //true
```

在这一版代码中，为了便于后续识别，代理被存储在变量`proxy`中。`shape`的原型`Square.prototype`不是一个代理，但是`Shape.prototype`的原型是继承自`NoSuchProperty`的代理。

通过继承在原型链中额外增加另一个步骤非常重要，因为需要经过额外的一步才能触发代理中的`get`陷阱。如果`Shape.prototype`有一个属性，将会阻止`get`代理陷阱被调用，如下面的示例：

```javascript
function NoSuchProperty() {}

NoSuchProperty.prototype = new Proxy(
    {},
    {
        get(trapTarget, key, receiver) {
            throw new ReferenceError(`${key} doesn't exist`);
        },
    },
);

class Square extends NoSuchProperty {
    constructor(length, width) {
        super();
        this.length = length;
        this.width = width;
    }

    getArea() {
        return this.length * this.width;
    }
}

let shape = new Square(2, 6);

let area1 = shape.length * shape.width;
console.log(area1); //12

let area2 = shape.getArea();
console.log(area2); //12

//由于"wdth"不存在于是抛出错误
let area3 = shape.length * shape.wdth;
```

在这里，`Square`类有一个`getArea()`方法，这个方法被自动添加到`Square.prototype`，所以当调用`shape.getArea()`时，会先在`shape`实例搜索`getArea()`方法然后再继续在它的原型中搜索。由于`getArea()`是在原型中找到的，搜索结束，代理没有被调用。你一定不希望当`getArea()`被调用时还错误地抛出错误，这就是你想要的结果。

如果你需要这样的功能，尽管要通过一点额外的代码来创建原型链中有代理的类，付出的努力也值得了。
