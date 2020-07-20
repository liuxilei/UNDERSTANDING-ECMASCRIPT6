# JavaScript 中的类

## ECMAScript 5 中近类解构

在`ECMAScript 5`及早期版本中没有类的概念，最相近的思路是创建一个自定义类型：首先创建一个构造函数，然后定义另一个方法并赋值给构造函数的原型。例如：

```javascript
function PersonType(name) {
    this.name = name;
}

PersonType.prototype.sayName = function () {
    console.log(this.name);
};

var person = new PersonType('Nicholas');
person.sayName(); //"Nicholas"

console.log(person instanceof PersonType); //true
console.log(person instanceof Object); //true
```

许多模拟类的`JavaScript`库都是基于这种模式进行开发，而且`ECMAScript 6`中的类也是借鉴了类似的方法。

## 类的声明

`ECMAScript 6`有一种与其他语言中类似的类特性：类声明。同时，它也是`ECMAScript 6`中最简单的类形式。

### 基本的类声明语法

要声明一个类，首先编写`class`关键字，紧跟着的是类的名字，其他部分的语法类似于对象字面量方法的简写形式，但不需要在类的个元素之间使用逗号分隔。请看这段简单的类声明代码：

```javascript
class PersonClass {
    //等价于PersonType构造函数
    constructor(name) {
        this.name = name;
    }

    //等价于PersonType.proptotype.sayName
    sayName() {
        console.log(this.name);
    }
}

let person = new PersonClass('Nicholas');
person.sayName(); //Nicholas

console.log(person instanceof PersonClass); //true
console.log(person instanceof Object); //true

console.log(typeof PersonClass); //function
console.log(typeof PersonClass.prototype.sayName); //function
```

通过类声明语法定义`PersonClass`的行为与之前创建`PersonType`构造函数的过程相似，只是这里直接在类中通过特殊的`constructor`方法名来定义构造函数，且由于这种类使用简洁语法来定义方法，因而不需要添加`function`关键字。除`constructor`外没有其他保留的方法名，所有可以尽情添加方法。

自有属性是实例中的属性，不会出现在原型上，且只能在类的构造函数或方法中创建，此例中的`name`就是一个自有属性。这里建议你在构造函数中创建所有自有属性，从而只通过一处就可以控制类中的所有自有属性。

有趣的是，类声明仅仅是基于已有自定义类型声明的语法糖。`typeof PersonClass`最终返回的结果是`"function"`,所以`PersonClass`声明实际上创建了一个具有构造函数方法行为的函数。此示例中的`sayName()`方法实际上是`PersonClass.prototype`上的一个方法；与之类似的是，在之前的示例中，`sayName()`也是`PersonType.prototype`上的一个方法。通过语法糖包装以后，类就可以代替自定义类型的功能，你不必担心使用的是那种方法，只需关注如何定义正确的类。

**与函数不同的是，类属性不可被赋予新值，在之前的示例中，`PersonClass.prototype`就是这样一个只可读的类属性。**

### 为何使用类语法

尽管类与自定义类型之间有诸多相似之处，我们仍需牢记它们的这些差异：

-   函数声明可以被提升，而类声明与`let`声明类似，不能被提升；真正执行声明语句之前，它们会一直存在于临时死区中。
-   类声明中的所有代码将自动运行在严格模式下，而且无法强行让代码脱离严格模式执行。
-   自定义类型中，需要通过`Object.defineProperty()`方法手工指定某个方法不可枚举；而在类中，所有方法都是不可枚举的
-   每个类都有一个名为`[[Construct]]`的内部方法，通过关键字`new`调用那些不含`[[Construct]]`的方法会导致程序抛出错误。
-   使用除关键字`new`以外的方式调用类的构造函数会导致程序抛出错误。
-   在类中修改类名会导致程序报错。

了解了这些差异之后，我们可以用除了类之外的语法为之前示例中的`PersonClass`声明编写等价代码：

