# 解构

## 为何使用结构功能

在`ECMAScript5`及早期版本中，开发者们为了从对象和数组中获取特定数据并赋值给变量，编写了许多看起来同质化的代码，就像这样：

```javascript
let options = {
    repeat: true,
    save: false,
};
//从对象中提取数据
let repeat = options.repeat,
    save = options.save;
```

## 对象解构

```javascript
let node = {
    type: 'Identifier',
    name: 'foo',
};

let { type, name } = node;
console.log(type); //Identifier
console.log(name); //foo
```

**不要忘记初始化程序**

如果使用`var`、`let`或`const`解构声明变量，则必须要提供初始化程序(也就是等号右侧的值)。下面这几行代码全部会导致程序抛出语法错误，它们都缺少了初始化程序：

```javascript
//语法错误！
var { type, name };

//语法错误！
let { type, name };

//语法错误！
const { type, name };
```

如果不使用解构功能，则`var`和`let`声明不强制要求提供初始化程序，但是对于`const`声明，无论如何必须提供初始化程序。

### 解构赋值

到目前为止，我们已经将对象解构应用到了变量的声明中。然而，我们同样可以在给变量赋值时使用解构语法。举个例子，你可能在定义变量之后想要修改它们的值，就像这样：

```javascript
let node = {
        type: 'Identifier',
        name: 'foo',
    },
    type = 'Literal',
    name = 5;

//使用解构赋值为多个变量赋值
({ type, name } = node);

console.log(type); //Identifier
console.log(name); //foo
```

注意，一定要用一对小括号包裹解构赋值语句，`JavaScript`引擎将一对开放的花括号视为一个代码块，代码块语句不允许出现在赋值语句左侧，添加小括号后可以将语句转化为一个表达式，从而实现整个解构赋值的过程。

如此一来，在任何可以使用值的地方你都可以使用解构赋值表达式。想象下给函数传递参数的过程：

```javascript
let node = {
        type: 'Identifier',
        name: 'foo',
    },
    type = 'Literal',
    name = 5;

function outputInfo(value) {
    console.log(value === node);
}

outputInfo(({ type, name } = node)); //true
console.log(type); //Identifier
console.log(name); //foo
```

**解构赋值表达式（也就是=右侧的表达式）如果为`null`或`undefined`会导致程序抛出错误。也就是说，任何尝试读取`null`或`undefined`的属性的行为都会触发运行时错误。**

### 默认值

使用解构赋值表达式时，如果指定的局部变量名称在对象中不存在，那么这个局部变量会被赋值为`undefinde`,就像这样：

```javascript
let node = {
    type: 'Identifier',
    name: 'foo',
};

let { type, name, value } = node;
console.log(type); //Identifier
console.log(name); //foo
console.log(value); //undefined
```

当指定的属性不存在时，可以随意定义一个默认值，在属性名称后添加一个等号(=)和相应的默认值即可：

```javascript
let node = {
    type: 'Identifier',
    name: 'foo',
};

let { type, name, value = true } = node;
console.log(type); //Identifier
console.log(name); //foo
console.log(value); //true
```

### 为非同名局部变量赋值

```javascript
let node = {
    type: 'Identifier',
    name: 'foo',
};

let { type: localType, name: localName } = node;

console.log(localType); //Identifier
console.log(localName); //foo
```

当使用其他变量名进行赋值时也可以添加默认值，只需在变量名后添加等号和默认值即可：

```javascript
let node = {
    type: 'Identifier',
};

let { type: localType, name: localName = 'bar' } = node;

console.log(localType); //Identifier
console.log(localName); //bar
```

### 嵌套对象解构

```javascript
let node = {
    type: 'Identifier',
    name: 'foo',
    loc: {
        start: {
            line: 1,
            column: 1,
        },
        end: {
            line: 1,
            column: 4,
        },
    },
};

let {
    loc: { start },
} = node;
console.log(start); //{line: 1, column: 1}
```

