# 用模块封装代码

`JavaScript`用”共享一切“的方法夹在加载代码，这是该语言最容易出错且容易令人感到困惑的地方。其他语言使用诸如包这样的概念来定义代码作用域，但在`ECMAScript 6`以前，在应用程序的每一个`JavaScript`中定义的一切都共享一个全局作用域。随着`Web`应用程序变得更加复杂，`JavaScript`代码的使用量也开始增长，这一做法会引起问题，如命名冲突和安全问题。`ECMAScript 6`的一个目标是解决作用域问题，也为了使`JavaScript`应用程序显得有序，于是引进了模块。

## 什么是模块

**模块**是自动运行在**严格模式下**并且没有办法退出运行的`JavaScript`代码。与共享一切架构相反的是，在模块顶部创建的变量不会自动添加到全局共享作用域，这个变量仅在模块的顶级作用域存在，而且模块必须导出一些外部代码可以访问的元素，如变量或函数。模块也可以从其他模块导入绑定。

另外两个模块的特性与作用域关系不大，但也很重要。首先，在模块的顶部，`this`的值是`undefined`;其次，模块不支持`HTML`风格的代码注视，这是从早起浏览器残余下来的`JavaScript`特性。

**脚本**,也就是任何不提供模块的`JavaScript`代码，则缺少这些特性。模块和其他`JavaScript`代码之间的差异咋一看不起眼，但是他们代表了`JavaScript`代码加载和求值的一个重要变化。模块真正的魔力所在是仅导出和导入你需要的绑定，而不是将所用东西都放到一个文件。只有很好地理解了导出和导入才能理解模块与脚本的区别。

## 导出的基本语法

可以用`export`关键字将一部分已发布的代码暴露给其他模块，在最简单的用例中，可以将`export`放在任何变量、函数或类声明的前面，以将他它们从模块导出，像这样：

```javascript
//导出数据

export var color = "red";
export let name = "Nicholas";
export const magicNumber = 7;

//导出函数
export function sum(num1, num2) {
    return num1 + num2;
}

//导出类
export class Rectangle {
    constructor(length, width) {
        this.length = length;
        this.width = width;
    }
}

//这个函数是模块私有的
function subtract(num1, num2) {
    return num1 - num2;
}

//定义一个函数...
function multiply(num1, num2) {
    return num1 * num2;
}

//...之后将它导出
export multiply;
```

在这个示例中需要注意几个细节，除了`export`关键字外，每一个声明与脚本中的一摸一样。因为导出的函数和类声明需要有一个名称，所以代码中的每一个函数或类也确实有这个名称。除非用`default`关键字，否则不能用这个语法导出匿名或类(随后在"模块的默认值"一节中会详细讨论)。

另外，我们看`multiply()`函数，在定义它时没有马上导出它。由于不必要总是导出声明，可以导出引用，因此这段代码可以运行。此外，请注意，这个示例并未导出`subtract()`函数，任何未显式导出的变量、函数或类都是模块私有的，无法从模块外部访问。

## 导入的基本语法

从模块中导出的功能可以通过`import`关键字在另一个模块中访问,`import`语句的两个部分分别是：要导入的标识符和标识符应当从那个模块导入。这是该语法的基本形式：

```javascript
import { identifier1, indetifier2 } from './example.js';
```

`import`后面的大括号表示从给定模块导入的绑定（binding），关键字`from`表示从哪个模块导入给定的绑定，该模块由表示模块路径的字符串指定（被称做模块说明符）。浏览器使用的路径格式与传给`<script>`元素的相同，也就是说，必须把文件扩展名也加上。另一方面，`Node.js`则遵循基于文件系统前缀区分本地文件和包的惯例。例如,`example`是一个包，而`./example.js`是一个本地文件。

**导入绑定的列表看起来与解构对象很相似，但它不是**

当从模块中导入一个绑定时，它就好像使用`const`定义的一样。结果是你无法定义另一个同名变量（包括导入另一个同名绑定），也无法在`import`语句前使用标识符或改变绑定的值。

