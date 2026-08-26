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
    const chunks = [];
    res.on('data', chunk => chunks.push(chunk));
    res.on('end', () => {
      const buffer = Buffer.concat(chunks);
      const str = buffer.toString('utf8');
      const finalStr = "export const runtime = 'edge';\n" + str;
      const finalBuffer = Buffer.from(finalStr, 'utf8');
      
      const p1 = `D:/AntiGravity/Github/buddhamiracle/${f}`;
      const p2 = `D:/AntiGravity/VirtualTemple/temple-of-light/${f}`;
      
      fs.writeFileSync(p1, finalBuffer);
      fs.writeFileSync(p2, finalBuffer);
      console.log('Fixed exactly', f);
    });
  });
});
