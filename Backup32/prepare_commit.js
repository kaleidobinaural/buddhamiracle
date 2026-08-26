const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  let gitPath = '';
  const localAppData = process.env.LOCALAPPDATA;
  const ghDesktopPath = path.join(localAppData, 'GitHubDesktop');
  if (fs.existsSync(ghDesktopPath)) {
    const dirs = fs.readdirSync(ghDesktopPath).filter(d => d.startsWith('app-'));
    dirs.sort((a, b) => b.localeCompare(a));
    if (dirs.length > 0) {
      gitPath = path.join(ghDesktopPath, dirs[0], 'resources/app/git/cmd/git.exe');
    }
  }

  if (gitPath && fs.existsSync(gitPath)) {
    const repoPath = 'D:/AntiGravity/Github/buddhamiracle';
    console.log('Fetching latest origin...');
    try { execSync(`"${gitPath}" fetch origin`, {cwd: repoPath}); } catch(e){}
    
    console.log('Resetting git index to origin/main but keeping files intact...');
    execSync(`"${gitPath}" reset origin/main`, {cwd: repoPath});
    
    console.log('Done!');
  }
} catch(e) {
  console.log('Error', e.message);
}