```javascript
//等价于PersonClass

let personClass2 = (function () {
    'use strict';

    const PersonType2 = function (name) {
        //确保关键字new调用该函数
        if (typeof new.target === 'undefined') {
            throw new Error('必须通过关键字new调用构造函数');
        }

        this.name = name;
    };

    Object.defineProperty(PersonType2.prototype, 'sayName', {
        value: function () {
            //确保不会通过关键字new调用该方法
            if (typeof new.target !== 'undefined') {
                throw new Error('不可使用关键字调用该方法');
            }
            console.log(this.name);
        },
        enumerable: false,
        writable: true,
        configurable: true,
    });
    return PersonType2;
})();
```

首先请注意，这段代码中有两处`PersonType2`声明：一处是外部作用域中的`let`声明，一处是立即执行函数表达式(IIFE)中的 const 声明，这也从侧面说明了为什么在外部修改类名而内部却不可修改。在构造函数中，先检查`new.target`是否通过`new`调用，如果不是则抛出错误；紧跟着，将`sayName()`方法定义为不可枚举，并再次检查`new.target`是否通过`new`调用，如果是则抛出错误；最后，返回这个构造函数。

从这个示例我们可以看到，尽管可以在不使用`new`语法的前提下实现类的所有功能，但如此一来，代码变得极为复杂。

### 常量类名

类的名称只是在类中为常量，所有尽管不能在类的方法中修改类名，但可以在外部修改：

```javascript
class Foo {
    constructor() {
        Foo = 'bar'; //执行时会抛出错误
    }
}

//但在类声明结束后就可以修改
Foo = 'bar';
```

在这段代码中，类的外部有一个`Foo`声明，而类的构造函数里的`Foo`则是一个独立存在的绑定。内部的`Foo`就像是通过`const`声明的，修改它的值会导致程序抛出错误；而外部的`Foo`就像是通过`let`声明的，可以随时修改这个绑定的值。

## 类表达式

类和函数都有两种存在形式：声明形式和表达式形式。声明形式的函数和类都由相应的关键字（分别为`function`和`class`）进行定义，随后紧跟了一个标识符；表达式形式的函数和类与之类似，只是不需要在关键字后添加标识符。类表达式的设计初衷是为了声明相应变量或传入函数作为参数。

```javascript
let PersonClass = class {
    //等价于PersonType构造函数
    constructor(name) {
        this.name = name;
    }

    //等价于PersonType.prototype.sayName
    sayName() {
        console.log(this.name);
    }
};

let person = new PersonClass('Nicholas');
person.sayName(); //"Nicholas"

console.log(person instanceof PersonClass); //true
console.log(person instanceof Object); //true

console.log(typeof PersonClass); //function
console.log(typeof PersonClass.prototype.sayName); //function
```

如上示例解释的，类表达式不需要标识符在类后。除了语法，类表达式在功能上等价于类声明。

类声明和类表达式的功能极为相似，只是代码编写方式略有差异，二者均不会像函数声明和函数表达式一样被提升，所以在运行时状态下无论选择哪一种方式代码最终的执行结果都没有太大差别。

### 命名类表达式

在上一节的示例中，我们定义的类表达式是匿名的，其实类与函数一样，都可以定义命名表达式。声明时，在关键字`class`后添加一个标识符即可定义为命名类表达式：

```javascript
let PersonClass = class PersonClass2 {
    //等价于PersonType构造函数
    constructor(name) {
        this.name = name;
    }

    //等价于PersonType.prototype.sayName
    sayName() {
        console.log(this.name);
    }
};

console.log(typeof PersonClass); //function
console.log(typeof PersonClass2); //undefined
```

在此示例中，类表达式被命名为`PersonClass2`,由于标识符`PersonClass2`只存在于类定义中，因此它可被用在像`sayName()`这样的方法中。而在类的外部，由于不存在一个名为`PersonClass2`的绑定，因为`typeof PersonClass2`的值为`"undefined"`为了进一步讲解背后的原理，我们来看一段没有使用关键字`class`的等价声明：

```javascript
//等价于命名类表达式PersonClass
let PersonClass = (function () {
    'use strict';

    const PersonClass2 = function (name) {
        //确保关键字new调用该函数
        if (typeof new.target === 'undefined') {
            throw new Error('必须通过关键字new调用构造函数');
        }

        this.name = name;
    };

    Object.defineProperty(PersonClass2.prototype, 'sayName', {
        value: function () {
            //确保不会通过关键字new调用该方法
            if (typeof new.target !== 'undefined') {
                throw new Error('不可使用关键字调用该方法');
            }
            console.log(this.name);
        },
        enumerable: false,
        writable: true,
        configurable: true,
    });
    return PersonClass2;
})();
```

