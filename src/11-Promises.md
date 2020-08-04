# Promise 与异步编程

`JavaScript`有很多强大的功能，其中一个是它可以轻松地搞定异步编程。作为一门为`Web`而生地语言，它从一开始就需要能够响应异步的用户交互，如点击和按键操作等。`Node.js`用回调函数代替了事件，使异步编程在`JavaScript`领域更加流行。但当更多程序开始使用异步编程时，事件和回调函数却不能满足开发者想要做地所有事情，它们还不够强大，而`Promise`就是这些问题地解决方案。

`Promise`可以实现其他语言中类似`Future`和`Deferred`一样的功能，是另一种异步编程的选择，它既可以像事件和回调函数一样指定稍后执行的代码，也可以明确指示代码是否成功执行。基于这些成功或失败的状态，为了让代码更容易理解和调试，你可以链式编写`Promise`。

本章将讨论`Promise`是如何运转的，然而，要完全理解它的原理，了解构建`Promise`的一些基本概念很重要。

## 异步编程的背景知识

`JavaScript` 引擎是基于单线程事件循环的概念构建的，同一时刻只允许一个代码块在执行，与之相反的是像`Java`和`C++`一样的语言，它们允许多个不同的代码块同时执行。对于基于线程的软件而言，当多个代码块同时访问并改变状态时，程序很难维护并保证状态不会出错。

`JavaScript`引擎同一时刻只能执行一个代码块，所以需要跟踪即将运行的代码，那些代码被放在一个任务队列中，每当一段代码准备执行时，都会被添加到任务队列。每当`JavaScript`引擎中的一段代码结束执行，事件循环会执行队列的下一个任务。请记住，队列中的任务会从第一个一直执行到最后一个。

### 事件模型

用户点击按钮或按下键盘上的按键会触发类似`onclick`这样的事件，他会向任务队列添加一个新任务来响应用户的操作，这是`JavaScript`中最基础的异步编程形式，直到事件触发时才执行事件处理程序，且执行时上下文与定义时的相同。例如：

```javascript
let button = document.getElementById('my-btn');
button.onclick = function () {
    console.log('Clicked');
};
```

在这段代码中，单机`button`后会执行`console.log("clicked")`，赋值给`onclick`的函数被添加到任务队列中，只有当前面的任务都完成后才会被执行。

事件模型适用于处理简单的交互，然而将多个独立的异步调用连接在一起会使程序更加复杂，因为你必须跟踪每个事件的事件目标（如此示例中的`button`）。此外，必须要保证事件处理程序之后才被触发。举个例子，如果先单击`button`再给`onclick`赋值，则任何事情都不会发生。所以，尽管事件模型适用于响应用户交互和完成类似的低频功能，但其对于更复杂的需求来说却不是很灵活。

### 回调模式

`Node.js`通过普及回调函数来改进异步编程模型，回调模式与事件模型类似，异步代码都会在未来的某个时间点执行，二者的区别是回调模式中被调用的函数是作为参数传入的，如下所示：

```javascript
readFile('example.txt', function (err, contents) {
    if (err) {
        throw err;
    }

    console.log(contents);
});

console.log('Hi!');
```

此示例使用`Node.js`传统的错误优先（error-first）回调风格。`readFile()`函数读取磁盘上的某个文件（指定为第一个参数），读取结束后执行回调函数（第二个参数）。如果以上出现错误，错误对象会被赋值给回调函数的`err`参数；如果一切正常，文件内容会以字符串的形式被赋值给`contents`参数。

由于使用了回调模式，`readFile()`函数立即开始执行，当读取磁盘上的文件时会暂停执行。也就是说，调用了`readFile()`函数后，`console.log("Hi")`语句立即执行并输出`"Hi"`;当`readFile()`结束执行时，会向任务队列的末尾添加一个新任务，该任务包含回调函数及相应的参数，当队列前面所有的任务完成后才执行该任务，并最终执行`console.log(contents)`输出所有内容。

回调模式比事件模型更灵活，因为相比之下，通过回调模式链接多个调用更容易。请看以下这个示例：

```javascript
readFile('example.txt', function (err, contents) {
    if (err) {
        throw err;
    }

    writeFile('example.txt', function (err) {
        if (err) {
            throw err;
        }

        console.log('File was written!');
    });
});
```

在这段代码中，成功调用了`readFile()`函数后会执行另一个`writeFile()`函数的异步调用，请注意，在这两个函数中是通过相同的基本模式来检查`err`是否存在。当`readFiile()`函数执行完成后，会向任务队列添加一个任务，如果没有错误产生，则执行`writeFile()`函数，然后当`writeFile()`函数执行结束后也向任务队列中添加一个任务。

虽然这个模式运行效果很不错，但很快你会发现由于嵌套了太多的回调函数，使自己陷入了回调地狱，就像这样：

```javascript
method1(function (err, result) {
    if (err) {
        throw err;
    }

    method2(function (err, result) {
        if (err) {
            throw err;
        }

        method3(function (err, result) {
            if (err) {
                throw err;
            }

            method4(function (err, result) {
                if (err) {
                    throw err;
                }
                method5(result);
            });
        });
    });
});
```

像示例中这样嵌套多个方法调用，会创建出一堆难以理解和调试的代码。如果你想实现更复杂的功能，回调函数的局限性同样也会显现出来，例如，并行执行两个异步操作，当两个操作都结束后通知你；或者同时进行两个异步操作，只取优先完成的操作结果。在这些情况下，你需要跟踪多个回调函数并清理这些操作，而`Promise`就能非常好地改进这些情况。

## Promise 的基础知识

`Promise`相当于异步操作结果的占位符，它不会去订阅一个事件，也不会传递一个回调函数给目标函数，而是让函数返回一个`Promise`,就像这样：

