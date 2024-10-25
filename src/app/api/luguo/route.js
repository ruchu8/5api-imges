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
  const { env } = getRequestContext();
  const formData = await request.formData();
  const imageFile = formData.get('file');
  
  if (!imageFile) return new Response('Image file not found', { status: 400 });

  // 设置需要上传的额外参数
  const timestamp = Date.now().toString();
  const auth_token = '792509aed7df9d601ef6b4b5608e69c56541a5e1'; // 这里填入您的 auth_token
  const nsfw = '0'; // 这里设置 nsfw 参数

  // 构建新的请求负载
  const payload = new FormData();
  payload.append('source', new Blob([await imageFile.arrayBuffer()], { type: imageFile.type }), imageFile.name);
  payload.append('type', 'file');
  payload.append('action', 'upload');
  payload.append('timestamp', timestamp);
  payload.append('auth_token', auth_token);
  payload.append('nsfw', nsfw);

  try {
    const res = await fetch('https://imgse.com/json', {
      method: 'POST',
      headers: {
        'Host': 'imgse.com',
        'Connection': 'keep-alive',
        'Accept': 'application/json',
        'Origin': 'https://imgse.com',
        'Referer': 'https://imgse.com/i/pAwW1iT',
        // 不需要手动设置 Content-Type，浏览器会自动处理
      },
      body: payload
    });

    const result = await res.json();
    if (result.status_code === 200 && result.success) {
      const imageUrl = result.image.url; // 提取图片的 URL
      const data = {
        url: imageUrl,
        code: 200
      };
      
      // 数据库插入逻辑处理
      // ...

      return Response.json(data, {
        status: 200,
        headers: corsHeaders,
      });
    } else {
      return Response.json({
        status: 400,
        message: result.status_txt || 'Upload failed',
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

// 获取当前时间的函数和数据库插入函数同之前
// ...