在`JavaScript`引擎中，类表达式的实现与类声明稍有不同。对于类声明来说，通过`let`定义的外部绑定与通过`const`定义的内部绑定具有相同名称；而命名类表达式通过`const`定义名称，从而`PersonClass2`只能在类的内部使用。

尽管命名类表达式与命名函数表达式有不同的表现，但二者间仍有许多相似之处，都可以在多个场景中作为值使用，下面将继续讲解它们。

## 作为一等公民的类

在程序中，一等公民是指一个可以传入函数，可以从函数返回，并且可以赋值给变量的值。`JavaScript`函数是一等公民(也被称作头等函数)，这也正是`JavaScript`中的一个独特之处。

`ECMAScript 6`延续了这个传统，将类也设计为一等公民，允许通过多种方式使用类的特性。例如，可以将类作为参数传入函数中：

```javascript
function createObject(classDef) {
    return new classDef();
}

let obj = createObject(
    class {
        sayHi() {
            console.log('Hi');
        }
    },
);

obj.sayHi(); //Hi
```

在这个示例中，调用`createObject()`函数时传入一个匿名类表达式作为参数，然后通过关键字`new`实例化这个类并返回实例，将其储存在变量`obj`中。

类表达式还有另一种使用方式，通过立即调用类表构造函数可以创建单例。用`new`调用类表达式，紧接着通过一对小括号调用这个表达式，例如：

## 访问器属性

尽管应该在类的构造函数中创建自己的属性，但是类也支持直接在原型上定义访问器属性。创建`getter`时，需要在关键字`get`后紧跟一个空格和相应的表示符；创建`setter`时，需要把关键字`get`替换成`set`即可，就像这样：

```javascript
class CustomHTMLElement {
    constructor(element) {
        this.element = element;
    }

    get html() {
        return this.element.innerHTML;
    }

    set html(value) {
        this.element.innerHTML = value;
    }
}

var descriptor = Object.getOwnPropertyDescriptor(CustomHTMLElement.prototype, 'html');

console.log('get' in descriptor); //true
console.log('set' in descriptor); //true
console.log(descriptor.enumerable); //false
```

这段代码中的`CustomHTMLElement`类是一个针对现有`DOM`元素的包装器，并通过`getter`和`setter`方法将这个元素的`innerHTML`方法委托给`html`属性，这个访问器属性是在`CustomHTMLElement.prototype`上创建的。与其他方法一样，创建时声明该属性不可枚举。下面这段代码是非类形式的等价实现。

```javascript
//等同于上一个示例

let CustomHTMLElement = (function (element) {
    'use strict';

    const CustomHTMLElement = function (element) {
        //确保通过关键字new调用该函数
        if (typeof new.target !== 'undefined') {
            throw new Error('必须通过关键字new调用构造函数');
        }
        this.element = element;
    };

    Object.defineProperty(CustomHTMLElement.prototype, 'html', {
        enumerable: false,
        configurable: true,
        get: function () {
            return this.element.innerHTML;
        },
        set: function (value) {
            this.element.innerHTML = value;
        },
    });

    return CustomHTMLElement;
})();
```

由上可见，比起非类等效实现，类语法可以节省很多代码。在非类等效实现中，仅`html`访问器属性定义的代码量就与类声明一样多。

## 可计算成员名称

类和对象字面量还有更多相似之处，类方法与访问器属性也支持使用可计算名称。就像在对象字面量一样，用方括号包裹一个表达式即可使用可计算名称，例如：

```javascript
let methodName = 'sayName';

class PersonClass {
    constructor(name) {
        this.name = name;
    }

    [methodName]() {
        console.log(this.name);
    }
}

let me = new PersonClass('Nichloas');
me.sayName(); //Nichloas
```

这个版本的`PersonClass`通过变量来给类定义中的方法命名，字符串`"sayName"`被赋值给`methodName`变量，然后`methodName`又被用于声明随后可直接访问的`sayName()`方法。

通过相同的方式可以在访问器属性中应用可计算名称，就像这样：

