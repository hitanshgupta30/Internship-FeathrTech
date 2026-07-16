const numbers = [5, 10, 15, 20, 25, 30]

const greater = numbers.filter(n => n > 15);
console.log(greater);

const double = numbers.map(n => n * 2);
console.log(double);

const divisible = numbers.find(n => n % 10 === 0);
console.log(divisible);

const sum = numbers.reduce((ini, n) => ini + n, 0);
console.log(sum);