```javascript
//readFile承诺将在未来的某个时刻完成
let promise = readFile('example.txt');
```

在这段代码中，`readFile()`不会立即开始读取文件，函数会先返回一个表示异步读取操作的`Promise`对象，未来对这个对象的操作完全取决于`Promise`的生命周期。

### Promise 的生命周期

每个`Promise`都会经历一个短暂的生命周期：先是处于进行中（`pending`）的状态，此时操作尚未完成，所以它也是`未处理`（`unsettled`）的；一旦异步操作执行结束，`Promise`则变成`已处理`(`settled`)的状态。在之前的示例中，当`readFile()`函数返回`Promise`时它变为`pending`状态，操作结束后，`Promise`可能会进入到以下两个状态中的其中一个：

-   **Fulfilled** Promise 异步操作成功完成
-   **Rejected** 由于程序错误或一些其他原因，Promise 异步操作未能成功完成。

内部属性`[[PromiseState]]`被用来表示`Promise`的 3 种状态：`"pending"`、`"fulfilled"`、及`"rejected"`。这个属性不暴露在`Promise`对象上，所以不能以编程的方法检测`Promise`的状态。只有当`Promise`的状态改变时，通过`then`方法来采取特定的行动。

所以`Promise`都有`then()`方法，它接受两个参数；第一个是当`Promise`的状态变为`fulfilled`时要调用的函数，与异步操作相关的附加数据都会传递给这个完成函数（`fulfillment function`）;第二个是当`Promise`的状态变为`rejected`时要调用的函数，其与完成时调用的函数类似，所有与失败状态相关的附加数据都会传递给这个拒绝函数（`rejection function`）。

**如果一个对象实现了上述的`then()`方法，那这个对象我们称为`thenable`对象。所有的`Promise`都是`thenable`对象，但并非所有`thenable`对象都是`Promise`。**

`then()`的两个参数都是可选的，所以可以按照任意组合的方法来监听 `Promise`，执行完成或被拒绝都会被响应。例如，试想以下这组`then()`函数的调用。

```javascript
let promise = readFile('example.txt');

promise.then(
    function (contents) {
        //完成
        console.log(contents);
    },
    function (err) {
        //拒绝
        console.log(err.message);
    },
);

promise.then(function (contents) {
    //完成
    console.log(contents);
});

promise.then(null, function (err) {
    //拒绝
    console.log(err.message);
});
```

上面这 3 次`then()`调用操作的是同一个`Promise`。第一个同时监听了执行完成或执行被拒；第二个只监听了执行完成，错误时不报告；第三个只监听了执行被拒，成功时不报告。

`Promise`还有一个`catch()`方法，相当于只给其传入拒绝处理程序的`then()`方法。例如，下面这个`catch()`方法和`then()`方法实现的功能是等价的：

```javascript
promise.catch(function (err) {
    //拒绝
    console.log(err.message);
});

//与以下调用相同
promise.then(null, function (err) {
    //拒绝
    console.log(err.message);
});
```

`then()`方法和`catch()`方法一起使用才能更好处理异步操作结果。这套体系能够清楚地指明操作结果是成功还是失败，比事件和回调函数更好用。如果使用事件，在遇到错误时不会主动触发；如果使用回调函数，则必须要记得每次都检查错误参数。你要知道，如果不给`Promise`添加拒绝处理程序，那所有失败就自动被忽略了，所以一定要添加处理程序，即使只在函数内部记录失败的结果也行。

如果一个`Promise`处于已处理状态；在这之后添加到任务队列种地处理程序仍将执行。所以无论何时你都可以添加新地完成处理程序或拒绝处理程序，同时也可以保证这些处理程序能被调用。举个例子：

```javascript
let promise = readFile('example.txt');

//最初的完成处理程序
promise.then(function (contents) {
    console.log(contents);

    //现在又添加一个
    promise.then(function (contents) {
        console.log(contents);
    });
});
```

在这段代码中，一个完成处理程序被调用时向同一个`Promise`添加了另一个完成处理程序，此时这个`Promise`已经完成，所以新的处理程序会被添加到任务队列中，当前面的任务完成后其才被调用。这对拒绝处理程序也同样适用。

**每次调用`then()`方法或`catch()`方法都会创建一个新任务，当`Promise`被解决(`resolved`时执行。这些任务最终会被加入一个为`Promise`量身定制的独立队列中，这个任务队列的具体细节对于理解如何使用`Promise`而言不重要，通常你只要理解任务队列是如何运作的就可以了。)**

### 创建未完成的 Promise

用`Promise`构造函数可以创建新的`Promise`,构造函数只接受一个参数；包含初始化`Promise`代码的执行器（`executor`）函数。执行器接受两个参数，分别是`resolve()`函数和`reject()`函数。执行器成功完成时调用`resolve()`函数，反之，失败时调用`reject()`函数。

以下示例是在`Node.js`中用`Promise`实现我们在本章前面看到的`readFile()`函数：

```javascript
//Node.js示例

let fs = require('fs');

function readFile(filename) {
    return new Promise(function (resolve, reject) {
        //触发异步操作
        fs.readFile(filename, {
            encoding: 'utf8',
            function(err, contents) {
                //检查是否有错误
                if (err) {
                    reject(err);
                    return;
                }

                //成功读取文件
                resolve(contents);
            },
        });
    });
}

let promise = readFile('example.txt');

//同时监听执行完成和执行被拒
promise.then(
    function (contents) {
        //完成
        console.log(contents);
    },
    function (contents) {
        //拒绝
        console.error(err.message);
    },
);
```

在这个示例中，用`Promise`包裹了一个原生`Node.js`的`fs.readFile()`异步调用。如果失败，执行器向`reject()`函数传递错误对象；如果成功，执行器向`resolve()`函数传递文件内容。