```javascript
let propertyName = 'html';

class CustomHTMLElement {
    constructor(element) {
        this.element = element;
    }

    get [propertyName]() {
        return this.element.innerHTML;
    }

    set [propertyName](value) {
        this.element.innerHTML = value;
    }
}
```

在这里通过`propertyName`变量并使用`getter`和`setter`方法为类添加`html`属性，并且可以像往常一样通过`html`访问该属性。

在类和对象字面量诸多的共同点，除了方法、访问器属性及可计算名称上的共同点外，还需要了解另一个相似之处，也就是访问器方法。

## 生成器方法

回忆第 8 章，在对象字面量中，可以通过在方法名前附加一个星号（\*）的方式来定义生成器，。在类中亦是如此，可以将任何方法定义成生成器。请看这个示例：

```javascript
class MyClass {
    *createIterator() {
        yield 1;
        yield 2;
        yield 3;
    }
}

let instance = new MyClass();
let iterator = instance.createIterator();
```

这段代码创建了一个名为`MyClass`的类，它有一个生成器方法`createIterator()`，其返回值为一个应编码在生成器中的迭代器。如果用对象来表示集合，又希望通过简单的方式迭代集合中的值，那么生成器方法就派上用场了。数组、`Set`集合及`Map`集合为开发者们提供了多个生成器方法来与集合中的元素交互。

尽管生成器方法很实用，但如果你的类是用来表示值的集合的，那么为它定义一个默认迭代器会更有用。通过`Symbol.iterator`定义生成器方法即可为类定义默认迭代器。

```javascript
class Collection {
    constructor() {
        this.items = [];
    }

    *[Symbol.iterator]() {
        yield* this.items.values();
    }
}

var collection = new Collection();
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

这个示例用可计算名称创建了一个代理`this.items`数组`values()`迭代器的生成器方法。任何管理一系列值的类都应该引入默认迭代器，因为一些与特定集合有关的操作需要所操作的集合含有一个迭代器。现在可以将`Collection`的实例直接用于`for-of`循环中或用展开运算符操作它。

如果不介意在对象的实例中出现添加的方法和访问器属性，则可以将它们添加到类的原型中；如果你希望它们只出现在类中，那么需要使用静态成员。

## 静态成员

在`ECMAScript 5`及早期版本中，直接将方法添加到构造函数中来模拟静态成员是一种常见的模式，例如：

```javascript
function PersonType(name) {
    this.name = name;
}

//静态方法
PersonType.create = function (name) {
    return new PersonType(name);
};

//实例方法
PersonType.prototype.sayName = function () {
    console.log(this.name);
};

var person = PersonType.create('Nicholas');
```

在其他编程语言中，由于工厂方法`PersonType.create()`使用的数据不依赖`PersonType`的实例，因而其会被认为是一个静态方法。`ECMAScript 6`的类语法简化了创建静态成员的过程，在方法或访问器属性名前使用正式的静态注释即可。下面这个类等价于之前的示例：

```javascript
class PersonClass {
    //等价于PersonType构造函数
    constructor(name) {
        this.name = name;
    }

    //等价于PersonType.prototype.sayName
    sayName() {
        console.log(this.name);
    }

    //等价于PersonType.create
    static create(name) {
        return new PersonClass(name);
    }
}

let person = PersonType.create('Nicholas');
```

`PersonClass`定义只有一个静态方法`create()`，它的语法与`sayName()`的区别只在于是否使用`static`关键字。类中的所有方法和访问器属性都可以用`static`关键字来定义，唯一的限制是不能将`static`用于定义构造函数方法。

**不可在实例中访问静态成员，必须要直接在类中访问静态成员。**

## 继承与派生类

在`ECMAScript 6`之前，实现继承与自定义类型是一个不小的工作。严格意义上的继承需要多个步骤实现。请看以下示例：

```javascript
function Rectangle(length, width) {
    this.length = length;
    this.width = width;
}

Rectangle.prototype.getArea = function () {
    return this.width * this.width;
};

function Square(length) {
    Rectangle.call(this, length, length);
}

Square.prototype = Object.create(Rectangle.prototype, {
    constructor: {
        value: Square,
        enumerable: true,
        writable: true,
        configurable: true,
    },
});

