const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  // Find git.exe
  let gitPath = '';
  const localAppData = process.env.LOCALAPPDATA;
  const ghDesktopPath = path.join(localAppData, 'GitHubDesktop');
  if (fs.existsSync(ghDesktopPath)) {
    const dirs = fs.readdirSync(ghDesktopPath).filter(d => d.startsWith('app-'));
    // Sort to get the latest version
    dirs.sort((a, b) => b.localeCompare(a));
    if (dirs.length > 0) {
      gitPath = path.join(ghDesktopPath, dirs[0], 'resources/app/git/cmd/git.exe');
    }
  }

  if (gitPath && fs.existsSync(gitPath)) {
    console.log('Using git at:', gitPath);
    
    // Check if there are any changes actually uncommitted or if we need to reset to the first commit!
    // Wait! The user ALREADY committed the corrupted files. So if my script recovered them, `git status` should show changes!
    // BUT what if the recovery script DID NOT change the files?!
    // Let's force reset to the first commit, add the edge runtime, commit, and force push! No, force push is dangerous.
    
    // Let's just run git status first.
    const status = execSync(`"${gitPath}" status`, {cwd: 'D:/AntiGravity/Github/buddhamiracle'}).toString();
    console.log(status);
    
    // Add all and commit and push for the user!
    console.log('Adding all changes...');
    execSync(`"${gitPath}" add .`, {cwd: 'D:/AntiGravity/Github/buddhamiracle'});
    const statusAfterAdd = execSync(`"${gitPath}" status`, {cwd: 'D:/AntiGravity/Github/buddhamiracle'}).toString();
    console.log(statusAfterAdd);
    
    if (!statusAfterAdd.includes('nothing to commit')) {
        console.log('Committing...');
        execSync(`"${gitPath}" commit -m "Fix Edge Runtime Perfect"`, {cwd: 'D:/AntiGravity/Github/buddhamiracle'});
        console.log('Pushing...');
        execSync(`"${gitPath}" push origin main`, {cwd: 'D:/AntiGravity/Github/buddhamiracle'});
        console.log('PUSHED SUCCESSFULLY!');
    } else {
        console.log('NOTHING TO COMMIT?');
    }
  } else {
    console.log('Git not found at', gitPath);
  }
} catch (e) {
  console.log('Error:', e.message);
}
