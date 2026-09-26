import fs from 'fs';
import path from 'path';

const SUPABASE_URL = 'https://uotzztasrxdxdxunleny.supabase.co';
const SUPABASE_KEY = 'sb_publishable_raif2dls9os3gJmZ0aqEcg_b0G_kxBb';
const DEFAULT_IMAGE = 'https://s3.vn-hcm-1.vietnix.cloud/web-bi-images/products/prod-1790259007504-955857.jpg';
const SITE_NAME = 'Bi Bi - Cho Thuê Đồ Núi Thành';

let cachedHtmlShell = '';

async function getBaseHtml() {
  if (cachedHtmlShell) return cachedHtmlShell;

  // 1. Thử đọc file dist/index.html từ filesystem nếu có
  try {
    const localDistPath = path.join(process.cwd(), 'dist', 'index.html');
    if (fs.existsSync(localDistPath)) {
      cachedHtmlShell = fs.readFileSync(localDistPath, 'utf-8');
      return cachedHtmlShell;
    }
  } catch (e) {
    // ignore
  }

  // 2. Fallback: Tải từ trang chủ đã deploy
  try {
    const res = await fetch('https://bichothuedo.vercel.app/', {
      headers: { 'User-Agent': 'Vercel-OG-Bot/1.0' }
    });
    if (res.ok) {
      cachedHtmlShell = await res.text();
      return cachedHtmlShell;
    }
  } catch (e) {
    // ignore
  }

  // 3. Fallback tối thiểu nếu không lấy được HTML
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/jpeg" href="/logo.jpg" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${SITE_NAME}</title>
</head>
<body class="bg-[#faf9f8] text-gray-900 antialiased min-h-screen">
  <div id="root"></div>
</body>
</html>`;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export default async function handler(req, res) {
  const id = req.query?.id || (req.url ? (new URL(req.url, 'http://localhost')).searchParams.get('id') : null);

  // Lấy HTML nền tảng
  let baseHtml = await getBaseHtml();

  if (!id) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(baseHtml);
  }

  try {
    // Truy vấn thông tin sản phẩm từ Supabase REST API
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/products?id=eq.${encodeURIComponent(id)}&select=*`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    const rows = await response.json();
    const product = rows && rows.length > 0 ? rows[0] : null;

    if (!product) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(baseHtml);
    }

    const title = product.title || SITE_NAME;
    const rentPrice1Day = Number(product.rent_price_1day || 0);
    const rentPriceStr = rentPrice1Day > 0 ? `${rentPrice1Day.toLocaleString('vi-VN')}₫/ngày` : '';
    const desc = `${title}${rentPriceStr ? ' • Giá thuê chỉ từ ' + rentPriceStr : ''}. Cho thuê váy thiết kế, đầm tiệc cao cấp tại Bi Bi Boutique Núi Thành.`;
    
    // Ưu tiên featured_image -> ảnh đầu tiên trong mảng images -> DEFAULT_IMAGE
    let imageUrl = product.featured_image;
    if (!imageUrl && Array.isArray(product.images) && product.images.length > 0) {
      imageUrl = product.images[0];
    }
    if (!imageUrl && typeof product.images === 'string') {
      try {
        const parsed = JSON.parse(product.images);
        if (Array.isArray(parsed) && parsed.length > 0) imageUrl = parsed[0];
      } catch (e) {}
    }
    if (!imageUrl) {
      imageUrl = DEFAULT_IMAGE;
    }

    const canonicalUrl = `https://bichothuedo.vercel.app/product/${encodeURIComponent(id)}`;

    // Tạo các thẻ Open Graph & Twitter meta tags chuẩn SEO/Social Share
    const metaTags = `
    <!-- Primary Meta Tags -->
    <title>${escapeHtml(title)} | ${SITE_NAME}</title>
    <meta name="title" content="${escapeHtml(title)} | ${SITE_NAME}" />
    <meta name="description" content="${escapeHtml(desc)}" />

    <!-- Open Graph / Facebook / Zalo / Messenger -->
    <meta property="og:type" content="product" />
    <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
    <meta property="og:title" content="${escapeHtml(title)} | ${SITE_NAME}" />
    <meta property="og:description" content="${escapeHtml(desc)}" />
    <meta property="og:image" content="${escapeHtml(imageUrl)}" />
    <meta property="og:image:secure_url" content="${escapeHtml(imageUrl)}" />
    <meta property="og:image:alt" content="${escapeHtml(title)}" />
    <meta property="og:image:width" content="800" />
    <meta property="og:image:height" content="800" />
    <meta property="og:site_name" content="${SITE_NAME}" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${escapeHtml(canonicalUrl)}" />
    <meta name="twitter:title" content="${escapeHtml(title)} | ${SITE_NAME}" />
    <meta name="twitter:description" content="${escapeHtml(desc)}" />
    <meta name="twitter:image" content="${escapeHtml(imageUrl)}" />
`;

    // Thay thế <title> cũ và chèn meta tags vào <head>
    let injectedHtml = baseHtml;
    if (injectedHtml.includes('<title>')) {
      injectedHtml = injectedHtml.replace(/<title>.*?<\/title>/s, metaTags);
    } else {
      injectedHtml = injectedHtml.replace('</head>', `${metaTags}\n  </head>`);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    // Cache tại Vercel Edge CDN trong 1 giờ để phản hồi cực nhanh cho Zalo/Facebook
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).send(injectedHtml);
  } catch (err) {
    console.error('OG Handler error:', err);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(baseHtml);
  }
}
