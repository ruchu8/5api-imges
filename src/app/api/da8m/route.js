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
  const file = formData.get('file');
  if (!file) {
    return new Response('No file uploaded', { status: 400 });
  }

  const uploadUrl = 'https://api.da8m.cn/api/upload';
  const newFormData = new FormData();
  newFormData.append('file', file);

  try {
    const res = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        'Host': 'api.da8m.cn',
        'Connection': 'keep-alive',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        'Content-Type': 'multipart/form-data', // 不需要手动设置边界
        'token': '4ca04a3ff8ca3b8f0f8cfa01899ddf8e', // 替换为有效的token
        'Accept': '*/*',
        'Origin': 'http://mlw10086.serv00.net',
        'Referer': 'http://mlw10086.serv00.net/'
      },
      body: newFormData
    });

    console.log('Response Status:', res.status); // 查看响应状态
    const responseData = await res.json();
    console.log('Response Data:', responseData); // 查看响应数据

    if (res.ok && responseData.status === 1) {
      const fileUrl = responseData.img; // 图片 URL
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
        status: responseData.status || 500,
        message: responseData.msg || 'Upload failed',
        success: false
      }, {
        status: res.status,
        headers: corsHeaders,
      });
    }
  } catch (error) {
    console.log('Error Occurred:', error); // 输出错误详细信息
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
