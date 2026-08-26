const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

const appDir = 'D:/AntiGravity/Github/buddhamiracle/app';
const files = walk(appDir);

files.forEach(f => {
  if (f.endsWith('page.tsx') || f.endsWith('layout.tsx') || f.endsWith('route.ts')) {
    let content = fs.readFileSync(f, 'utf8');
    
    // Remove the lotus emoji and Korean just in case (to avoid turbopack bugs)
    if (f.includes('route.ts')) {
      content = content.replace(/🪷/g, 'lotus');
      content = content.replace(/[\uAC00-\uD7A3]/g, '');
    }

    // Skip if already has edge runtime
    if (content.includes("export const runtime = 'edge'")) return;

    // Handle "use client" variants
    const useClientRegex = /^(?:'use client'|"use client");?/m;
    const match = content.match(useClientRegex);
    
    if (match && match.index === 0) { // If it starts with use client
      const endOfLine = content.indexOf('\n', match[0].length);
      if (endOfLine !== -1) {
        content = content.slice(0, endOfLine + 1) + "export const runtime = 'edge';\n" + content.slice(endOfLine + 1);
      } else {
        content = content + "\nexport const runtime = 'edge';\n";
      }
    } else {
      content = "export const runtime = 'edge';\n" + content;
    }
    
    fs.writeFileSync(f, content, 'utf8');
    
    // Copy to temple-of-light
    const templePath = f.replace('Github\\buddhamiracle', 'VirtualTemple\\temple-of-light').replace('Github/buddhamiracle', 'VirtualTemple/temple-of-light');
    try { fs.writeFileSync(templePath, content, 'utf8'); } catch(e){}
  }
});

console.log('Fixed all files properly!');