要记住，`readFile()`方法被调用时执行器会立刻执行，在执行器中，无论是调用`resolve()`还是`reject()`，都会向任务队列中添加一个任务来解决这个`Promise`。如果你曾经使用过`setTimeout()`或`setInterval()`函数，你应该熟悉这种名为`任务编排`(job scheduling)的过程。当编排任务时，会向任务队列中添加一个新任务，并明确指定将任务延后执行。例如，使用`setTimeout()`函数可以指定将任务添加到队列前的延时。

```javascript
//在500ms后将这个函数添加到任务队列
setTimeout(function () {
    console.log('Timeout');
}, 500);
console.log('Hi!');
```

这段代码编排了一个`500ms`后才添加到任务队列的任务，两次`console.log()`调用分别输出以下内容：

```javascript
//Hi!
//Timeout
```

由于有`500ms`的延时，因而传入了`setTimeout()`的函数在`console.log("Hi!")`输出`"Hi"`之后才输出`"Timeout"`。

`Promise`具有类似的工作原理，`Promise`的执行器会立即执行，然后才执行后续流程中的代码，例如：

```javascript
let promise = new Promise(function (resolve, reject) {
    console.log('Promise');
    resolve();
});

console.log('Hi');

//Primise
//Hi!
```

调用`resolve()`后会触发一个异步操作。传入`then()`和`catch()`方法的函数会被添加到任务队列中并异步执行。请看这个示例：

```javascript
let promise = new Promise(function (resolve, reject) {
    console.log('Promise');
    resolve();
});

promise.then(function () {
    console.log('Resolved.');
});

console.log('Hi!');

//Promise
//Hi!
//Resolved.
```

请注意，即使在代码中`then()`调用位于`console.log("Hi!")`之前，但其与执行器不同，它并没有立即执行。这是因为，完成处理程序和拒绝处理程序总是在执行器完成后被添加到任务队列的末尾。

### 创建已处理的 Promise

创建未处理的`Promise`的最好方法是使用`Promise`的构造函数，这是由于`Promise`执行器具有动态性。但如果你想用`Promise`来表示一个已知值，则编排一个只是简单地给`resolve()`函数传值的任务并无实际意义，反倒是可以用一下两种方法根据特定的值来创建已解决`Promise`。

**使用 Promise.resolve()**

`Promise.resolve()`方法只接受一个参数并返回一个完成态的`Promise`,也就是说不会有任务编排的过程，并且需要向`Promise`添加一至多个完成处理程序来获取值。例如：

```javascript
let promise = Promise.resolve(42);

promise.then(function (value) {
    console.log(value);
});

//42
```

这段代码创建了一个已完成`Promise`,完成处理程序的形参`value`接受了传入值`42`,由于该`Promise`永远不会存在拒绝状态，因而该`Promise`的拒绝处理程序永远不会被调用。

**使用 Promise.reject()**

也可以通过`Promise.reject()`方法来创建已拒绝`Promise`,它与`Promise.resolve()`很像，唯一的区别是创建出来的的是拒绝态的`Promise`,例如：

```javascript
let promise = Promise.reject(42);

promise.catch(function (value) {
    console.log(value);
});

//42
```

任何附加到这个`Promise`的拒绝处理程序都将被调用，但却不会调用完成处理程序。

**如果向`Promise.resolve()`方法或`Promise.reject()`方法传入一个`Promise`,那么这个`Promise`会被直接返回。**

**非`Promise`的`Thenable`对象**

`Promise.resolve()`方法和`Promise.reject()`方法都可以接受非`Promise`的`Thenable`对象作为参数。如果传入一个非`Promise`的`Thenable`对象，则这些方法会创建一个新的`Promise`,并在`then()`函数中被调用。

拥有`then()`方法并且接受`resolve()`和`reject`这两个参数的普通对象就是非`Promise`的`Thenable`对象，例如：

```javascript
let thenable = {
    then: function (resolve, reject) {
        resolve(42);
    },
};
```

在此示例中，`Thenable`对象和`Promise`之间只有`then()`方法这一相似之处，可以调用`Promise.resolve()`方法将`Thenable`对象转换成一个已完成`Promise`：

```javascript
let thenable = {
    then: function (resolve, reject) {
        resolve(42);
    },
};

let p1 = Promise.resolve(thenable);
p1.then(function (value) {
    console.log(value); //42
});
```

在此示例中，`Promise.resolve()`调用的是`thenable.then()`,所以`Promise`的状态可以被检测到。由于是在`then()`方法内部调用了`resolve(42)`,因此`Thenable`对象的`Promise`状态是已完成。新创建的已完成状态`Promise p1`从`Thenable`对象接受传入的值（也就是 42），`p1`的完成处理程序将`42`赋值给形参`value`。

可以使用与`Promise.resolve()`相同的过程创建基于`thenable`对象的已拒绝`Promise`：

```javascript
let thenable = {
    then: function (resolve, reject) {
        reject(42);
    },
};

let p1 = Promise.resolve(thenable);
p1.catch(function (value) {
    console.log(value); //42
});
```

此示例与前一个相比，除了`Thenable`对象是已拒绝状态外，其余部分比较相似。执行`thenable.then()`时会用值`42`创建一个已拒绝状态的`Promise`,这个值随后会被传入`p1`的拒绝处理程序。

有了`Promise.resolve()`方法和`Promise.reject()`方法，我们可以更轻松地处理非`Promise`的`Thenable`对象。在`ECMAScript 6`引入了`Promise`对象之前，许多库都使用了`Thenable`对象，所以如果要向后兼容之前已有的库，则将`Thenable`对象转换为正式`Promise`的能力就显得至关重要了。如果不确定某个对象是不是`Promise`对象，那么可以根据预期的结果将其传入`Promise.resolve()`方法中或`Promise.reject()`方法中，如果它是`Promise`对象，则不会有任何变化。

