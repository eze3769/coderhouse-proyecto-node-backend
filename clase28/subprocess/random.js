const quantity = 100;
const numbers = {};
const formattedArray = [];
for(let i = 0; i < quantity; i++){
    const value = Math.ceil(Math.random()*1000)
    if (numbers[value]){
        numbers[value] = numbers[value] + 1
    } else {
        numbers[value] = 1
    }
    
}
Object.keys(numbers).map(el => formattedArray.push(`${el} --> ${numbers[el]} `))


process.send({ numbers: formattedArray });