var square = new Square(3);

console.log(square.getArea()); //9
console.log(square instanceof Square); //true
console.log(square instanceof Rectangle); //true
```

`Square`继承自`Rectangle`，为了这样做，必须用一个创建自`Rectangle.prototype`的新对象重写`Square.prototype`并调用`Rectangle.call()`方法。`JavaScript`新手经常对这些步骤感到困惑，即使是经验丰富的开发者也常在这里出错。

类的出现让我们可以更轻松地实现继承功能，使用熟悉的`extends`关键字可以指定类继承的函数。原型会自动调整，通过调用`super()`方法即可访问基类的构造函数。这段代码是之前示例的`ECMAScript 6`等价版本：

```javascript
class Rectangle {
    constructor(length, width) {
        this.length = length;
        this.width = width;
    }

    getArea() {
        return this.length * this.length;
    }
}

class Square extends Rectangle {
    constructor(length) {
        //等价于Rectangle.call(this, length, length)
        super(length, length);
    }
}

var square = new Square(3);

console.log(square.getArea()); //9
console.log(square instanceof Square); //true
console.log(square instanceof Rectangle); //true
```

这一次，`Square`类通过`extends`关键字继承`Rectangle`类，在`Square`构造函数中通过`super()`调用`Rectangele`构造函数并传入相应参数。请注意，与`ECMAScript 5`版本代码不同的是，标识符`Rectangle`只用于类声明(extends 之后)。

继承自其他类的类被称作派生类，如果在派生类中指定了构造函数则必须要调用`super()`,如果不这样做程序就会报错。如果选择不使用构造函数，则当创建新的类实例时会自动调用`super()`并传入所有参数。举个例子，以下两个类相同：

```javascript
class Square extends Rectangle {
    //没有构造函数
}

//等价于
class Square extends Rectangle {
    constructor(...args) {
        super(...args);
    }
}
```

示例中的第二个类是所有派生类的等效默认构造函数，所有参数按顺序被传递给基类的构造函数。这里展示的功能不太正确，因为`Square`的构造函数只需要一个参数，所以最好手动定义构造函数。

**使用`super()`的小贴士**

当使用`super()`时切记以下几个关键点：

-   只可在派生类的构造函数中使用`super()`,如果尝试在非派生类(不是用`extends`声明的类)或函数中使用则会导致程序抛出错误。
-   在构造函数中访问`this`之前一定要调用`super()`,它负责初始化`this`,如果在调用`super()`之前尝试访问`this`会导致程序出错。
-   如果不想调用`super()`,则唯一的方法是让类的构造函数返回一个对象。

### 类方法遮蔽

派生类的方法总会覆盖基类中的同名方法。举个例子，给`Square`添加`getArea()`方法来重新定义这个方法的功能：

```javascript
class Square extends Rectangle {
    constructor(length) {
        super(length, length);
    }

    //覆盖并遮蔽Rectangle.prototype.getArea()方法
    getArea() {
        return this.length * this.length;
    }
}
```

由于为`Square`定义了`getArea()`方法，便不能在`Square`的实例中调用`Rectangle.prototype.getArea()`方法。当然，如果你想调用基类中的该方法，则可以调用`super.getArea()`方法，就像这样：

```javascript
class Square extends Rectangle {
    constructor(length) {
        super(length, length);
    }

    //覆盖遮蔽后调用Rectangle.prototype.getArea()
    getArea() {
        super().getArea();
    }
}
```

以这种方法使用`Super`与我们在第 4 章讨论的`Super`引用一样，`this`值会被自动正确设置，然后就可以进行简单的方法调用了。

### 静态成员继承

如果基类有静态成员，那么这些静态成员在派生类中也可用。`JavaScript`中的继承与其他语言中的继承一样，只是在这里继承还是一个新概念。请看这个示例：

```javascript
class Rectangle {
    constructor(length, width) {
        this.length = length;
        this.width = width;
    }

    getArea() {
        return this.width * this.width;
    }

    static create(length, width) {
        return new Rectangle(length, width);
    }
}

class Square extends Rectangle {
    constructor(length) {
        //等价于Rectangle.call(this, length, length)
        super(length, length);
    }
}

var rect = Square.create(3, 4);

