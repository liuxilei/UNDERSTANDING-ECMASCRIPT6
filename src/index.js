let person = {
    getGreeting() {
        return "Hello";
    }
};

//以person对象为原型
let friend = {
    getGreeting() {
        return super.getGreeting.call(this) + ", hi!";
    }
};
Object.setPrototypeOf(friend, person);


console.log(person.getGreeting()); //Hello
console.log(friend.getGreeting()); //Hello,hi!  