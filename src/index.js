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
