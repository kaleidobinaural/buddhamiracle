const { execSync } = require('child_process');
try {
  const gitPath = 'C:/Users/admin/AppData/Local/GitHubDesktop/app-3.6.4/resources/app/git/cmd/git.exe';
  console.log('HEAD:', execSync(`"${gitPath}" rev-parse HEAD`, {cwd: 'D:/AntiGravity/Github/buddhamiracle'}).toString().trim());
  console.log('origin/main:', execSync(`"${gitPath}" rev-parse origin/main`, {cwd: 'D:/AntiGravity/Github/buddhamiracle'}).toString().trim());
} catch(e) {}
