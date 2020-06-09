# 字符串和正则表达式

## 更好Unicode支持

在ECMASCRIPT6出现以前，JavaScript字符串一直基于16位字符编码（UTF-16）进行构建。每16位的序列是一个编码单元（code unit），代表一个字符。`length`、`chartAt()`等字符串属性和方法都是基于这种编码单元构造的。


### UTF-16码位

```javascript
let text = "𠮷";

console.log(text.length); //2
console.log(/^.$/.test(text)); //false
console.log(text.charAt(0)); //�
console.log(text.charAt(1)); //�
console.log(text.charCodeAt(0)); //55362
console.log(text.codePointAt(1)); //57271
```

### codePointAt()方法

```javascript
let text = "𠮷a";

console.log(text.charCodeAt(0)); //55362
console.log(text.charCodeAt(1)); //57271
console.log(text.charCodeAt(2)); //97

console.log(text.codePointAt(0)); //134071
console.log(text.codePointAt(1)); //57271
console.log(text.codePointAt(2)); //97
```

要检测一个字符占用的编码单元数量，最简单的方法是调用字符的codePointAt()方法，可以写这样一个函数来检测：

```javascript
function is32Bit(c) {
    return c.codePointAt(0) > 0xFFFF;
}

console.log(is32Bit("𠮷")); //true
console.log(is32Bit("a")); //false
```

### String.fromCodePoint()方法

```javascript
console.log(String.fromCodePoint(134071)); //𠮷
```

### normalize()方法

...省略

如果你之前从未担心过Unicode标准化的问题，那么现在可能也就不会过多使用这个方法。但如果你曾经开发过一款国际化的应用，那么normalize()方法就有用得多了。

## 正则表达式u修饰符

#### u修饰符实例

```javascript
let text = "𠮷";

console.log(text.length); //2
console.log(/^.$/.test(text)); //false
console.log(/^.$/u.test(text)); //true
```

#### 计算码位数量

```javascript
function codePointLength(text) {
    let result = text.match(/[\s\S]/gu);
    return result ? result.length : 0
}

console.log(codePointLength("abc")); //3
console.log(codePointLength("𠮷bc")); //3
```

#### 检测u修饰符支持

```javascript
function hasRegExpU() {
    try {
        var pattern = new RegExp(".", "u");
        return true;
    } catch(ex) {
        return false;
    }
}
```

## 其他字符串变更

### 字符串中的字串识别

- `inclues()`方法，如果在字符串中检测到指定文本则返回`true`，否则返回`false`。
- `startsWith()`方法,如果在字符串的起始部分检测到指定问本则返回`true`，否则返回`false`。
- `endWith()`方法，如果在字符串的结束部分检测到指定文本则返回`true`，否则返回`false`。

```javascript
let msg = "Hello world!";

console.log(msg.startsWith("Hello")); //true
console.log(msg.endsWith("!")); //true
console.log(msg.includes("o")); //true

console.log(msg.startsWith("o")); //false
console.log(msg.endsWith("world!")); //true
console.log(msg.includes("x")); //false

console.log(msg.startsWith("o", 4)); //true
console.log(msg.endsWith("o", 8)); //true
console.log(msg.includes("o", 8)); //false
```

> 对于`startsWith()`、`endsWith()`、及`includes()`这三个方法，如果你没有按照要求传入一个字符串，而是传入一个正则表达式，则会触发一个错误产生；而对与`indexOf()`和`lastIndexOf()`这两个方法，它们都会把传入的正则表达式转化为一个字符串并搜索它。

### repeat()方法

```javascript
console.log("x".repeat(3)); //xxx
console.log("hello".repeat(2)); //hellohello
console.log("abc".repeat(4)); //abcabcabcabc
```

**这个方法比之前提及的所有方法都简单，其在操作文本时非常有用，比如在代码格式化工具中创建缩进级别，就像这样**

```javascript
//缩进指定数量的空格
let indent = " ".repeat(4);

console.log(indent.length);
```

## 其他正则表达式语法变更

### 正则表达式y修饰符

