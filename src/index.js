function run(taskDef) {
    //创建一个无使用限制的迭代器
    let task = taskDef();

    //开始执行任务
    let result = task.next();

    //循环调用`next()`函数
    function step() {
        //如果任务未完成，则继续执行
        if (typeof result.value === 'function') {
            result.value(function (err, data) {
                if (err) {
                    result = task.throw(err);
                    return;
                }

                result = task.next(data);
                step();
            });
        } else {
            result = task.next(result.value);
            step();
        }
    }

    //开始迭代执行
    step();
}
