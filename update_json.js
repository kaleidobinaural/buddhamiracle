const fs = require('fs');
const path = require('path');
const files = fs.readdirSync('messages');

files.forEach(file => {
  if (!file.endsWith('.json')) return;
  const p = path.join('messages', file);
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  
  data.Pillars = data.Pillars || {};
  data.Pillars.foundersHall = "Founders' Hall";
  data.Pillars.foundersDesc = "Those who built the foundation of this sanctuary";
  data.Pillars.supportersWall = "Supporter's Wall";
  data.Pillars.supportersDesc = "Hearts who continue to sustain this sacred space";
  
  data.Chat = data.Chat || {};
  data.Chat.unauthMessage = "You must step into the light to speak with the Guru.";
  data.Chat.signIn = "Sign In to Seek Wisdom";
  
  data.Nav = data.Nav || {};
  data.Nav.store = "Quiesan Store";
  
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
});