```javascript
let text = "hello1 hello2 hello3",
    pattern = /hello\d\s?/,
    result = pattern.exec(text),
    globalPattern = /hello\d\s?/g,
    globalResult = globalPattern.exec(text),
    stickyPattern = /hello\d\s?/y,
    stickyResult = stickyPattern.exec(text);

console.log(result[0]); //hello1 
console.log(globalResult[0]); //hello1 
console.log(stickyResult[0]); //hello1 

pattern.lastIndex = 1;
globalPattern.lastIndex = 1;
stickyPattern.lastIndex = 1;

result = pattern.exec(text);
globalResult = globalPattern.exec(text);
stickyResult = stickyPattern.exec(text);

console.log(result[0]); //hello1 
console.log(globalResult[0]); //hello2 
console.log(stickyResult[0]); //抛出错误
```

```javascript
let text = "hello1 hello2 hello3",
    pattern = /hello\d\s?/,
    result = pattern.exec(text),
    globalPattern = /hello\d\s?/g,
    globalResult = globalPattern.exec(text),
    stickyPattern = /hello\d\s?/y,
    stickyResult = stickyPattern.exec(text);

console.log(result[0]); //hello1 
console.log(globalResult[0]); //hello1 
console.log(stickyResult[0]); //hello1 

console.log(pattern.lastIndex); //0
console.log(globalPattern.lastIndex); //7
console.log(stickyPattern.lastIndex); //7

result = pattern.exec(text);
globalResult = globalPattern.exec(text);
stickyResult = stickyPattern.exec(text);

console.log(result[0]); //hello1 
console.log(globalResult[0]); //hello2 
console.log(stickyResult[0]); //hello2 

console.log(pattern.lastIndex); //0
console.log(globalPattern.lastIndex); //14
console.log(stickyPattern.lastIndex); //14
```

若要检测y修饰符是否存在，与检测其他正则表达式修饰符类似，可以通过属性名来检测。此时此刻，应该检查sticky属性，就像这样：

```javascript
let pattern = /hello\d/y;
console.log(pattern.sticky); //true
```

y修饰符与u修饰符类似，它也是一个新增的语法变更，所以在老式的JavaScript引擎中使用会触发错误。可以使用以下方法来检测引擎对他的支持程度：

```javascript
function hasRegExpY() {
    try {
        var pattern = new RegExp(".", "y");
        return true;
    } catch (ex) {
        return false;        
    }
}
```

### 正则表达式的复制

```javascript
var re1 = /ab/i,
    re2 = new RegExp(re1);
```
此处的变量re2只是变量re1的一份拷贝，但如果给RegExp构造函数提供第二个参数，为正则表达式指定一个修饰符，则代码无法运行，请看这个这个例子

```javascript
var re1 = /ab/i,

    //在ES5中抛出错误，在ES6中正常执行
    re2 = new RegExp(re1, "g");
```

如果在ECMASCRIPT5环境中执行这段代码会抛出一个错误：当第一个参数为正则表达式时不可以使用第二个参数。ECMASCRIPT6中修改了这个行为，即使第一个参数为正则表达式，也可以通过第二个参数修改其修饰符。

```javascript
var re1 = /ab/i,
    re2 = new RegExp(re1, "g")

console.log(re1.toString()); // /ab/i
console.log(re2.toString()); // /ab/g
console.log(re1.test("ab")); //true
console.log(re2.test("ab")); //true
console.log(re1.test("AB")); //true
console.log(re2.test("AB")); //false
```

### flags属性

为了配合新加入的修饰符，`ECMASCRIPT6`还新增了一个与之相关的新属性。在`ECMASCRIPT5`中，你可能通过source属性获取正则表达式的文本，但如果要获取使用的修饰符，就需要使用如下代码格式化`toString()`方法输出的文本：

```javascript
function getFlags(res) {
    var text = re.toString();
    return text.substring(text.lastIndexOf("/") + 1, text.length);
}

//toString() 的返回值为 "/ab/g"
var re = /ab/g;
console.log(getFlags(re)); //g
```

```javascript
let re = /ab/g;

console.log(re.source); //ab
console.log(re.flags); //g
```

## 模板字面量

### 基础语法

```javascript
let message = `Hello world!`;
console.log(message); //"Hello world"
console.log(typeof message); //string
console.log(message.length); //12
```

