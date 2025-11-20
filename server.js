import { createServer } from 'http';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;

const server = createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(readFileSync(join(__dirname, 'demo.html'), 'utf-8'));
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('\n================================================');
  console.log('🧮 المعلم الذكي - Smart Math Teacher');
  console.log('================================================\n');
  console.log(`✅ الخادم يعمل على: http://localhost:${PORT}`);
  console.log('\n📝 كيفية الاستخدام:');
  console.log('   1. افتح الرابط في المتصفح');
  console.log('   2. اكتب سؤالك في حقل الإدخال');
  console.log('   3. انقر "إرسال" أو اضغط Enter');
  console.log('   4. انتظر الإجابة من المعلم الذكي\n');
  console.log('🛑 لإيقاف الخادم: اضغط Ctrl+C\n');
  console.log('================================================\n');
});
