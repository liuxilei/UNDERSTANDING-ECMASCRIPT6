let numbers = [1, 2, 3, 4];

//从数组的索引2开始粘贴值
//从数组的索引0开始复制值
//当位于索引1时停止复制值
numbers.copyWithin(2, 0, 1);

console.log(numbers.toString()); //1,2,1,4