console.log(rect instanceof Rectangle); //true
console.log(rect.getArea()); //16
console.log(rect instanceof Square); //false
```

在这段代码中，新的静态方法`create()`被添加到`Rectangle`类中，继承后的`Square.create()`与`Rectagle.create()`的行为很像。

### 派生自表达式的类

`ECMAScirpt 6`最强大的一面或许是从表达式导出类的功能了。只要表达式可以被解析为一个函数并且具有`[[Construct]]`属性和原型，那么就可以用`extends`进行派生。举个例：

```javascript
function Rectangle(length, width) {
    this.length = length;
    this.width = width;
}

Rectangle.prototype.getArea = function () {
    return this.length * this.length;
};

class Square extends Rectangle {
    constructor(length) {
        super(length, length);
    }
}

var x = new Square(3);
console.log(x.getArea()); //9
console.log(x instanceof Rectangle); //true
```

`Rectangle`是一个`ECMAScript 5`风格的构造函数，`Square`是一个类，由于`Rectangle`具有`[[Construct]]`属性和原型，因此`Square`类可以直接继承它。

`extends`强大的功能使得类可以继承自任意类型的表达式，从而创造更多可能性，例如动态地确定类的继承目标。例如：

```javascript
function Rectangle(length, width) {
    this.length = length;
    this.width = width;
}

Rectangle.prototype.getArea = function () {
    return this.length * this.length;
};

function getBase() {
    return Rectangle;
}

class Square extends getBase() {
    constructor(length) {
        super(length, length);
    }
}

var x = new Square(3);
console.log(x.getArea()); //9
console.log(x instanceof Rectangle); //true
```

`getBase()`函数是类声明的一部分，直接调用后返回`Rectangle`,此示例实现的功能与之前的示例等价。由于可以动态确定使用哪个基类，因而可以创建不同的继承方法。例如，可以创建`mixin`:

```javascript
let SerializableMixin = {
    serialize() {
        return JSON.stringify(this);
    },
};

let AreaMixin = {
    getArea() {
        return this.length * this.length;
    },
};

function mixin(...mixins) {
    var base = function () {};
    Object.assign(base.prototype, ...mixins);
    return base;
}

class Square extends mixin(AreaMixin, SerializableMixin) {
    constructor(length) {
        super();
        this.length = length;
        this.width = length;
    }
}

var x = new Square(3);
console.log(x.getArea()); //9
console.log(x.serialize()); //{"length":3,"width":3}
```

这个示例使用了`mixin`函数代替传统的继承方法，它可以接受任意数量的`mixin`对象作为参数。首先创建一个函数`base`,再将每一个`mixin`对象的属性值赋值给`base`的原型，最后`minxin`函数返回这个`base`函数，所以`Square`类就可以基于这个返回的函数用`extends`进行扩展。请记住，由于使用了`extends`,因此在构造函数中需要调用`super()`。

`Square`的实例拥有来自`AreaMixin`对象的`getArea()`方法和来自`SerializableMix`对象的`serialize`方法，这都是通过原型继承实现的，`minxin()` 函数会用所有`mixin`对象的自有属性动态填充新函数的原型。请记住，如果多个`mixin`对象具有相同属性，那么只有最后一个被添加的属性被保留。

在`extends`后可以使用任意表达式，但不是所有表达式最终都能生成合法的类。如果使用`null`或生成器函数会导致错误发生，类在这些情况下没有`[[Construc]]`属性，尝试为其创建新的实例会导致程序无法调用`[[Construct]]`而报错。

### 内建对象的继承

自`JavaScript`数组诞生以来，开发者一直都希望通过继承的方式创建属于自己的特殊数组。在`ECMAScript 5`及早期版本中这几乎是不可能的，用传统的继承方式无法实现这样的功能。例如：

```javascript
//内建数组行为
var colors = [];
colors[0] = 'red';
console.log(colors.length); //1

colors.length = 0;
console.log(colors[0]); //undefined

//尝试通过ES5语法继承数组

function MyArray() {
    Array.apply(this, arguments);
}

MyArray.prototype = Object.create(Array.prototype, {
    constructor: {
        value: MyArray,
        writable: true,
        configurable: true,
        enumerable: true,
    },
});