## 导入单个绑定

假设前面的示例在一个名为`"example.js"`的模块中，我们可以导入并以多种方式使用这个模块中的绑定。举例来说，可以只导入一个标识符：

```javascript
//只导入一个
import { sum } from './example.js';

console.log(sum(1, 2)); //3

sum = 1; //抛出一个错误
```

尽管`example.js`导出的函数不止一个，但这个示例导入的却只有`sum()`函数，如果尝试给`sum`赋新值，结果是抛出一个错误，因为不能给导入的绑定重新赋值。

**为了最好地兼容多个浏览器和`Node.js`环境，一定要在字符串之前包含`/`、`./`或`../`来表示要导入的文件，**

## 导入多个绑定

如果你想从示例模块导入多个绑定，则可以明确地将他们列出如下：

```javascript
//导入多个
import { sum, multiply, magicNumber } from './example.js';
console.log(sum(1, magicNumber)); //8
console.log(multiply(1, 2)); //3
```

在这段代码中，从`example`模块导入`3`个绑定：`sum`、`multiply`和`magicNumber`。之后使用它们，就像它们在本地定义的一样。

## 导入整个模块

特殊情况下，可以导入整个模块作为一个单一的对象，然后所有的导出都可以作为对象的属性使用。例如：

```javascript
//导入一切
import * as example from './example.js';
console.log(example.sum(1, example.magicNumber)); //8
console.log(example.multiply(1, 2)); //2
```

这段代码中，从`example.js`中导出的所有绑定被加载到一个被称作`example`的对象中。指定的导出（`sum()`函数、`mutiply()`函数和`magicNumber`）之后会作为`example`的属性被访问。这种导入格式被称作命名空间导入（`namespace import`）。因为`example.js`文件中不存在`example`对象，故而它作为`example.js`中所有导出成员的命名空间对象而被创建。但是，请记住，不管在`import`语句中把一个模块写了多少次，该模块将只执行一次。导入模块的代码执行后，实例化过的模块被保存在内存中，只要另一个`import`语句引用它就可以重复使用它。思考以下几点：

```javascript
import { sum } from './example.js';
import { multiply } from './example.js';
import { magicNumbet } from './example.js';
```

尽管在这个模块中有`3`个`import`语句，但`example.js`将只执行一次。如果同一个应用程序中的其他模块也从`example.js`导入绑定，那么那么模块与此代码将使用相同的模块示例。

**模块语法的限制**

`export`和`import`的一个重要的限制是，他们必须在其他语句和函数之外使用。例如，下面代码会给出一个语法错误：

```javascript
if (flag) {
    export flag; //语法错误
}
```

`export`语句不允许出现在`if`语句中，不能有条件导出或以任何方式动态导出。模块语法存在的一个原因是要让`JavaScript`引擎静态地确定哪些可以导出。因此，只能在模块顶部使用`export`。同样，不能在一条语句中使用`import`，只能在顶部使用它。下面这段代码也会给出语法错误：

```javascript
function tryImport() {
    import frag from './example.js'; //语法错误
}
```

由于同样的原因，不能动态地导入或导出绑定。`export`和`import`关键字被设计成静态的，因而像文本编辑器这样的工具可以轻松的识别模块中哪些信息是可用的。

## 导入绑定的一个微妙怪异之处

`ECMAScript 6`的`import`语句为变量、函数和类创建的是只读绑定，而不是像正常变量一样简单地引用原始绑定。标识符只有在被导出的模块中可以修改，即便是导入绑定的模块也无法更改绑定的值。例如：假设我们想使用这个模块：

```javascript
export var name = 'Nicholas';
export function setName(newName) {
    name = newName;
}
```

当导入这两个绑定后，`setName()`函数可以改变`name`的值：

```javascript
import { name, setName } from './example.js';

console.log(name); //"Nicholas"
setName('Greg');
console.log(name); //"Greg"

name = 'Nicholas'; //抛出错误
```

