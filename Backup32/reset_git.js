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
    console.log('Resetting to first commit...');
    // The first commit is 7ae2eb52a3d0a548caf38beb0a99d0d5d3e9f63a
    execSync(`"${gitPath}" reset --hard 7ae2eb52a3d0a548caf38beb0a99d0d5d3e9f63a`, {cwd: repoPath});
    console.log(execSync(`"${gitPath}" status`, {cwd: repoPath}).toString());
    
    // Also copy the pristine files back to temple-of-light so the user's dev environment is fixed
    const sourceApp = path.join(repoPath, 'app');
    const targetApp = 'D:/AntiGravity/VirtualTemple/temple-of-light/app';
    
    // PowerShell to copy folder
    execSync(`powershell -Command "Copy-Item -Path '${sourceApp}\\*' -Destination '${targetApp}' -Recurse -Force"`);
    
    console.log('Done reverting!');
  }
} catch(e) {
  console.log('Error', e.message);
}
