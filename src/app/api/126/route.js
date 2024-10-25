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

    const resdata = await res.text(); // 直接获取返回的文本

    return new Response(resdata, {
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
