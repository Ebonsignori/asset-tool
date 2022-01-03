const fs = require('fs');
const path = require('path');
const { Changelog, Release } = require('keep-a-changelog');

/* 
 * Change types: Added, Changed, Deprecated, Removed, Fixed, and Security.
*/
const changelog = new Changelog('asset-tool')
  .addRelease(
    new Release('1.1.0', '2022-01-02')
      .changed('HTML open option reuses chrome tab for preview')
  )

fs.writeFileSync(path.join(__dirname, './CHANGELOG.md'), changelog.toString());

