const users = [
{ name: "Rahul", age: 22 },
{ name: "Priya", age: 18 },
{ name: "Amit", age: 25 },
{ name: "Neha", age: 20 }
];

const above20 = users.filter(user => user.age > 20);
console.log(above20);

const names = users.map(user => user.name);
console.log(names);

const firstabove20 = users.find(user => user.age > 20);
console.log(firstabove20);

const totalAge = users.reduce((ini, user) => user.age + ini, 0);
console.log(totalAge);