### 执行器错误

如果执行器内部抛出一个错误，则`Promise`的拒绝处理程序就会被调用，例如：

```javascript
let promise = new Promise(function (resolve, reject) {
    throw new Error('Explosion!');
});

promise.catch(function (error) {
    console.log(error.message); //Explosion!
});
```

在这段代码中，执行器故意抛出了一个错误，每个执行器中都隐含了一个`try-catch`块，所以错误会被捕获并传入拒绝处理程序。此例等价于：

```javascript
let promise = new Promise(function (resolve, reject) {
    try {
        throw new Error('Explosion!');
    } catch (ex) {
        reject(ex);
    }
});

promise.catch(function (error) {
    console.log(error.message); //Explosion!
});
```

为了简化这种常见的用例，执行器会捕获所有抛出的错误，但只有当拒绝处理程序存在时才会记录执行器中抛出的错误，否则错误会被忽略掉。在早期的时候，开发人员使用`Promise`会遇到这种错误，后来，`JavaScript`环境提供了一些捕获已拒绝`Promise`的钩子函数来解决这些问题。

## 全局的 Promise 拒绝处理

有关`Promise`的其中一个最具有争议的问题是，如果在没有拒绝处理程序的情况下拒绝一个`Promise`，那么不会提示失败信息，这是`JavaScript`语言中唯一一处没有强制报错的地方，一些人认为这是标准中最大的缺陷。

`Promise`的特性决定了很难检测一个`Promise`是否被处理过，例如：

```javascript
let rejected = Promise.reject(42);

//此时，rejected还没有被处理

//过了一会儿

rejected.catch(function (value) {
    //现在rejected已经被处理了
    console.log(value); //42
});
```

任何时候都可以调用`then()`方法或`catch()`方法，无论`Promise`是否已解决这两个方法都可以正常运行，但这样就很难知道一个`Promise`何时被处理。在此示例中，`Promise`被立即拒绝，但是稍后才被处理。

尽管这个问题在未来版本的`ECMAScript`中可能会被解决，但是`Node.js`和浏览器环境都已分别做出了一些改变来解决开发者的这个痛点，这些改变不是`ECMAScript 6`标准的一部分，不过当你使用`Promise`的时候它们确实是非常有价值的工具。

### Node.js 环境的拒绝处理

在`Node.js`中，处理`Promise`拒绝时会触发`process`对象上的两个事件：

-   `unhandledRejection` 在一个事件循环中，当`Promise`对象被拒绝，并且没有提供拒绝处理程序时，触发该事件。

-   `rejectionHandled` 在一个事件循环后，当`Promise` 被拒绝时，若拒绝处理程序被调用，触发该事件。

设计这些事件是用来识别那些被拒绝却又没被处理过的`Promise`的。

拒绝原因（通常是一个错误对象）及被拒绝的`Promise`作为参数被传入`unhandledRejection`事件处理程序中，以下代码展示了`unhandledRejection`的实际应用：

```javascript
let rejected;

process.on('unhandledRejection', function (reason, promise) {
    console.log(reason.message); //"Explosion!"
    console.log(rejected === promise); //true
});

rejected = Promise.reject(new Error('Explosion!'));
```

这个示例创建了一个已拒绝`Promise`和一个错误对象，并监听了`unhandledRejection`事件，事件处理程序分别接受错误对象和`Promise`作为它的两个参数。

`rejectionHandled`事件处理程序只有一个参数，也就是被拒绝的`Promise`,例如：

```javascript
let rejected;

process.on('rejectionHandled', function (promise) {
    console.log(rejected === promise);
});

rejected = Promise.reject(new Error('Explosion!'));

//等待添加拒绝处理程序

setTimeout(function () {
    rejected.catch(function (value) {
        console.log(value.message);
    });
}, 1000);

//Explosion!
//true
```

这里的`rejectionHandled`事件在拒绝处理程序最后被调用时触发，如果在创建`rejected`之后直接添加拒绝处理程序，那么`rejectionHandled`事件不会被触发，因为`rejected`创建的过程与拒绝处理程序的调用在同一个事件循环中，此时`rejectionHandled`事件尚未生效。

通过事件`rejectionHandled`和事件`unhandledRejection`将潜在未处理的拒绝储存在一个列表，等待一段时间后检查列表便能正确地跟踪潜在的未处理拒绝。例如下面这个简单的未处理拒绝跟踪器。

```javascript
let possiblyUnhandledRejections = new Map();

//如果一个拒绝没被处理，则将它添加到Map集合中
process.on('unhandledRejection', function (reason, promise) {
    possiblyUnhandledRejections.set(promise, reason);
});

process.on('rejectionHandled', function (promise) {
    possiblyUnhandledRejections.delete(promise);
});

setInterval(() => {
    possiblyUnhandledRejections.forEach(function (reason, promise) {
        console.log(reason.message ? reason.message : reason);

        //做一些什么来处理这些拒绝
        handleRejection(promise, reason);
    });

    possiblyUnhandledRejections.clear();
}, 60000);
```

这段代码使用`Map`集合来存储`Promise`及其拒绝原因，每个`Promise`键都有一个拒绝原因的相关值。每当触发`unhandledRejection`事件时，会向`Map`集合中添加一组`Promise`及拒绝原因；每当触发`rejectedHandled`事件时，已处理的`Promise`会从`Map`集合中移除。结果是，`possiblyUnhandledRejections`会随着事件调用不断扩充或收缩。`setInterval()`调用会定期检查列表，将可能未处理的拒绝输出到控制台（实际上你会通过其他方法记录或者直接处理掉这个拒绝）。在这个示例中使用的是`Map`集合而不是`WeakMap`集合，这是因为你需要定期检查`Map`集合来确认一个`Promise`是否存在，而这是`WeakMap`无法实现的。