调用`setName("Greg")`时会回到导出`setName()`的模块中去执行，并将`name`设置为`"Greg"`。请注意，此更改会自动在导入的`name`绑定上体现。其原因是，`name`是导出的`name`标识符的本地名称。本段代码中所使用的`name`和模块中导入的`name`不是同一个。

## 导出和导入时重命名

有时候，从一个模块导入变量、函数或者类时，我们可能不希望使用它们的原始名称。幸运的是，可以造导出过程和导入过程中改变导出元素的名称。在第一中情况中，假设要使用不同的名称导出一个函数，则可以用`as`关键字来指定函数在模块外应该被成为称为什么名称。

```javascript
function sum(num1, num2) {
    return num1 + num2;
}

export { sum as add };
```

在这里，函数`sum()`是本地名称，`add()`是导出时使用的名称。也就是说，当另一个模块要导入这个函数时，必须使用`add`这个名称。

```javascript
import { add } from './example.js';
```

如果模块想使用不同的名称来导入函数，也可以使用`as`关键字：

```javascript
import { add as sum } from './example.js';
console.log(typeof add); //undefined
console.log(sum(1, 2)); //3
```

这段代码导入`add()`函数时使用了一个导入名称来重命名`sum()`函数（当前上下文中的本地名称）。导入时改变函数的本地名称意味着即使模块导入了`add()`函数，在当前模块中也没有`add()`标识符。

## 模块的默认值

由于在诸如`CommonJS`(浏览器外的另一个`JavaScript`使用规范)的其他模块系统中，从模块中导出和导入默认值是一个常见的做法，该语法被进行了优化。模块的默认值指的是通过`default`关键字指出的单个变量、函数或类，只能为每个模块设置一个默认的导出值，导出时多次使用`default`关键字是一个语法错误。

### 导出默认值

下面是一个使用`default`关键字的简单示例

```javascript
export default function (num1, num2) {
    return num1 + num2;
}
```

这个模块导出了一个函数作为它的默认值，`default`关键字表示这是一个默认的导出，由于函数被模块所代表，因而它不需要一个名称。

也可以在`export default`之后添加默认导出值的标识符，就像这样：

```javascript
function sum(num1, num2) {
    return num1 + num2;
}
export default sum;
```

先定义`sum()`函数，然后再将其导出为默认值，如果需要计算默认值，则可以使用这个方法。为默认导出值指定标识符的第三种方法是使用重命名语法，如下所示：

```javascript
function sum(num1, num2) {
    return num1 + num2;
}

export { sum as default };
```

### 导入默认值

可以使用以下语法从一个模块导入一个默认值

```javascript
//导入默认值
import sum from './example.js';

console.log(sum(1, 2)); //3
```

这条`import`语句从模块`example.js`中导入了默认值，请注意，这里没有使用大括号，与你见过的非默认导入的情况不同。本地名称`sum`用于表示模块导出的任何默认函数，这种语法是最纯净的，`ECMAScript 6`的创建者希望它能够成为`Web`上主流的模块导入形式，并且可以使用已有的对象。对于导出默认值和一或多个非默认绑定的模块，可以用一条语句导入所有导出的绑定。例如，假设有以下这个模块：

```javascript
export let color = 'red';

export default function (num1, num2) {
    return num1 + num2;
}
```

可以用以下这条`import`语句导入`color`和默认函数：

```javascript
import sum, { color } from './example.js';

console.log(sum(1, 2)); //3
console.log(color); //red
```

用逗号将默认的本地名称与大括号包裹的非默认值分隔开，请记住，在`import`语句中，默认值必须排在非默认值之前。与导出默认值一样，也可以在导入默认值时使用重命名语法：

```javascript
import { default as sum, color } from './example.js';
console.log(sum(1, 2)); //3
console.log(color); //red
```

在这段代码中，默认导出（export）值被重命名为`sum`,并且还导入了`color`。该示例与之前的示例相同。

## 重新导出一个绑定

