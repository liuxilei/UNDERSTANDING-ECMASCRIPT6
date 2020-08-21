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
