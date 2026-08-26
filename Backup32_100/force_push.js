const { execSync } = require('child_process');
try {
  const gitPath = 'C:/Users/admin/AppData/Local/GitHubDesktop/app-3.6.4/resources/app/git/cmd/git.exe';
  const out = execSync(`"${gitPath}" push origin main --force`, {cwd: 'D:/AntiGravity/Github/buddhamiracle', stdio: 'pipe'});
  console.log('SUCCESS:', out.toString());
} catch(e) {
  console.log('ERROR:', e.stderr ? e.stderr.toString() : e.message);
}