尽管这个示例是针对`Node.js`设计的，但是浏览器也实现了一套类似的机制来提示开发者哪些拒绝还没有被处理。

### 浏览器环境的拒绝处理

浏览器也是通过触发两个事件来识别未处理的拒绝的，虽然这些事件是在`window`对象上触发的，但实际上与`Node.js`中的完全等效。

-   `unhandledrejection` 在一个事件循环中，当`Promise`被拒绝，并且没有提供拒绝处理程序时，触发该事件。

-   `rejectionhandled` 在一个事件循环后，当`Promise`被拒绝时，若拒绝处理程序被调用，触发该事件。

在`Node.js`实现中，事件处理程序中接受多个独立参数；而在浏览器中，事件处理程序接受一个有以下属性的事件对象作为参数：

-   `type` 事件名称（"`unhandledrejection`"或"`rejectionhandled`"）
-   `promise` 被拒绝的`Promise`对象
-   `reason` 来自`Promise`的拒绝值

浏览器实现中的另一处不同是，在两个事件中都可以使用拒绝值（reason），例如：

```javascript
let rejected;

window.onunhandledrejection = function (event) {
    console.log(event.type); //unhandledrejection
    console.log(event.reason.message); //Explosion!
    console.log(rejected === event.promise); //true
};

window.onrejectionhandled = function (event) {
    console.log(event.type);
    console.log(event.reason.message);
    console.log(rejected === event.promise);
};

rejected = Promise.reject(new Error('Explosion!'));
```

这段代码用`DOM0`级记法的`onunhandledrejection`和`onrejectionhandled`给两个事件处理程序赋值，如果你愿意的话也可以使用`addEventListener("unhandledrejection")`和`addEventListener("rejectionhandled")`,每个事件处理程序接受一个含有被拒绝`Promise`信息的事件对象，该对象的属性`type`、`promise`和`reason`在这两个事件处理程序中均可使用。

在浏览器中，跟踪未处理拒绝的代码也与`Node.js`中的非常相似：

```javascript
let possiblyUnhandledRejections = new Map();

//如果一个拒绝没有被处理，则将它添加到Map集合中
window.onunhandledrejection = function (event) {
    possiblyUnhandledRejections.set(event.promise, event.reason);
};

window.onrejectionhandled = function (event) {
    possiblyUnhandledRejections.delete(event.promise);
};

setInterval(function () {
    possiblyUnhandledRejections.forEach(function (reason, promise) {
        console.log(reason.message ? reason.message : reason);
        //做一些什么来处理这些拒绝
        handleRejection(promise, reason);
    });
    possiblyUnhandledRejections.clear();
}, 60000);
```

浏览器中的实现与`Node.js`中的几乎完全相同，二者都是用同样的方法将`Promise`及其拒绝值存储在`Map`集合中，然后再进行检索。唯一的区别是，在事件处理程序中检索信息的位置不同。

处理`Promise`拒绝的过程可能很复杂，但我们才刚刚开始明白`Promise`到底有多强大。下面我们会更进一步地把几个`Promise`串联在一起使用。

## 串联 Promise

至此，看起来好像`Promise`只是将回调函数和`setTimeout()`函数结合起来，并在此基础上做了一些改进。但`Promise`所能实现地远超我们目之所及，尤其是很多将`Promise`串联起来实现更复杂地异步特性的方法。

每次调用`then()`方法或`catch()`时实际上创建并返回了另一个`Promise`，只有当第一个`Promise`完成或被拒绝后，第二个才会被解决。请看以下这个示例：

```javascript
let p1 = new Promise(function (resolve, reject) {
    resolve(42);
});

p1.then(function (value) {
    console.log(value);
}).then(function () {
    console.log('Finished');
});

//42
//Finished
```

调用`p1.then()`返回第二个`Promise`,紧接着又调用了它的`then()`方法，只有当第一个`Promise`被解决之后才会调用第二个`then()`方法的完成处理程序。如果将这个示例拆解开，看起来是这样的：

```javascript
let p1 = new Promise(function (resolve, reject) {
    resolve(42);
});

let p2 = p1.then(function (value) {
    console.log(value);
});

p2.then(function () {
    console.log('Finished');
});

//42
//"Finished"
```

在这个非串联版本的代码中，调用`p1.then()`的结果被储存在了`p2`中，然后`p2.then()`被调用来添加最终的完成处理程序。你可能已经猜到，调用`p2.then()`返回的也是一个`Promise`,只是在此示例中我们并未使用它。

### 捕获错误

在之前的示例中，完成处理程序或拒绝处理程序中可能发生错误，而`Promise`链可以用来捕获这些错误。例如：

```javascript
let p1 = new Promise(function (resolve, reject) {
    resolve(42);
});

p1.then(function (value) {
    throw new Error('Boom!');
}).catch(function (error) {
    console.log(error.message);
});

//Boom!
```

在这段代码中，`p1`的完成处理程序抛出了一个错误，链式调用第二个`Promise`的`catch()`方法后，可以通过它的拒绝处理程序接收这个错误。如果拒绝处理程序抛出错误，也可以通过相同的方式接收到这个错误：

```javascript
let p1 = new Promise(function (resolve, reject) {
    throw new Error('Explosion!');
});

p1.catch(function (error) {
    console.log(error.message);
    throw new Error('Boom!');
}).catch(function (error) {
    console.log(error.message);
});

//Explosion!
//Boom!
```

