$updateMajor = Read-Host "Update Angular to a new major version? Enter Y to add @latest, N to stay on the current major version"
if ($updateMajor -match '^[Yy]') {
    $ngSuffix = "@latest"
} else {
    $ngSuffix = ""
}

npm install -g @angular/cli$ngSuffix
npm install @angular/cli$ngSuffix --save-dev

git reset
git add .\package.json .\package-lock.json
git commit -m "npm install"

ng update @angular/cli$ngSuffix @angular/core$ngSuffix @angular/material$ngSuffix @angular/build$ngSuffix
npm install

git add .\package.json .\package-lock.json