colors = new MyArray();
colors[0] = 'red';
console.log(colors.length); //0

colors.length = 0;
console.log(colors[0]); //"red"
```

这段代码最后`console.log()`的输出结果与预期不符，`MyArray`实例的`length`和数值型属性的行为与内建数组中的不一致，这是因为通过传统`JavaScript`继承形式实现的数组继承没有从`Array.apply()`或原型赋值中继承相关功能。

`ECMAScript 6`类语法的一个目标是支持内建对象继承，因而`ES6`中的类继承模型与`ECMAScript 5`及早期版本中的稍有不同，主要体现在：

在`ECMAScript 5`的传统继承方式中，先由派生类型创建`this`的值，然后调用基类型的构造函数，这也意味着，`this`的值开始指向的是`MyArray`的实例，但是随后会被来自`Array`的其他属性所修饰。

`ECMAScript 6`中的类继承则与之相反，先由基类(`Array`)创建`this`的值，然后派生类的构造函数(`MyArray`)再修改这个值。所以一开始可以通过`this`访问基类的所有内建功能，然后再正确地接收所有与之相关的功能。

以下示例是一个基于类生成特殊数组的实践：

```javascript
class MyArray extends Array {}

var colors = new MyArray();
colors[0] = 'red';
console.log(colors.length); //1

colors.length = 0;
console.log(colors[0]); //undefined
```

`MyArray`直接继承自`Array`,其行为与`Array`也很相似，操作数值属性会更新`length`属性，操作`length`属性也会更新数值型属性。于是，可以正确地继承`Array`对象来创建自己的派生数组类型，当然也可以继承其他的内建对象。添加所有的这些功能后，内建对象继承的最后一个特殊情况便被`ECMAScript 6`及派生语法有效解决了，只是这个特殊情况仍值得我们探索一番。

### Symbol.species 属性

内建对象继承的一个实用之处是，原本在内建对象中返回实例自身的方法将自动返回派生类的实例。所以，如果你有一个继承自`Array`的派生类`MyArray`,那么像`slice()`这样的方法也会返回一个`MyArray`的实例。例如：

```javascript
class MyArray extends Array {}

let items = new MyArray(1, 2, 3, 4),
    subitems = items.slice(1, 3);

console.log(items instanceof MyArray); //true
console.log(subitems instanceof MyArray); //true
```

正常情况下，继承自`Array`的`slice()`方法应该返回`Array`的实例，但是在这段代码中，`slice()`方法返回的是`MyArray`的实例。在浏览器引擎背后是通过`Symbol.species`属性实现这一行为。

`Symbol.species`是诸多内部`Symbol`中的一个，它被用于定义返回函数的静态访问器属性。被返回的函数是一个构造函数，每当要在实例的方法中（不是在构造函数中）创建类的实例时必须使用这个构造函数。以下这些内建类型均已定义`Symbol.species`属性：

-   Array
-   ArrayBuffer
-   Map
-   Promise
-   RegExp
-   Set
-   Typed arrays

列表中的每个类型都有一个默认的`Symbol.species`属性，该属性的返回值为`this`,这也意味着该属性总会返回构造函数。如果在自定义的类中实现这个功能，则代码看起来可能是这样的：

```javascript
//几个内建类型像这样使用species
class MyClass {
    static get [Symbol.species]() {
        return this;
    }

    constructor(value) {
        this.value = value;
    }

    clone() {
        return new this.constructor[Symbol.species](this.value);
    }
}
```

在这个示例中，`Symbol.species`被用来给`MyClass`赋值静态访问器属性，请注意，这里只有一个`getter`方法却没有`setter`方法，这是因为在这里不可改变类的种类。调用`this.constructor[Symbol.species]`会返回`MyClass`,`clone()`方法通过这个定义可以返回新的实例，从而允许派生类覆盖这个值。举个例子：

```javascript
class MyClass {
    static get [Symbol.species]() {
        return this;
    }

    constructor(value) {
        this.value = value;
    }

    clone() {
        return new this.constructor[Symbol.species](this.value);
    }
}

class MyDerivedClass1 extends MyClass {
    //空
}

class MyDerivedClass2 extends MyClass {
    static get [Symbol.species]() {
        return MyClass;
    }
}

