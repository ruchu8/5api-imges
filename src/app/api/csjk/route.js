export const runtime = 'edge';
import { getRequestContext } from '@cloudflare/next-on-pages';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400', // 24 hours
  'Content-Type': 'application/json'
};

export async function POST(request) {
  const { env, cf, ctx } = getRequestContext();

  const formData = await request.formData();
  const file = formData.get('file'); // 确保使用的字段名为 'file'
  if (!file) {
    return new Response('No file uploaded', { status: 400 });
  }

  const req_url = new URL(request.url);
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
