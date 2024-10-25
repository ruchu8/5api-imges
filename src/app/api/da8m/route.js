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

  const uploadUrl = 'https://api.da8m.cn/api/upload';

  const newFormData = new FormData();
  newFormData.append('file', file);

  try {
    const res = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        'Host': 'api.da8m.cn',
        'Connection': 'keep-alive',
        'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundaryOyCILgYMA6Y7d8bf',
        'token': '4ca04a3ff8ca3b8f0f8cfa01899ddf8e',
        'sec-ch-ua': '"Chromium";v="130", "Microsoft Edge";v="130", "Not?A_Brand";v="99"',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0'
      },
      body: newFormData
    });

    const textResponse = await res.text(); // 以文本形式获取响应
    console.log('Response Text:', textResponse); // 打印响应内容

    let responseData;
    try {
      responseData = JSON.parse(textResponse); // 尝试将其解析为 JSON
      console.log('Parsed JSON:', responseData); // 打印解析后的 JSON
    } catch (error) {
      console.log('Failed to parse JSON:', error); // 打印解析错误信息
    }

    if (res.ok && responseData && responseData.status === 1) {
      const fileUrl = responseData.img; // 从响应中获取图片地址
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
        status: responseData ? responseData.status : 500,
        message: responseData ? responseData.message : 'Upload failed',
        success: false
      }, {
        status: res.status,
        headers: corsHeaders,
      });
    }
  } catch (error) {
    console.error('Fetch error:', error); // 打印错误信息
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
