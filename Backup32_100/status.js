const { execSync } = require('child_process');
try {
  const gitPath = 'C:/Users/admin/AppData/Local/GitHubDesktop/app-3.6.4/resources/app/git/cmd/git.exe';
  console.log(execSync(`"${gitPath}" status`, {cwd: 'D:/AntiGravity/Github/buddhamiracle'}).toString());
} catch(e) {}
