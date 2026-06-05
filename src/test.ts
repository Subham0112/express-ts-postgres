
import * as fs from 'fs';

fs.appendFileSync('src/test.txt',"\n Appending file")
fs.writeFileSync('src/test2.txt','this is second file created with write file')
const textContent: string = fs.readFileSync('src/test.txt', 'utf-8');
const textContent2:string =fs.readFileSync('src/test2.txt','utf-8')
console.log(textContent);
console.log(textContent2);
