export const runtime = 'edge';
import { getRequestContext } from '@cloudflare/next-on-pages';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400', // 24 hours
  'Content-Type': 'application/json' // 设置为 JSON 格式
};

export async function POST(request) {
  const { env } = getRequestContext();
  const formData = await request.formData();
  const file = formData.get('file'); // 使用 'file' 字段名
  if (!file) {
    return new Response(JSON.stringify({ message: 'No file uploaded' }), { status: 400, headers: corsHeaders });
  }

  try {
    const newFormData = new FormData();
    newFormData.append('file', file, file.name); // 上传到目标服务器时使用 'file'

    const res = await fetch('https://pic.kamept.com/upload/n', {
      method: 'POST',
      body: newFormData,
      headers: {
        'Accept': '*/*',
        'Origin': 'https://pic.kamept.com',
        'Referer': 'https://pic.kamept.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0',
        'Content-Type': 'multipart/form-data' // 需要设置为 multipart/form-data
      }
    });

    const resdata = await res.json(); // 直接获取返回的 JSON

    // 检查响应状态
    if (resdata.url) {
      const data = {
        "url": resdata.url,
        "code": 200,
        "name": resdata.url.split('/').pop() // 获取文件名
      };

      try {
        if (env.IMG) {
          const nowTime = await get_nowTime();
          await insertImageData(env.IMG, resdata.url, "", "", 7, nowTime); // 插入数据
        }
      } catch (error) {
        console.error('Failed to insert image data:', error);
      }

      return Response.json(data, { status: 200, headers: corsHeaders });
    } else {
      return Response.json({
        status: 500,
        message: `Upload failed`,
        success: false
      }, {
        status: 500,
        headers: corsHeaders,
      });
    }

  } catch (error) {
    return Response.json({
      status: 500,
      message: ` ${error.message}`,
      success: false
    }, {
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