最终，可能需要重新导出模块已经导入的内容。例如，你正在用几个小模块创建一个库，则可以用本章已经讨论的模式重新导出已经导入的值，如下所示：

```javascript
import { sum } from './example.js';

export { sum };
```

虽然这样可以运行，但只通过一条语句也可以完成同样的任务：

```javascript
export { sum } from './example.js';
```

这种形式的`export`在指定的模块中查找`sum`声明，然后将其导出。当然，对于同样的值你也可以不同的名称导出：

```javascript
export { sum as add } from './example.js';
```

这里的`sum`是从`example.js`导入的，然后再用`add`这个名字将其导出。如果想导出另一个模块中的所有值，则可以使用`*`模式：

```javascript
export * from './example.js';
```

导出一切是指导出默认值及所有命名导出值，这可能影响你可以从模块导出的内容。例如，如果`example.js`有默认的导出值，则使用此语法时将无法定义一个新的默认导出。

## 无绑定导入

某些模块可能不导出任何东西，相反，它们可能只修改全局作用域中的对象。尽管模块中的顶层变量、函数和类不会自动地出现在全局作用域中，但这并不意味着模块无法访问全局作用域。内建对象(如`Array`和`Object`)的共享定义可以在模块中访问，对这些对象所做的更改将反映在其他模块中。例如，要向所有数组添加`pushAll()`方法，则可以定义如下所示的模块：

```javascript
//没有export或import的模块代码
Array.prototype.pushAll = function (items) {
    //items必须是一个数组
    if (Array.isArray(items)) {
        throw new Error('参数必须是一个数组。');
    }

    //使用内建的`push()`和展开运算符
    return this.push(...items);
};
```

即使没有任何导出或导入的操作，这也是一个有效的模块。这段代码既可以用作模块也可以用作脚本。由于它不导出任何东西，因而你可以使用简化的导入操作来执行模块代码，而且不导入任何的绑定：

```javascript
import './example.js';

let colors = ['red', 'green', 'blue'];
let items = [];
item.pushAll(colors);
```

这段代码导入并执行了模块中包含的`pushAll()`方法，所以`pushAll()`被添加到数组的原型，也就是说现在模块中的所有数组都可以使用`pushAll()`方法了。

**无绑定导入最有可能被应用于创建`Polyfill`和`Shim`**

## 加载模块

虽然`ECMAScript 6`定义了模块的语法，但它并没有定义如何加载这些模块。这正式规范复杂性的一个体现，应由不同的实现环境来决定。`ECMAScript 6`没有尝试为所有`JavaScript`环境创建一套统一的标准，它只规定了语法，并将加载机制抽象到一个未定义的内部方法`HostResolveImportedModule`中。`Web`浏览器和`Node.js`开发者可以通过对各自环境的认知决定如何实现`HostResolveImportedModule`。

### 在 Web 浏览器中使用模块

即使在`ECMAScript 6`出现以前，`Web`浏览器也有多种方式可以将`JavaScript`包含在`Web`应用程序中，这些脚本加载的方法分别是：

-   在`<script>`元素中通过`src`属性指定一个加载代码的地址来加载`JavaScript`代码文件。
-   将`JavaScript`代码内嵌到没有`src`属性的`<script>`元素中。
-   通过`Web Worker`或`Service Worker`的方法加载并执行`JavaScript`代码文件。

为了完全支持模块功能，`Web`浏览器必须更新这些机制。具体细节在`HTML`规范中有完整的说明，下面我们来总结一下。

### 在`<script>`中使用模块

`<script>`元素的默认行为是将`JavaScript`文件作为脚本加载，而非作为模块加载，当`type`属性缺失或包含一个`JavaScript`内容类型（如`"text/javascript"`）时就会发生这种情况。`<script>`元素可以执行内联代码或加载`src`中指定的文件，当`type`属性的值为`"module"`时支持加载模块。将`type`设置为`"module"`可以让浏览器将所有内联代码或包含在`src`指定的文件中的代码按照模块而非脚本的方式加载。这里有一个简单的示例：

