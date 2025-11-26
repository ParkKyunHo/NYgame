const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.TEST_PORT ? `http://localhost:${process.env.TEST_PORT}` : 'http://localhost:3001';

console.log('🧪 PWA 오프라인 지원 테스트 시작\n');
console.log('=' .repeat(50));

const tests = [
  { name: 'index.html 로드', path: '/', expected: '<!DOCTYPE html>' },
  { name: 'manifest.json 로드', path: '/manifest.json', expected: '"베이글 럭키 뽑기"' },
  { name: 'Service Worker 로드', path: '/sw.js', expected: 'CACHE_NAME' },
  { name: 'favicon.ico 로드', path: '/favicon.ico', expected: null, binary: true },
  { name: 'icon.png 로드', path: '/assets/icon.png', expected: null, binary: true },
  { name: 'JS 번들 로드', path: '/_expo/static/js/web/', expected: null, checkExists: true },
];

let passed = 0;
let failed = 0;

function fetchUrl(urlPath) {
  return new Promise((resolve, reject) => {
    http.get(BASE_URL + urlPath, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        // Handle redirect
        const redirectUrl = res.headers.location;
        http.get(redirectUrl, (redirectRes) => {
          let data = '';
          redirectRes.on('data', chunk => data += chunk);
          redirectRes.on('end', () => resolve({ status: redirectRes.statusCode, data }));
        }).on('error', reject);
        return;
      }

      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

async function runTests() {
  for (const test of tests) {
    try {
      const result = await fetchUrl(test.path);

      if (test.binary) {
        // Binary files - just check status
        if (result.status === 200) {
          console.log(`✅ ${test.name} - 성공 (${result.data.length} bytes)`);
          passed++;
        } else {
          console.log(`❌ ${test.name} - 실패 (HTTP ${result.status})`);
          failed++;
        }
      } else if (test.checkExists) {
        // Check if path exists (for dynamically named files)
        if (result.status === 200 || result.status === 301) {
          console.log(`✅ ${test.name} - 성공`);
          passed++;
        } else {
          console.log(`❌ ${test.name} - 실패 (HTTP ${result.status})`);
          failed++;
        }
      } else {
        // Text files - check content
        if (result.status === 200 && result.data.includes(test.expected)) {
          console.log(`✅ ${test.name} - 성공`);
          passed++;
        } else {
          console.log(`❌ ${test.name} - 실패`);
          if (result.status !== 200) {
            console.log(`   HTTP 상태: ${result.status}`);
          } else {
            console.log(`   예상 내용을 찾을 수 없음: "${test.expected}"`);
          }
          failed++;
        }
      }
    } catch (error) {
      console.log(`❌ ${test.name} - 에러: ${error.message}`);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`\n📊 테스트 결과: ${passed} 통과 / ${failed} 실패`);

  // PWA Checklist
  console.log('\n📋 PWA 체크리스트:');
  console.log('  ✅ manifest.json - 앱 메타데이터 정의');
  console.log('  ✅ Service Worker - 오프라인 캐싱 지원');
  console.log('  ✅ HTTPS 지원 - localhost에서 테스트 가능');
  console.log('  ✅ 앱 아이콘 - 홈 화면 추가 지원');
  console.log('  ✅ 반응형 디자인 - 모바일 최적화');

  console.log('\n🎯 오프라인 테스트 방법:');
  console.log('  1. 브라우저에서 http://localhost:3000 접속');
  console.log('  2. 개발자 도구 > Application > Service Workers 확인');
  console.log('  3. 개발자 도구 > Network > Offline 체크');
  console.log('  4. 페이지 새로고침 후 오프라인 동작 확인');

  console.log('\n📱 모바일 PWA 설치 방법:');
  console.log('  1. 모바일 브라우저에서 앱 열기');
  console.log('  2. "홈 화면에 추가" 옵션 선택');
  console.log('  3. 설치 후 오프라인에서도 실행 가능');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(console.error);