此处的执行期抛出错误并触发`Promise p1`的拒绝处理程序，这个处理程序又抛出另外一个错误，并且被第二个`Promise`的拒绝处理程序捕获。链式`Promise`调用可以感受到链中其他`Promise`的错误。

**务必在`Promise`链的末尾留有一个拒绝处理程序以确保能够正确处理所有可能发生的错误。**

### Promise 链的返回值

`Promise`链的另一个重要特性是可以给下游`Promise`传递数据，我们已经看到了从执行器`rosolve()`处理程序到`Promise`完成处理程序的数据传递过程。如果在完成处理程序中指定一个返回值，则可以沿着这条链继续传递数据。例如：

```javascript
let p1 = new Promise((resolve, reject) => {
    resolve(42);
});

p1.then(function (value) {
    console.log(value);
    return value + 1;
}).then(function (value) {
    console.log(value);
});

//42
//43
```

执行器传入的`value`为 42，`p1`的完成处理程序执行后返回`value+1`也就是 43。这个值随后被传给第二个`Promise`的完成处理程序并输出到控制台。

在拒绝处理程序中也可以做相同的事件，当它被调用时可以返回一个值，然后用这个值完成链条中后续的`Promise`,就像下面这个示例：

```javascript
let p1 = new Promise((resolve, reject) => {
    reject(42);
});

p1.catch(function (value) {
    //第一个完成处理程序
    console.log(value);
    return value + 1;
}).then(function (value) {
    //第二个完成处理程序
    console.log(value);
});

//42
//43
```

在这个示例中，执行器调用`reject()`方法向`Promise`的拒绝处理程序传入值`42`,最终返回`value+1`。拒绝处理程序中返回的值仍可用在下一个`Promise`的完成处理程序中，即使其中一个`Promise`失败也能恢复整条链的执行。

### 在 Promise 链中返回 Promise

在`Promise`间可以通过完成和拒绝程序中返回的原始值来传递数据，但如果返回的是对象呢？如果返回但是`Promise`对象，会通过一个额外的步骤来确定下一步怎么走。请看这个示例：

```javascript
let p1 = new Promise(function (resolve, reject) {
    resolve(42);
});

let p2 = new Promise(function (resolve, reject) {
    resolve(43);
});

p1.then(function (value) {
    //第一个完成处理程序
    console.log(value);
    return p2;
}).then(function (value) {
    //第二个完成处理程序
    console.log(value);
});

//42
//43
```

在这段代码中，`p1`的编排的任务解决并传入`42`,然后`p1`的完成处理程序返回一个已解决状态的`Promise p2`,由于`p2`已经被完成，因此第二个完成处理程序被调用；如果`p2`被拒绝，则调用拒绝处理程序。

关于这个模式，最需要注意的是，第二个完成处理程序被添加到了第三个`Promise`而不是`p2`,所以之前的示例等价于：

```javascript
let p1 = new Promise(function (resolve, reject) {
    resolve(42);
});

let p2 = new Promise(function (resolve, reject) {
    resolve(43);
});

let p3 = p1.then(function (value) {
    //第一个完成处理程序
    console.log(value);
    return p2;
});

p3.then(function (value) {
    //第二个完成处理程序
    console.log(value);
});

//42
//43
```

很明显的是，此处第二个完成处理程序被添加到`p3`而非`p2`,这个差异虽小但非常重要，如果`p2`被拒绝那么第二个完成处理程序将不会被调用，例如：

```javascript
let p1 = new Promise(function (resolve, reject) {
    resolve(42);
});

let p2 = new Promise(function (resolve, reject) {
    reject(43);
});

p1.then(function (value) {
    //第一个完成处理程序
    console.log(value);
    return p2;
}).then(function (value) {
    //第二个完成处理程序
    console.log(value); //从未调用
});

//42
//报错
```

在这个示例中，由于`p2`被拒绝了，因此完成处理程序永远不会被调用。不管怎样，我们还是可以添加一个拒绝处理程序：

```javascript
let p1 = new Promise(function (resolve, reject) {
    resolve(42);
});

let p2 = new Promise(function (resolve, reject) {
    reject(43);
});

p1.then(function (value) {
    //第一个完成处理程序
    console.log(value);
    return p2;
}).then(function (value) {
    //拒绝处理程序
    console.log(value);
});
```

`p2`被拒绝后，拒绝处理程序被调用并传入`p2`的拒绝值`43`。

在完成或拒绝处理程序中返回`Thenable`对象不会改变`Promise`执行器的执行时机，先定义的`Promise`的执行器先执行，后定义的后执行，以此类推。返回`Thenable`仅允许你为这些`Promise`结果定义额外的响应。在完成处理程序中创建新的`Promise`可以推迟完成处理程序的执行，例如：

```javascript
let p1 = new Promise(function (resolve, reject) {
    resolve(42);
});

p1.then(function (value) {
    console.log(value); //42
    //创建一个新的promise
    let p2 = new Promise(function (resolve, reject) {
        resolve(43);
    });
    return p2;
}).then(function (value) {
    console.log(value); //43
});
```

在此示例中，在`p1`的完成处理程序里创建了一个新的`Promise`,直到`p2`被完成才会执行第二个完成处理程序。如果你想在一个`Promise`被解决后触发另一个`Promise`,那么这个模式对你会很有帮助。

## 响应多个 Promise

到目前为止，本章中的每个示例展示的都是单`Promise`响应，而如果你想通过监听多个`Promise`来决定下一步的操作，则可以使用`ECMAScript 6`提供的`Promise.all()`和`Promise.race()`两个方法来监听多个`Promise`。

### Promise.all()方法

