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
    return new Response('No file uploaded', { status: 400, headers: corsHeaders });
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
        'Content-Type': 'multipart/form-data'
      }
    });

    const resdata = await res.text(); // 获取响应的文本
    console.log('Response data:', resdata); // 打印响应数据用于调试

    const urlMatch = resdata.match(/"url":"([^"]+)"/); // 匹配 URL

    if (urlMatch) {
      const correctImageUrl = urlMatch[1];

      try {
        if (env.IMG) {
          const nowTime = await get_nowTime();
          await insertImageData(env.IMG, correctImageUrl, "", "", 7, nowTime); // 插入数据
        }
      } catch (error) {
        console.error('Failed to insert image data:', error);
      }

      return new Response(correctImageUrl, {
        status: 200,
        headers: corsHeaders,
      });
    } else {
      console.error('Upload failed: No URL found in response');
      return new Response('Upload failed: No URL found', {
        status: 500,
        headers: corsHeaders,
      });
    }

  } catch (error) {
    console.error('Internal server error:', error); // 打印详细错误信息
    return new Response(`Error: ${error.message}`, {
      status: 500,
      headers: corsHeaders,
    });
  }
}

// 其他函数保持不变
