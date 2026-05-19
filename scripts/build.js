const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync('data/partners.json', 'utf8'));
const distDir = 'dist';
const apiDir = path.join(distDir, 'api');

fs.mkdirSync(apiDir, { recursive: true });

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(srcPath, destPath);
    else fs.copyFileSync(srcPath, destPath);
  }
}

copyDir('src', distDir);

for (const [websiteName, websiteConfig] of Object.entries(data.websites || {})) {
  const partners = [];

  for (const [partnerId, partnerData] of Object.entries(data.partners || {})) {
    if (websiteConfig.disabled && websiteConfig.disabled.includes(partnerId)) continue;

    const override = (websiteConfig.overrides && websiteConfig.overrides[partnerId]) || {};

    partners.push({
      url: override.url || partnerData.url,
      title: override.title || partnerData.title,
      text: override.text || partnerData.text
    });
  }

  fs.writeFileSync(
    path.join(apiDir, `${websiteName}.json`),
    JSON.stringify(partners, null, 2)
  );
}

console.log(`Built API files for ${Object.keys(data.websites || {}).length} website(s)`);