更进一步，也可以使用一个与对象属性名不同的局部变量名：

```javascript
let node = {
    type: 'Identifier',
    name: 'foo',
    loc: {
        start: {
            line: 1,
            column: 1,
        },
        end: {
            line: 1,
            column: 4,
        },
    },
};

let {
    loc: { start: localStart },
} = node;
console.log(localStart); //{line: 1, column: 1}
```

**语法警示**

在使用嵌套解构功能时请注意，你很可能无意中创建了一个无效表达式。内花括号在对象解构的语法中是合法的，然而这条语句却什么都不会做：

```javascript
//未声明任何变量！
let {
    loc: {},
} = node;
```

在这条语句中，由于右侧只有一对花括号，因而其不会声明任何绑定，`loc`不是即将创建的绑定，它代表了在对象中检索属性的位置。在上述示例中，更好的做法是使用=定义一个默认值。这个语法在将来有可能被废弃，但现在，你只需要警示自己不写类似的代码。

## 数组解构

```javascript
let colors = ['red', 'green', 'blue'];
let [firstColor, secondColor] = colors;

console.log(firstColor); //red
console.log(secondColor); //green
```

```javascript
let colors = ['red', 'green', 'blue'];
let [, , thirdColor] = colors;

console.log(thirdColor); //blue
```

### 解构赋值

数据解构也可用于赋值上下文，但不需要用小括号包裹表达式，这一点与对象解构的约定不同。

```javascript
let colors = ['red', 'green', 'blue'],
    firstColor = 'black',
    secondColor = 'purple';

[firstColor, secondColor] = colors;

console.log(firstColor); //red
console.log(secondColor); //green
```

数组解构语法还有一个独特的用例：交换两个变量的值。在排序算法中，值交换是一个非常常见的操作，如果要在`ECMAScript5`中交换两个变量的值，则须引入第三个临时变量：

```javascript
//在ECMAScript5中交换变量

let a = 1,
    b = 2,
    temp;

temp = a;
a = b;
b = temp;

console.log(a); //2
console.log(b); //1
```

在这种变量交换的方式中，中间变量`temp`是不可或缺的。如果使用数组解构赋值语法，就不再需要额外的变量了，在`ECMAScript6`中你可以这样做：

```javascript
//在ECMAScript6中交换变量

let a = 1,
    b = 2;

[a, b] = [b, a];
console.log(a); //2
console.log(b); //1
```

### 默认值

```javascript
let colors = ['red'];
let [firstColor, secondColor = 'green'] = colors;

console.log(firstColor); //red
console.log(secondColor); //green
```

### 嵌套数组解构

嵌套数组解构与嵌套对象解构的语法类似，在原有的数组模式中插入另一个数组模式，即可将解构过程深入到下一个层次：

```javascript
let colors = ['red', ['green', 'lightgreen'], 'blue'];

let [firstColor, [secondColor]] = colors;

console.log(firstColor); //red
console.log(secondColor); //green
```

### 不定元素

在数组中，可以通过`...`语法将数组中的其余元素赋值给一个特定的变量，就像这样：

```javascript
let colors = ['red', 'green', 'blue'];

let [firstColor, ...restColors] = colors;

console.log(firstColor); //red
console.log(restColors); //["green", "blue"]
```

在设计`JavaScript`时，很明显遗漏了数组复制的功能。而在`ECMAScript5`中，开发者经常使用`concat()`方法来克隆数组：

```javascript
//浅拷贝
var colors = ['red', 'green', 'blue', { a: { c: 1 } }];
var clonedColors = colors.concat();

console.log(clonedColors === colors); //false

colors[3].a.c = 2;
console.log(clonedColors[3].a.c); //2
```

`concat()`方法的设计初衷是连接两个数组，如果调用时不传递参数就会返回当前数组的副本。在`ECMAScript6`中，可以通过不定元素的语法来实现相同的目标:

