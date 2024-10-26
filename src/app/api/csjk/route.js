export const runtime = 'edge';
import { getRequestContext } from '@cloudflare/next-on-pages';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400', // 24 hours
  'Content-Type': 'application/json'
};

export async function POST(request) {
  const { env } = getRequestContext();

  const formData = await request.formData();
  const file = formData.get('file'); // 确保使用的字段名为 'file'
  if (!file) {
    return new Response('No file uploaded', { status: 400 });
  }

  const uploadUrl = 'https://xzxx.uir.cn/index/Index/upload.html';

  const newFormData = new FormData();
  newFormData.append('file', file);

  try {
    const res = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        'Connection': 'keep-alive',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Origin': 'https://xzxx.uir.cn',
        'Referer': 'https://xzxx.uir.cn/index/Index/mail.html'
      },
      body: newFormData
    });

    const responseData = await res.json();
    console.log('Response Data:', responseData); // 添加调试信息

    if (res.ok && responseData.code === 1) {
      const fileUrl = `https://xzxx.uir.cn${responseData.data.url}`; // 拼接基本地址和图片路径

      // 插入数据库的部分
      try {
        if (env.IMG) {
          const nowTime = await get_nowTime();
       //   const Referer = request.headers.get('Referer') || "Referer";
          const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || request.socket.remoteAddress;
          const formattedClientIp = clientIp ? clientIp.split(',')[0].trim() : 'IP not found';

          await insertImageData(env.IMG, fileUrl, "国际学院", formattedClientIp, 4, nowTime);
        }
      } catch (error) {
        console.error('Database insert error:', error); // 处理数据库插入的错误
      }

      const data = {
        url: fileUrl,
        code: 200,
        message: 'Upload successful'
      };
      return Response.json(data, {
        status: 200,
        headers: corsHeaders,
      });
    } else {
      return Response.json({
        status: responseData.code || 500,
        message: responseData.msg || 'Upload failed',
        success: false
      }, {
        status: res.status,
        headers: corsHeaders,
      });
    }
  } catch (error) {
    return Response.json({
      status: 500,
      message: `Error: ${error.message}`,
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
    console.error('Error inserting data into database:', error);
    // 打印错误日志以供检查
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