`Promise.all()`方法只接受一个参数并返回一个`Promise`,该参数是一个含有多个受监视`Promise`的可迭代对象（例如，一个数组），只有当可迭代对象中所有`Promise`都被解决后返回的`Promise`才会被解决，只有当可迭代对象中所有`Promise`都被完成后返回的`Promise`才会被完成，正如这个示例所示：

```javascript
let p1 = new Promise(function (resolve, reject) {
    resolve(42);
});

let p2 = new Promise(function (resolve, reject) {
    resolve(43);
});

let p3 = new Promise(function (resolve, reject) {
    resolve(44);
});

let p4 = Promise.all([p1, p2, p3]);

p4.then(function (value) {
    console.log(Array.isArray(value)); //true
    console.log(value[0]); //42
    console.log(value[1]); //43
    console.log(value[2]); //44
});
```

在这段代码中，每个`Promise`解决时都传入一个数字，调用`Promise.all()`方法创建`Promise p4`,最终当`Promise p1、p2`和`p3`都处于完成状态后`p4`才被完成。传入`p4`完成处理程序的结果是一个包含每个解决值（42、43 和 44）的数组，这些值按照传入参数数组中`Promise`的顺序存储，所以可以根据每个结果来匹配对应的`Promise`。

所有传入`Promise.all()`方法的`Promise`只要有一个被拒绝，那么返回的`Promise`没等所有的`Promise`都完成就立即被拒绝：

```javascript
let p1 = new Promise(function (resolve, reject) {
    resolve(42);
});

let p2 = new Promise(function (resolve, reject) {
    reject(43);
});

let p3 = new Promise(function (resolve, reject) {
    resolve(44);
});

let p4 = Promise.all([p1, p2, p3]);

p4.catch(function (value) {
    console.log(Array.isArray(value)); //false
    console.log(value); //43
});
```

在这个示例中，`p2`被拒绝并传入值`43`,没等`p1`或`p3`结束执行，`p4`的拒绝处理程序就立即被调用。（p1 和 p3 的执行过程会结束，只是`p4`并未等待。）

拒绝处理程序总是接受一个值而非数组，该值来自被拒绝`Promise`的拒绝值。在本示例中，传入拒绝处理程序的`43`表示该拒绝来自`p2`。

### Promise.race()方法

`Promise.race()`方法监听多个`Promise`的方法稍有不同：它也接受多个受监视`Promise`的可迭代对象作为唯一参数并返回一个`Promise`,但只要有一个`Promise`被解决返回`Promise`就被解决，无须等到所有`Promise`都被完成。一旦数组中的某个`Promise`被完成，`Promise.race()`方法也会像`Promise.all()`方法一样返回一个特定的`Promise`,例如：

```javascript
let p1 = Promise.resolve(42);

let p2 = new Promise(function (resolve, reject) {
    resolve(42);
});

let p3 = new Promise(function (resolve, reject) {
    resolve(43);
});

let p4 = Promise.race([p1, p2, p3]);

p4.then(function (value) {
    console.log(value); //42
});
```

在这段代码中，`p1`创建时便处于已完成状态，其他`Promise`用于编排状态。随后，`p4`的完成处理程序被调用并传入值`42`，其他`Promise`则被忽略。实际上，传给`Promise.race()`方法的`Promise`会进行竞选，以决出哪一个先被解决，如果先解决的是已完成`Promise`，则返回已完成`Promise`;如果先解决的是已拒绝`Promise`,则返回的是已拒绝`Promise`。这里是一段拒绝示例：

```javascript
let p1 = new Promise(function (resolve, reject) {
    setTimeout(function () {
        resolve(42);
    }, 0);
});

let p2 = Promise.reject(43);

let p3 = new Promise(function (resolve, reject) {
    resolve(44);
});

let p4 = Promise.race([p1, p2, p3]);

p4.catch(function (value) {
    console.log(value); //43
});
```

此时，由于`p2`已处于被拒绝状态，因而当`Promise.race()`方法被调用时`p4`也被拒绝了，尽管`p1`和`p3`最终被完成，但由于是发生在`p2`被拒后，因此它们的结果被忽略掉。

## 自 Promise 继承

`Promise`与其他内建类型一样，也可以作为基类派生其他类，所以你可以定义自己的`Promise`变量来扩展内建`Promise`的功能。例如，假设你想创建一个既支持`then()`方法和`catch()`方法又支持`success()`方法和`failure()`方法的`Promise`，则可以这样创建该`Promise`类型：

```javascript
class MyPromise extends Promise {
    //使用默认的构造函数
    success(resolve, reject) {
        return this.then(resolve, reject);
    }

    failure(reject) {
        return this.catch(reject);
    }
}

let promise = new MyPromise(function (resolve, reject) {
    resolve(42);
});

promise
    .success(function (value) {
        console.log(value); //42
    })
    .failure(function (value) {
        console.log(value);
    });
```

在这个示例中，派生自`Promise`的`MyPromise`扩展了另外两个方法：模仿`resolve()`的`success()`方法以及模仿`reject()`的`failure()`方法。

这两个新增方法都通过`this`来调用它模仿的方法，派生`Promise`与内建`Promise`的功能一样，只不过多了`success()`和`failure()`这两个可以调用的方法。

由于静态方法会被继承，因此派生的`Promise`也拥有`MyPromise.resolve()`、`MyPromise.reject()`、`MyPromise.race()`和`MyPromise.all()`这四个方法，后二者与内建方法完全一致，而前二者却稍有不同。

由于`MyPromise.resolve()`方法和`MyPromise.reject()`方法通过`Symbol.species`属性来决定返回`Promise`的类型，故调用这两个方法时无论传入什么值都会返回`Promise`的类型，故调用这两个方法时无论传入什么值都会返回一个`MyPromise`的实例。如果将内建`Promise`作为参数传入这两个方法，则这个`Promise`将被解决或拒绝，然后该方法将会返回一个新的`MyPromise`,于是就可以给它的成功处理程序及失败处理程序赋值。例如：

