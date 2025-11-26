const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const publicDir = path.join(__dirname, '..', 'public');
const assetsDir = path.join(__dirname, '..', 'assets');

console.log('🔧 PWA 빌드 후처리 시작...\n');

// 1. public 폴더의 파일들을 dist로 복사
const publicFiles = ['manifest.json', 'sw.js'];
publicFiles.forEach(file => {
  const src = path.join(publicDir, file);
  const dest = path.join(distDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`✅ ${file} 복사 완료`);
  } else {
    console.log(`⚠️  ${file} 파일이 없습니다`);
  }
});

// 2. icon.png를 dist/assets로 복사
const iconSrc = path.join(assetsDir, 'icon.png');
const iconDest = path.join(distDir, 'assets', 'icon.png');
if (fs.existsSync(iconSrc)) {
  fs.copyFileSync(iconSrc, iconDest);
  console.log('✅ icon.png 복사 완료');
}

// 3. index.html에 PWA 메타 태그 추가
const indexPath = path.join(distDir, 'index.html');
if (fs.existsSync(indexPath)) {
  let html = fs.readFileSync(indexPath, 'utf8');

  // manifest 링크가 없으면 추가
  if (!html.includes('rel="manifest"')) {
    html = html.replace(
      '</head>',
      `<link rel="manifest" href="/manifest.json" />
<link rel="apple-touch-icon" href="/assets/icon.png" />
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="베이글뽑기">
</head>`
    );
    fs.writeFileSync(indexPath, html);
    console.log('✅ index.html PWA 메타 태그 추가 완료');
  } else {
    console.log('ℹ️  index.html에 이미 PWA 메타 태그가 있습니다');
  }
}

console.log('\n🎉 PWA 빌드 후처리 완료!');
console.log('📂 dist 폴더를 정적 서버로 호스팅하면 오프라인 PWA로 동작합니다.');
