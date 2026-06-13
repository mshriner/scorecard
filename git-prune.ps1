# Update remote references
git fetch --prune
# Identify and delete local branches that no longer exist on remote
git branch -vv | Where-Object { $_ -match 'gone\]' } | ForEach-Object { $_.Trim().Split()[0] } | ForEach-Object { git branch -D $_ }