```html
<!-- 加载一个JavaScript模块文件 -->
<script type="module" src="module.js"></script>

<!-- 内联引入一个模块 -->
<script type="module">
    import { sum } from './example.js';

    let result = sum(1, 2);
</script>
```

此示例中第一个`<script>`元素使用`src`属性加载了一个外部的模块文件，它与加载脚本之间的唯一区别是`type`的值是`"module"`。第二个`<script>`元素包含了直接嵌入到网页中的模块。变量`result`没有暴露到全局作用域，它只存在于模块中（由`<script>元素定义`）,因此不会被添加到`window`作为它的属性。如你所见，在`Web`页面中引入模块的过程类似于引入脚本，相当简单。但是，模块实际的加载过程却有一些不同。

**你可能注意到，`"module"`与`"text/javascript"`这样的内容类型并不相同。`JavaS cript`模块文件与`JavaScript`脚本文件具有相同的内容类型，因此无法仅根据内容进行区分。此外，当无法识别`type`的值时，浏览器会忽略`<scripr>`元素，因此不支持模块的浏览器将自动忽略`<script type="module">`来提供良好的向后兼容性。**

### Web 浏览器中的模块加载顺序

模块与脚本不同，它是独一无二的，可以通过`import`关键字指明其所依赖的所有文件，并且这些文件必须被加载该模块才能正确执行。为了支持该功能，`<script type="module">`执行时自动应用`defer`属性。

加载脚本文件时，`defer`是可选属性；加载模块时，它就是必需属性。一旦`HTML`解析器遇到具有`src`属性的`<script type="module">`，模块文件便开始下载，直到文件被完全解析模块才会执行。模块按照它们出现在`HTML`文件中的顺序执行，也就是说，无论模块中包含的是内联代码还是指定`src`属性，第一个`<script type="module">`总是在第二个之前执行。例如：

```html
<!-- 先执行这个标签 -->
<script type="module" src="module1.js"></script>

<!-- 再执行这个标签 -->
<script type="module">
    import { sum } from './example.js';

    let result = sum(1, 2);
</script>

<!-- 最后执行这个标签 -->
<script type="module" src="module2.js"></script>
```

这 3 个`<script>`元素按照它们被指定的顺序执行，所以模块`module1.js`保证会在内联模块前执行，而内联模块保证会在`module2.js`模块之前执行。

每个模块都可以从一个或多个其他的模块导入，这会使问题复杂化。因此，首先解析模块以识别所有导入语句；然后，每个导入语句都会触发一次获取过程。（从网络或从缓存），并且在所有导入资源都被加载和执行后才会执行当前模块。用`<script type="module">`显式引入和用`import`隐式导入的所有模块都是按需加载并执行的。在这个示例中，完整的加载顺序如下：

1. 下载并解析`module.js`
2. 递归下载并解析`module.js`中导入的资源
3. 解析内联模块。
4. 递归下载并解析内联模块中导入的资源
5. 下载并解析`module2.js`
6. 递归下载并解析`module2.js`中导入的资源。

加载完成后，只要当文档完全被解析之后才会执行其他操作。文档解析完成后，会发生如下操作：

1. 递归执行`module.js`中导入的资源。
2. 执行`module.js`
3. 递归执行内联模块中导入的资源
4. 执行内联模块。
5. 递归执行`module2.js`中导入的资源
6. 执行`module2.js`

请注意，内联模块与其他两个模块唯一的不同是,它不必先下载模块代码。否则，加载导入资源和执行模块的顺序就是一样的。

**`<script type="module">`元素会忽略`defer`属性,因为它执行时`defer`属性默认是存在的。**

### Web 浏览器中的异步模块加载

