```bash
npm version patch --no-git-tag-version
git add .
git commit -m 'update version'
git push
git tag v1.0.10
git push origin --tags
```
