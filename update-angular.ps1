npm install -g @angular/cli@latest
npm install @angular/cli@latest --save-dev

git reset
git add .\package.json .\package-lock.json
git commit -m "npm install"

ng update @angular/cli@latest @angular/core@latest @angular/material@latest @angular-devkit/build-angular@latest
npm install

git add .\package.json .\package-lock.json