你可能熟悉`<script>`元素上的`async`属性。当其应用于脚本时，脚本文件将在文件完全下载并解析后执行。但是，文档中`async`脚本的顺序不会影响脚本执行的顺序，脚本在下载完成后立即执行，而不必等待包含的文档完成解析。 `async`属性也可以应用在模块上，在`<script type="module">`元素上应用`async`属性会让模块以类似于脚本的方式执行，唯一的区别是，在模块执行前，模块中所有的导入资源必须下载下来。这可以确保只有当前模块执行所需的所有资源都下载完成后才执行模块，但不能保证的是模块的执行时机。请考虑以下代码：

```html
<!-- 无法保证这两个哪个先执行 -->
<script type="module" async src="module1.js"></script>
<script type="module" async src="module2.js"></script>
```

在这个示例中，两个模块文件被异步加载。只是简单地看这个代码判断不出哪个模块先执行，如果`module1.js`首先完成下载（包括其所有的导入资源），它将先执行；如果`module2.js`首先完成下载，那么它将先执行。

### 将模块作为 Woker 加载

`Worker`，例如`Web Worker`和`Service Woker`,可以在网页上下文之外执行`JavaScript`代码。创建新`Worker`的步骤包括：创建一个新的`Worker`实例（或其他的类）。传入的`JavaScript`文件的地址。默认的加载机制是按照脚本的方式加载文件，如下所示：

```javascript
//按照脚本的方式加载script.js
let worker = new Worker('script.js');
```

为了支持加载模块，`HTML`标准的开发者向这些构造函数添加了第二个参数，第二个参数是一个对象，其`type`属性的默认值为`"script"`。可以将`type`设置为`"module"`来加载模块文件：

```javascript
//按照模块的方式加载script.js
let worker = new Worker('module.js', { type: 'module' });
```

在此示例中，给第二个参数传入一个对象，其`type`属性的值为`"module"`,即按照模块而不是脚本的方式加载`module.js`（这里的`type`属性是为了模仿`<script>`标签的`type`属性，用以区分模块和脚本。）所有浏览器中的`Worker`类型都支持第二个参数。

`Worker`模块通常与`Worker`脚本一起使用，但也有一些例外。首先，`Worker`脚本只能从与引用的网页相同的源加载，但是`Worker`模块不会完全受限，虽然`Worker`模块具有相同的默认限制，但它们还是可以加载并访问具有适当的跨域资源共享(CROS)头的文件；其次，尽管`Worker`模块却始终无法通过`self.importScripts()`加载资源，因为应该使用`import`来导入。

## 浏览器模块说明符解析

本章之前的所有示例，模块说明符(module specifier)使用的都是相对路径（例如，字符串"./example.js"），浏览器要求模块说明符具有以下几种格式之一：

-   以`/`开头的解析为从根目录开始
-   以`./`开头的解析为从当前目录开始
-   以`../`开头的解析为从父目录开开始
-   `URL`格式例如，假设有一个模块文件位于`https://www.example.com/modules/module.js`,其中包含以下代码：

```javascript
//从https://www.example.com/modules/example1.js导入
import { first } from './example1.js';

//从https://www.example.com/module2.js导入
import { second } from '../example2.js';

//从https://www.example.com/module3.js导入
import { third } from 'example.js';

//从https://www2.example.com/example4.js导入
import { fourth } from 'https://www2.example.com/example4.js';
```

此示例中的每个模块说明符都适用于浏览器，包括最后一行中那个完整的`URL`。（为了支持跨域加载，只需确保`https://www2.example.com`的 CORS 头的配置是正确的。）尽管尚未完成的模块加载器规范将提供解析其他格式的方法，但目前，这些是浏览器默认情况下唯一可以解析的模块说明符的格式。

故此，一些看起来正常的模块说明符在浏览器中实际上是无效的，并且会导致错误，例如：

```javascript
//无效的，没有以 /、./或../开头
import { first } from 'example.js';

//无效的，没有以/、 ./或../开头
import { second } from 'example/index.js';
```

由于这两个模块说明符的格式不正确（缺少正确的起始字符），因此它们无法被浏览器加载，即使在`<script>`标签中用作`src`的值时二者都可以正常工作。`<script>`标签和`import`之间的这种行为差异是有意为之。
