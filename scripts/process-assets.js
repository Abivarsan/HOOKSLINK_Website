const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function run() {
  console.log('--- Processing Assets ---');

  // Ensure directories exist
  const dirs = [
    'assets/images/brand',
    'assets/images/clients',
    'assets/images/projects',
    'assets/images/og',
    'assets/icons'
  ];
  for (const d of dirs) {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  }

  // 1. Process Brand Logos
  const extractDark = { left: 120, top: 170, width: 1368, height: 550 };
  await sharp('assets/images/source/brand/hookslink_logo1.jpeg')
    .extract(extractDark)
    .webp({ quality: 95 })
    .toFile('assets/images/brand/hookslink-logo-dark.webp');

  await sharp('assets/images/source/brand/hookslink_logo1.jpeg')
    .extract(extractDark)
    .png()
    .toFile('assets/images/brand/hookslink-logo-dark.png');

  // Transparent dark logo (for dark surfaces)
  const rawDark = await sharp('assets/images/source/brand/hookslink_logo1.jpeg')
    .extract(extractDark)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const transDarkData = Buffer.from(rawDark.data);
  for (let i = 0; i < transDarkData.length; i += 4) {
    const r = transDarkData[i];
    const g = transDarkData[i + 1];
    const b = transDarkData[i + 2];
    const maxVal = Math.max(r, g, b);
    if (maxVal < 15) {
      transDarkData[i + 3] = 0;
    } else if (maxVal < 60) {
      transDarkData[i + 3] = Math.round(((maxVal - 15) / 45) * 255);
    }
  }

  await sharp(transDarkData, { raw: { width: rawDark.info.width, height: rawDark.info.height, channels: 4 } })
    .webp({ quality: 95 })
    .toFile('assets/images/brand/hookslink-logo-transparent.webp');

  await sharp(transDarkData, { raw: { width: rawDark.info.width, height: rawDark.info.height, channels: 4 } })
    .png()
    .toFile('assets/images/brand/hookslink-logo-transparent.png');

  // Logo 2 (Light mode)
  await sharp('assets/images/source/brand/hookslink_logo2.jpeg')
    .extract(extractDark)
    .webp({ quality: 95 })
    .toFile('assets/images/brand/hookslink-logo-light.webp');

  await sharp('assets/images/source/brand/hookslink_logo2.jpeg')
    .extract(extractDark)
    .png()
    .toFile('assets/images/brand/hookslink-logo-light.png');

  // Transparent light logo (for white & light surfaces)
  const rawLight = await sharp('assets/images/source/brand/hookslink_logo2.jpeg')
    .extract(extractDark)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const transLightData = Buffer.from(rawLight.data);
  for (let i = 0; i < transLightData.length; i += 4) {
    const r = transLightData[i];
    const g = transLightData[i + 1];
    const b = transLightData[i + 2];
    const minVal = Math.min(r, g, b);
    if (minVal > 240) {
      transLightData[i + 3] = 0;
    } else if (minVal > 210) {
      transLightData[i + 3] = Math.round(((240 - minVal) / 30) * 255);
    }
  }

  await sharp(transLightData, { raw: { width: rawLight.info.width, height: rawLight.info.height, channels: 4 } })
    .webp({ quality: 95 })
    .toFile('assets/images/brand/hookslink-logo-light-transparent.webp');

  await sharp(transLightData, { raw: { width: rawLight.info.width, height: rawLight.info.height, channels: 4 } })
    .png()
    .toFile('assets/images/brand/hookslink-logo-light-transparent.png');

  console.log('Brand logos created.');

  // 2. Favicons & App Icons
  const svgFavicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="hl-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0044FF"/>
      <stop offset="100%" stop-color="#0099FF"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="22" fill="#FFFFFF"/>
  <rect width="98" height="98" x="1" y="1" rx="21" fill="none" stroke="rgba(0,0,0,0.06)" stroke-width="2"/>
  <!-- Decorative arcs -->
  <path d="M 28 34 A 24 24 0 0 1 72 34" fill="none" stroke="url(#hl-grad)" stroke-width="3" stroke-linecap="round" opacity="0.85"/>
  <path d="M 28 66 A 24 24 0 0 0 72 66" fill="none" stroke="url(#hl-grad)" stroke-width="3" stroke-linecap="round" opacity="0.85"/>
  <!-- Infinity loop / hooks -->
  <path d="M 36 50 C 36 43 45 43 50 50 C 55 57 64 57 64 50 C 64 43 55 43 50 50 C 45 57 36 57 36 50 Z" 
        fill="none" stroke="url(#hl-grad)" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

  fs.writeFileSync('assets/icons/favicon.svg', svgFavicon.trim());
  fs.writeFileSync('favicon.svg', svgFavicon.trim());

  await sharp(Buffer.from(svgFavicon))
    .resize(32, 32)
    .png()
    .toFile('assets/icons/favicon-32x32.png');

  await sharp(Buffer.from(svgFavicon))
    .resize(180, 180)
    .png()
    .toFile('assets/icons/apple-touch-icon.png');

  await sharp(Buffer.from(svgFavicon))
    .resize(192, 192)
    .png()
    .toFile('assets/icons/icon-192.png');

  await sharp(Buffer.from(svgFavicon))
    .resize(512, 512)
    .png()
    .toFile('assets/icons/icon-512.png');

  console.log('Favicons and app icons created.');

  // 3. Process Client Logos
  const clientFiles = fs.readdirSync('assets/images/source/clients');
  for (const cf of clientFiles) {
    if (!cf.endsWith('.png')) continue;
    const baseName = path.basename(cf, '.png');
    const inPath = path.join('assets/images/source/clients', cf);
    
    await sharp(inPath)
      .trim()
      .resize(240, 120, { fit: 'inside', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .webp({ quality: 90 })
      .toFile(path.join('assets/images/clients', `${baseName}.webp`));

    await sharp(inPath)
      .trim()
      .resize(240, 120, { fit: 'inside', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join('assets/images/clients', `${baseName}.png`));
  }
  console.log('Client logos processed.');

  // 4. Process Project Screenshots
  const projectFiles = fs.readdirSync('assets/images/source/projects');
  for (const pf of projectFiles) {
    if (!/\.(jpeg|jpg|png)$/i.test(pf)) continue;
    const baseName = path.basename(pf, path.extname(pf));
    const inPath = path.join('assets/images/source/projects', pf);

    await sharp(inPath)
      .extract({ left: 0, top: 0, width: (await sharp(inPath).metadata()).width, height: Math.round((await sharp(inPath).metadata()).width * 0.75) })
      .resize(800, 600, { fit: 'cover', position: 'top' })
      .webp({ quality: 85 })
      .toFile(path.join('assets/images/projects', `${baseName}-card.webp`));

    await sharp(inPath)
      .resize(600)
      .webp({ quality: 80 })
      .toFile(path.join('assets/images/projects', `${baseName}-full.webp`));
  }
  console.log('Project images processed.');

  // 5. OpenGraph Image (1200x630) - Light high-contrast modern card
  const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="og-glow" cx="50%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#0044FF" stop-opacity="0.12"/>
      <stop offset="60%" stop-color="#0099FF" stop-opacity="0.04"/>
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="og-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0044FF"/>
      <stop offset="100%" stop-color="#0099FF"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="#FFFFFF"/>
  <rect width="1200" height="630" fill="url(#og-glow)"/>
  
  <!-- Subtle tech grid -->
  <g stroke="rgba(0,0,0,0.04)" stroke-width="1">
    <line x1="0" y1="105" x2="1200" y2="105"/>
    <line x1="0" y1="210" x2="1200" y2="210"/>
    <line x1="0" y1="315" x2="1200" y2="315"/>
    <line x1="0" y1="420" x2="1200" y2="420"/>
    <line x1="0" y1="525" x2="1200" y2="525"/>
    <line x1="200" y1="0" x2="200" y2="630"/>
    <line x1="400" y1="0" x2="400" y2="630"/>
    <line x1="600" y1="0" x2="600" y2="630"/>
    <line x1="800" y1="0" x2="800" y2="630"/>
    <line x1="1000" y1="0" x2="1000" y2="630"/>
  </g>

  <!-- Brand badge -->
  <rect x="460" y="80" width="280" height="38" rx="19" fill="#F0F6FF" stroke="rgba(0, 68, 255, 0.2)" stroke-width="1"/>
  <text x="600" y="104" font-family="'Montserrat', sans-serif" font-size="12" font-weight="700" fill="#0044FF" text-anchor="middle" letter-spacing="3">AI-POWERED CREATIVE AGENCY</text>

  <!-- Main Headline -->
  <text x="600" y="270" font-family="'Montserrat', sans-serif" font-size="76" font-weight="900" fill="#0A0D14" text-anchor="middle" letter-spacing="6">HOOKSLINK</text>
  <text x="600" y="340" font-family="'Inter', sans-serif" font-size="28" font-weight="600" fill="#0044FF" text-anchor="middle">Connecting What's Next.</text>

  <!-- Tagline / Subtitle -->
  <text x="600" y="420" font-family="'Inter', sans-serif" font-size="20" fill="#475569" text-anchor="middle">
    SEO • PPC Advertising • Social Media • Web Design &amp; Development
  </text>
  
  <!-- Footer pill -->
  <text x="600" y="550" font-family="'Inter', sans-serif" font-size="16" fill="#64748B" text-anchor="middle">
    UK Registered Digital Agency • hookslink.com
  </text>
</svg>`;

  await sharp(Buffer.from(ogSvg))
    .jpeg({ quality: 92 })
    .toFile('assets/images/og/og-image.jpg');

  console.log('OG image created.');
  console.log('All assets processed successfully!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
