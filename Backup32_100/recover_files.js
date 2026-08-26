const https = require('https');
const fs = require('fs');
const commit = '7ae2eb52a3d0a548caf38beb0a99d0d5d3e9f63a';
const files = [
  'app/api/chat/route.ts',
  'app/api/ebook/route.ts',
  'app/api/user/lotus/route.ts',
  'app/api/webhooks/lemonsqueezy/route.ts',
  'app/api/wishes/route.ts'
];

files.forEach(f => {
  https.get(`https://raw.githubusercontent.com/kaleidobinaural/buddhamiracle/${commit}/${f}`, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const finalStr = "export const runtime = 'edge';\n" + data;
      fs.writeFileSync(`D:/AntiGravity/Github/buddhamiracle/${f}`, finalStr, 'utf8');
      fs.writeFileSync(`D:/AntiGravity/VirtualTemple/temple-of-light/${f}`, finalStr, 'utf8');
      console.log('Fixed', f);
    });
  });
});

https.get(`https://raw.githubusercontent.com/kaleidobinaural/buddhamiracle/${commit}/app/favicon.ico`, res => {
  const chunks = [];
  res.on('data', chunk => chunks.push(chunk));
  res.on('end', () => {
    const buf = Buffer.concat(chunks);
    fs.writeFileSync('D:/AntiGravity/Github/buddhamiracle/app/favicon.ico', buf);
    fs.writeFileSync('D:/AntiGravity/VirtualTemple/temple-of-light/app/favicon.ico', buf);
    console.log('Fixed favicon');
  });
});