```javascript
//浅拷贝
let colors = ['red', 'green', 'blue', { a: { c: 1 } }];
let [...clonedColors] = colors;

console.log(colors === clonedColors); //false

colors[3].a.c = 2;
console.log(clonedColors[3].a.c); //2
```

**在被解构的数组中，不定元素必须为最后一个条目，在后面继续添加逗号会导致程序抛出错误**

## 混合解构

```javascript
let node = {
    type: 'Identifier',
    name: 'foo',
    loc: {
        start: {
            line: 1,
            column: 1,
        },
        end: {
            line: 1,
            column: 4,
        },
    },
    range: [0, 3],
};

let {
    loc: { start },
    range: [startIndex],
} = node;

console.log(start); //{line: 1, column: 1}
console.log(startIndex); //0
```

## 解构参数

解构可以用在函数参数的传递过程中，这种使用方式更特别。当定义一个接受大量可选参数的`JavaScript`函数时，我们通常会创建一个可选对象，将额外的参数定义为这个对象的属性：

```javascript
//options的属性表示其他参数

function setCookie(name, value, options) {
    options = options || {};

    let secure = options.secure,
        path = options.path,
        domain = options.domain,
        expires = options.expires;

    //设置cookie的代码
}

//第三个参数映射到options中
setCookie('type', 'js', {
    secure: true,
    expires: 60000,
});
```

许多`JavaScript`库中都有类似的`setCookie()`函数，而在示例函数中，`name` 和`value`是必选参数，而`secure`、`path`、`domain`和`expires`则不然，这些参数相对而言没有优先级顺序，将它们列为额外的命名参数也不合适，此时为`options`对象设置同名的命名属性是一个很好的选择。现在的问题是，仅查看函数的声明部分，无法辨识函数的预期参数，必须通过阅读函数体才可以确定所有参数的情况。

如果将`options`定义为解构参数，则可以更清晰地了解函数预期传入的参数。解构函数需要使用对象或数组解构模式代替命名参数，请看这个重写的`setCookie()`函数：

```javascript
function setCookie(name, value, { secure, path, domain, expires }) {
    //设置setCookie的代码
}

setCookie('type', 'js', {
    secure: true,
    expires: 60000,
});
```

这个函数与之前示例中的函数具有相似的特性，只是现在使用解构语法代替了第 3 个参数来提取必要的信息，其他参数保持不变，但是对于调用`setCookie()`函数的使用者而言，解构参数变得更清晰了。

### 必须传值的解构参数

解构参数有一个奇怪的地方，默认情况下，如果调用函数时不提供被解构的参数会导致程序抛出错误。举个例子，调用上一个例子中的`setCookie()`函数，如果不传递第 3 个参数，会报错：

```javascript
//程序报错！
setCookie('type', 'js');
```

缺失的第 3 个参数，其值为 undefined,而解构参数只是将解构声明应用在函数参数的一个简写方法，其会导致程序抛出错误。当调用`setCookie()`函数时，`JavaScript`引擎实际上做了这些事情：

```javascript
function setCookie(name, value, options) {
    let { secure, path, domain, expires } = options;

    //设置cookie的代码
}
```

如果解构赋值表达式的右值为`null`或`undefined`，则程序会报错，同理，若调用`setCookie()`函数时不传入第 3 个参数，也会导致程序抛出错误。

### 解构参数的默认值

可以为解构参数指定默认值，就像在解构赋值语句中做的那样，只需在参数后添加等号并且指定一个默认值即可：

```javascript
function setCookie(
    name,
    value,
    {
        secure = true,
        path = '/',
        domain = 'example.com',
        expires = new Date(Date.now() + 36000000),
    },
) {
    console.log(secure, path, domain, expires);
}

setCookie('type', 'js', {}); //true "/" "example.com" Tue Jun 30 2020 17:34:50 GMT+0800 (中国标准时间)
```
