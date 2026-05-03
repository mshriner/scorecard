npm install -g @angular/cli@latest
npm install @angular/cli@latest --save-dev

git reset
git add .\package.json .\package-lock.json
git commit -m "npm install"

ng update @angular/build @angular/cli @angular/core @angular/material
npm install

git add .\package.json .\package-lock.json