如果你想在字符串中使用反撇号，那么用反斜杠（\）将它转义就可以，请参考以下代码中的变量message：

```javascript
let message = `\`Hello\` world!`;
console.log(message); //`Hello` world!
console.log(typeof message); //string
console.log(message.length); //14
```

**而在模板字面量中，不需要转移单、双引号**

### 多行字符串

### 简化多行字符串

```javascript
let message = `Multiline
string`;

console.log(message);
//Multiline
//string

console.log(message.length); //16
```

在反撇号中的所有空白符都属于字符串的一部分，所以千万要小心缩进。举个例子：

```javascript
let message = `Multiline
        string`;

console.log(message);
//Multiline
//        string
console.log(message.length); //24
```

如果你一定要通过适当的缩进来对齐文本，则可以考虑在多行模板字面量的第一行留白，并在后面的几行中缩进，就像这样：

```javascript
let html = `
<div>
    <h1>Title</h1>
</div>`.trim();

console.log(html);
//<div>
//    <h1>Title</h1>
//</div>
```
在这段代码中，模板字面量的第一行没有任何文字，第二行才有内容。HTML标签缩进正确，且可以**通过调用`trim()`方法移除最初的空行**。

```javascript
let html = `
da   da  dada`.trim();

console.log(html);
//da   da  dada
```

### 字符串占位符

```javascript
let name = "Nicholas",
    message = `Hello, ${name}.`;
console.log(message); //Hello, Nicholas.
```

既然所有的占位符都是JavaScript表达式，就可以嵌入除变量外的其他内容，如运算式、函数调用，等等。就像这样：

```javascript
let count = 10,
    price = 0.25,
    message = `${count} items cost $${(count * price).toFixed(2)}.`;

console.log(message); //10 items cost $2.50.
```

模板字面量本身也是JavaScript表达式，所以你可以在一个模板字面量里嵌入另外一个，就像这样：

```javascript
let name = "Nicholas",
    message = `Hello, ${
        `my name is ${ name }`
    }.`;

console.log(message); //Hello, my name is Nicholas.
```

### 标签模板

标签指的是在模板字面量第一个反撇号（`）前方标注的字符串，就像这样：

```javascript
let message = tag`hello world`;
```
在这个示例中，应用于模板字面量`Hello world`的模板标签是tag。

#### 定义标签

```javascript
function passthru(literals, ...substitutions) {
    let result = "";

    //根据substitutions的数量来确定循环的执行次数
    for (let i = 0;i < substitutions.length;i++) {
        result += literals[i];
        result += substitutions[i];
    }

    //合并最后一个literal
    result += literals[literals.length - 1];

    return result;
}

let count = 10,
    price = 0.25,
    message = passthru`${count} items cost $${(count * price).toFixed(2)}`;

console.log(message); //10 items cost $2.50
```

这个示例定义了一个passthru标签，模拟模板字面量的默认行为，展示了一次转换过程。

数组`substitutions`里包含的值不一定是字符串，就像之前的示例一样，如果一个表达式求值后得到一个数值，那么传入的就是这个数值。至于这些值怎么在结果中输出，就是标签（Tag）的职责了。

#### 在模板字面量中使用原始值

```javascript
let message1 = `Multiline\nstring`,
    message2 = String.raw`Multiline\nstring`;

console.log(message1);
//Multiline
//string

console.log(message2); //Multiline\nstring
```

```javascript
function raw(literals, ...substitutions) {
    let result = "";

    //根据substitution的数量来确定循环的执行次数
    for (let i = 0;i < substitutions.length;i++) {
        result += literals.raw[i];
        result += substitutions.raw[i];
    }

    //合并最后一个literal
    result += literals.raw[literals.length - 1];

    return result;
}

let message = raw`Multiline\nstring`;

console.log(message); //Multiline\nstring
console.log(message.length); //17
```

原生字符串信息同样被传入模板标签，标签函数的第一个参数是一个数组，它有一个额外的属性raw，是一个包含每一个字面量的原生等价信息的数组。举个例子，`literals[0]`总有一个等价的`literals.raw[0]`,包含它的原生字符串信息。了解之后，可以使用以下代码模仿`String.raw()`