const fs = require('fs');

const filePaths = [
  'D:/AntiGravity/Github/buddhamiracle/proxy.ts',
  'd:/AntiGravity/VirtualTemple/temple-of-light/proxy.ts'
];

filePaths.forEach(p => {
  try {
    let content = fs.readFileSync(p, 'utf8');
    if (!content.includes("export const runtime = 'edge'")) {
      content = "export const runtime = 'edge';\n" + content;
      fs.writeFileSync(p, content, 'utf8');
      console.log('Fixed', p);
    }
  } catch(e) {
    console.log('Error', p, e.message);
  }
});
