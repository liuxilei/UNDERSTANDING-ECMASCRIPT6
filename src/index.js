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
console.log(area2);

//由于"wdth"不存在于是抛出错误
let area3 = shape.length * shape.wdth;
