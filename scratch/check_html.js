const fs = require('fs');

async function main() {
  const res = await fetch('http://localhost:3000/vi/dharma');
  const html = await res.text();

  // Find all nav-link texts
  const re = /class="[^"]*nav-link[^"]*"[^>]*>([^<]+)</g;
  let m;
  const links = [];
  while ((m = re.exec(html)) !== null) {
    links.push(m[1].trim());
  }
  console.log('Nav links found in /vi/dharma HTML:', links);

  // Look for any error or exception
  if (html.includes('A Ripple in the Pond')) {
    console.log('ERROR: A Ripple in the Pond is present in HTML!');
  } else {
    console.log('No Ripple in the Pond in initial HTML.');
  }

  // Check todayQuote translation in HTML
  if (html.includes('Lời Minh Triết Hôm Nay')) {
    console.log('Vietnamese todayQuote label found!');
  } else if (html.includes('Today')) {
    console.log('English todayQuote label found!');
  } else {
    console.log('Neither found directly.');
  }
}

main().catch(err => console.error(err));
