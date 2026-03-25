import fs from 'fs';
import path from 'path';

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(filePath));
        } else { 
            if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) results.push(filePath);
        }
    });
    return results;
}

const files = walk('./src');
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/blue-/g, 'red-');
    content = content.replace(/59\s*,\s*130\s*,\s*246/g, '239,68,68');
    fs.writeFileSync(file, content);
});
console.log('Colors replaced successfully.');
