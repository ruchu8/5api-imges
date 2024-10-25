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

    const res = await fetch('https://api.da8m.cn/api/upload', {
      method: 'POST',
      body: newFormData,
      headers: {
        'Accept': '*/*',
        'token': '4ca04a3ff8ca3b8f0f8cfa01899ddf8e', // 替换成有效的 token
        'Origin': 'https://mlw10086.serv00.net',
        'Referer': 'https://mlw10086.serv00.net/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0'
      }
    });

    const resdata = await res.text(); // 直接获取返回的文本
    // 解析文本
    let parsedData;
    try {
      parsedData = JSON.parse(resdata); // 尝试解析为 JSON
    } catch (e) {
      return new Response('Invalid response format', { status: 500, headers: corsHeaders });
    }

    let correctImageUrl;

    if (parsedData.status === 1 && parsedData.imgurl) {
      correctImageUrl = `https://assets.da8m.cn/${parsedData.imgurl}`;
    } else {
      return new Response(`Error: ${parsedData.message || 'Unknown error'}`, {
        status: 500,
        headers: corsHeaders,
      });
    }

    const data = {
      "url": correctImageUrl,
      "code": 200,
      "name": parsedData.imgurl
    };

    try {
      if (env.IMG) {
        const nowTime = await get_nowTime();
        await insertImageData(env.IMG, correctImageUrl, "", "", 7, nowTime); // 修改为根据需要进行插入
      }
    } catch (error) {
      console.error('Failed to insert image data:', error);
    }

    return new Response(correctImageUrl, {
      status: 200,
      headers: corsHeaders,
    });

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
