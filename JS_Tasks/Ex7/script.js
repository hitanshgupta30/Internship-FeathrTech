const string = "Hello World, what's up !!";

//.....1..Reverse String
const reverse = string.split("").reverse().join("");
console.log(reverse); 

//.....2..Count Vowels
const countVow = (str) => {
    const allVowels = 'aeiouAEIOU';
    let count = 0;
    for (let char of str) {
        if (allVowels.includes(char)) {
            count++;
        }
    }
    console.log(count);
}
countVow(string);

//.....3..Largest number in an array
const arr = [25, 16841 ,65, 169 ,55451];
const Largest = Math.max(...arr);
console.log(Largest);

//.....4..Remove duplicate values from an array
const array = [56756, 8, 7, 6, 777, 4, 4, 87, 4];
const newArray = (arr) => {
    for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
            if (arr[i] === arr[j]) {
                arr.splice(j, 1);
                j--;
            }
        }}
    console.log(JSON.stringify(arr));};
newArray(array);


//.....5..Check if a string is a palindrome
const Palindrome = (str) => {
    const reversedStr = str.split("").reverse().join("");
    if (str === reversedStr){
        console.log("The string is a palindrome.");
    }
    else {
        console.log("The string is not a palindrome.");
    }};
Palindrome('racecar');
Palindrome('hello');
