Array.prototype[Symbol.toStringTag] = 'Magic';

var values = [];

console.log(Object.prototype.toString.call(values)); //[object Magic]