let instance1 = new MyDerivedClass1('foo'),
    clone1 = instance1.clone(),
    instance2 = new MyDerivedClass2('bar'),
    clone2 = instance2.clone();

console.log(clone1 instanceof MyClass); //true
console.log(clone1 instanceof MyDerivedClass1); //true
console.log(clone2 instanceof MyClass); //true
console.log(clone2 instanceof MyDerivedClass2); //false
```

在这里，`MyDerivedClass1`继承`MyClass`时未改变`Symbol.species`属性，由于`this.constructor[Symbol.species]`的返回值是`MyDerivedClass1`,因此调用`clone()`返回的是`MyDerivedClass1`的实例；`MyDerivedClass2`继承`MyClass`是重写了`Symbol.species`让其返回`MyClass`,调用`MyDerivedClass2`实例的`clone()`方法时，返回值是一个`MyClass`的实例。通过`Symbol.species`可以定义当派生类的方法返回实例时，应该返回的值的类型。

例如，数组就通过`Symbol.species`来指定那些返回数组的方法应当从哪个类中获取。在一个派生自数组的类中，我们可以决定继承的方法返回何种类型的对象，就像这样：

```javascript
class MyArray extends Array {
    static get [Symbol.species]() {
        return Array;
    }
}

let items = new MyArray(1, 2, 3, 4),
    subitems = items.slice(1, 3);

console.log(items instanceof MyArray); //true
console.log(subitems instanceof MyArray); //false
console.log(subitems instanceof Array); //true
```

这段代码重写了`MyArray`继承自`Array`的`Symbol.species`属性，所有返回数组的继承方法现在将使用`Array`而不使用`MyArray`的实例。

一般来说，只要想在类方法中调用`this.constructor`,就应该使用`Symbol.species`属性，从而让派生类重写返回类型。而且如果你正从一个已定义`Symbol.species`属性的类创建派生类，那么确保使用那个值而不是使用构造函数。

## 在类的构造函数中使用`new.target`

在第 3 章，我们曾了解`new.target`及它的值根据函数被调用的方式而改变的原理。在类的构造函数中也可以通过`new.target`来确定类是如何被调用的。在简单情况下，`new.target`等于类的构造函数，就像下面示例：

```javascript
class Rectangle {
    constructor(length, width) {
        console.log(new.target === Rectangle);
        this.length = length;
        this.width = width;
    }
}

//new.target的值是Rectangle
var obj = new Rectangle(3, 4); //true
```

这段代码展示了当调用`new Rectangle(3, 4)`时等价于`Rectangle`的`new.target`。类构造函数必须通过`new`关键字调用，所以总是在类的构造函数中定义`new.target`属性。但是其值有时会不同，请看这段代码：

```javascript
class Rectangle {
    constructor(length, width) {
        console.log(new.target === Rectangle);
        this.length = length;
        this.width = width;
    }
}

class Square extends Rectangle {
    constructor(length) {
        super(length, length);
    }
}

//new.target的值是Square
var obj = new Square(3); //false
```

`Square`调用`Rectangle`的构造函数，所以当调用发生时`new.target`等于`Square`。这一点非常重要，因为每个构造函数都可以根据自身被调用的方式改变自己的行为。例如，可以用`new.target`创建一个抽象基类（不能被直接实例化的类），就像这样：

```javascript
//抽象基类
class Shape {
    constructor() {
        if (new.target === Shape) {
            throw new Error('这个类不能被直接实例化。');
        }
    }
}

class Rectangle extends Shape {
    constructor(length, width) {
        super();
        this.length = length;
        this.width = width;
    }
}

var x = new Shape(); //抛出错误

var y = new Rectangle(3, 4); //没有错误
console.log(y instanceof Shape); //true
```

在这个示例中，每当`new.target`是`Shape`时构造函数总会抛出错误，这相当于调用`new Shape()`时总会出错。但是，仍可用`Shape`作为基类派生其他类，示例中的`Rectangle`便是这样。`super()`调用执行了`Shape`的构造函数，`new.target`与`Rectangle`等价，所以构造函数继续执行不会抛出错误。

**因为类必须通过`new`关键字才能调用，所以在类的构造函数中，`new.target`属性永远不会是`undefined`。**