```javascript
class MyPromise extends Promise {
    //使用默认的构造函数
    success(resolve, reject) {
        return this.then(resolve, reject);
    }

    failure(reject) {
        return this.catch(reject);
    }
}

let p1 = new Promise(function (resolve, reject) {
    resolve(42);
});

let p2 = MyPromise.resolve(p1);

p2.success(function (value) {
    console.log(value);
});

console.log(p2 instanceof MyPromise);

//true
//42
```

这里的`p1`是一个内建`Promise`,被传入`MyPromise.resolve()`方法后得到结果`p2`,它是`MyPromise`的一个实例，来自`p1`的解决值传入完成处理程序。

传入`MyPromise.resolve()`方法或`MyPromise.reject()`方法的`MyPromise`实例未经解决便直接返回。在其他方面，这两个方法的行为与`Promise.resolve()`和`Promise.reject()`很像。

## 基于 Promise 的异步任务执行

在第 8 章中，我们介绍了生成器并展示了如何在异步任务执行中使用它，就像这样：

```javascript
let fs = require('fs');

function run(taskDef) {
    //创建可以在其他地方使用的迭代器
    let task = taskDef();

    //开始执行任务
    let result = task.next();

    //不断调用next()的递归函数
    function step() {
        //如果有更多任务要做
        if (!result.done) {
            if (typeof result.value === 'function') {
                result.value(function (err, data) {
                    if (err) {
                        result = task.throw(err);
                        return;
                    }

                    reuslt = task.next(data);
                    step();
                });
            } else {
                result = task.next(result.value);
                step();
            }
        }
    }

    //启用递归过程
    step();
}

//定义一个可用于任务执行器的函数

function readFile(filename) {
    return function (callback) {
        fs.readFile(filename, callback);
    };
}

//执行一个任务

run(function* () {
    let contents = yield readFile('config.json');
    doSomethigWith(contents);
    console.log('Done');
});
```

这个实现会导致一些问题。首先，在返回值是函数的函数中包裹每一个函数会令人感到困惑，这句话本身也是如此；其次，无法区分用作任务执行期回调函数的返回值和一个不是回调函数的返回值。

只要每次异步操作都返回`Promise`，就可以极大地简化并通用化这个过程。以`Promise`作为通用接口用于所有异步代码可以简化任务执行器。

```javascript
let fs = require('fs');

function run(taskDef) {
    //创建迭代器
    let task = taskDef();

    //开始执行任务
    let result = task.next();

    //递归函数遍历
    (function step() {
        //如果有更多任务要做
        if (!result.done) {
            //用一个Promise来解决会简化问题
            let promise = Promise.resolve(result.value);
            promise
                .then(function (value) {
                    result = task.next(value);
                    step();
                })
                .catch(function (error) {
                    result = task.throw(error);
                    step();
                });
        }
    })();
}

//定义一个可用于任务执行器的函数
function readFile(filename) {
    return new Promise(function (resolve, reject) {
        fs.readFile(filename, function (err, contents) {
            if (err) {
                reject(err);
            } else {
                resolve(contents);
            }
        });
    });
}

//执行一个任务
run(function* () {
    let contents = yield readFile('config.json');
    doSomethingWith(contents);
    console.log('Done');
});
```

在这个版本的代码中，一个通用的`run()`函数执行生成器创建了一个迭代器，它调用`task.next()`方法来启动任务并递归调用`step()`方法直到迭代器完成。

在`step()`函数中，如果有更多任务，那么`result.done`的值为`false`,此时的`result.value`应该是一个`Promise`,调用`Promise.resolve()`是为了防止函数不返回`Promise`。（记住，传入`Promise.resolve()`的`Promise`直接通过，传入的非`Promise`会被包裹成一个`Promise`。）接下来，添加完成处理程序提取`Promise`的值并将其传回迭代器。然后在`step()`函数调用自身之前结果会被赋值给下一个生成的结果。

拒绝处理程序将所有拒绝结果存储到一个错误对象中，然后通过`task.throw()`方法将错误对象传回迭代器，如果在任务中捕获到错误，结果会被赋值给下一个生成结果。最后继续在`catch()`内部调用`step()`函数。

这个`run()`函数可以运行所有使用`yield`实现异步代码的生成器，而且不会将`Promise`或回调函数暴露给开发者。事实上，由于函数调用的返回值总会被转换成一个`Promise`,因此可以返回一些非`Promise`的值，也就是说，用`yield`调用同步或异步方法都可以正常运行，永远不需要检查返回值是否为`Promise`。

唯一需要关注的是像`readFile()`这样的异步函数，其返回的是一个能被正确识别状态的`Promise`,所以调用`Node.js`的内建方法时不能使用回调函数，须将其转换为返回`Promise`的函数。

**未来的异步任务执行**

`JavaScript`正在引入一种用于执行异步任务的更简单的语法，例如，`await`语法致力于替代之前章节中基于`Promise`的示例。其基本思想是用`async`标记的函数代替生成器，用`await`代替`yield`来调用函数，例如：

```javascript
(async function () {
    let contents = await readFile('config.json');
    doSomethingWith(contents);
    console.log('Done');
})();
```

在函数前添加关键字`async`表示该函数以异步模式运行，`await`关键字表示调用`readFile("config.json")`的函数应该返回一个`Promise`,否则，响应应该被包裹在`Promise`中。正如之前章节中的`run()`实现，如果`Promise`被拒绝则`await()`应该抛出错误，否则通过`Promise`来返回值。最后的结果是，你可以按照同步方式编写异步代码，唯一的开销是一个基于迭代器的状态机。
