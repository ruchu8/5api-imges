export const runtime = 'edge';
import { getRequestContext } from '@cloudflare/next-on-pages';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400', // 24 hours
  'Content-Type': 'text/plain'
};

export async function POST(request) {
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
    const parsedData = JSON.parse(resdata); // 解析 JSON 文本
    const imageUrl = `https://assets.da8m.cn/${parsedData.imgurl}`; // 构建完整的图片 URL

    return new Response(imageUrl, {
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
