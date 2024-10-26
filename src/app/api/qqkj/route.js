export const runtime = 'edge';
import { getRequestContext } from '@cloudflare/next-on-pages';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400', // 24 hours
  'Content-Type': 'application/json'
};

// 处理 POST 请求的异步函数，接收图像文件并将其上传到指定的 URL。
export async function POST(request) {
  const { env, cf } = getRequestContext();
  const formData = await request.formData();
  const imageFile = formData.get('file');
  
  // 获取客户端 IP 和 Referer
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || request.socket.remoteAddress;
  const clientIp = ip ? ip.split(',')[0].trim() : 'IP not found';
  const Referer = request.headers.get('Referer') || "Referer";

  if (!imageFile) return new Response('Image file not found', { status: 400 });

  // 将文件数据转换为 ArrayBuffer
  const arrayBuffer = await imageFile.arrayBuffer();
  const payload = new FormData();
  payload.append('file', new Blob([arrayBuffer]), imageFile.name);

  try {
    const res = await fetch('https://pic.kamept.com/upload/y', {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0',
        'Origin': 'https://pic.kamept.com',
        'Referer': 'https://pic.kamept.com/',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6'
      },
      body: payload
    });

    const result = await res.json();
    if (result.url) {
      const data = {
        url: result.url,
        code: 200
      };

      // 插入数据库的部分
      try {
        if (env.IMG) {
          const nowTime = await get_nowTime();
          await insertImageData(env.IMG, result.url, Referer, clientIp, 9, nowTime);
        }
      } catch (error) {
        // 处理插入数据库的错误
      }

      return Response.json(data, {
        status: 200,
        headers: corsHeaders,
      });
    } else {
      return Response.json({
        status: 400,
        message: 'Upload failed',
        success: false
      }, {
        status: 400,
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

// 插入数据到数据库的函数
async function insertImageData(env, src, referer, ip, rating, time) {
  try {
    await env.prepare(
      `INSERT INTO imginfo (url, referer, ip, rating, total, time)
       VALUES ('${src}', '${referer}', '${ip}', ${rating}, 1, '${time}')`
    ).run();
  } catch (error) {
    // 处理插入数据库的错误
  }
}

// 获取当前时间的函数
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
