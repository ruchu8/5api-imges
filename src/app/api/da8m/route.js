export const runtime = 'edge';
import { getRequestContext } from '@cloudflare/next-on-pages';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400', // 24 hours
  'Content-Type': 'text/plain'
};

export async function POST(request) {
  const { env } = getRequestContext();
  const formData = await request.formData();
  const file = formData.get('file'); // 使用 'file' 字段名
  if (!file) {
    return new Response('No file uploaded', { status: 400 });
  }

  try {
    const newFormData = new FormData();
    newFormData.append('file', file, file.name); // 上传到目标服务器时使用 'file'

    const res = await fetch('https://api.vviptuangou.com/api/upload', {
      method: 'POST',
      body: newFormData,
      headers: {
        'Accept': '*/*',
        'Origin': 'https://mlw10086.serv00.net',
        'Referer': 'https://mlw10086.serv00.net/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
      }
    });

    const resdata = await res.text(); // 直接获取返回的文本

    // 文本处理，提取图片 URL
    const statusMatch = resdata.match(/"status":\s*(\d)/);
    const imgurlMatch = resdata.match(/"imgurl":"([^"]+)"/);

    if (statusMatch && statusMatch[1] === '1' && imgurlMatch) {
      const correctImageUrl = `https://assets.vviptuangou.com/${imgurlMatch[1]}`;

      const data = {
        "url": correctImageUrl,
        "code": 200,
        "name": imgurlMatch[1]
      };

      try {
        if (env.IMG) {
          const nowTime = await get_nowTime();
          await insertImageData(env.IMG, correctImageUrl, "", "", 7, nowTime);
        }
      } catch (error) {
        console.error('Insert image data error:', error);
      }

      return new Response(correctImageUrl, {
        status: 200,
        headers: corsHeaders,
      });

    } else {
      const message = imgurlMatch ? imgurlMatch[1] : 'Unknown error';
      return new Response(`Error: ${message}`, {
        status: 500,
        headers: corsHeaders,
      });
    }

  } catch (error) {
    return new Response(`Error: ${error.message}`, {
      status: 500,
      headers: corsHeaders,
    });
  }
}

async function insertImageData(env, src, referer, ip, rating, time) {
  try {
    await env.prepare(
      `INSERT INTO imginfo (url, referer, ip, rating, total, time)
           VALUES ('${src}', '${referer}', '${ip}', ${rating}, 1, '${time}')`
    ).run();
  } catch (error) {
    console.error('Database insert error:', error);
  }
}

async function get_nowTime() {
  const options = {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  };
  const timedata = new Date();
  return new Intl.DateTimeFormat('zh-CN', options).format(timedata);
}
