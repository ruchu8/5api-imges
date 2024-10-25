export const runtime = 'edge';
import { getRequestContext } from '@cloudflare/next-on-pages';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400', // 24 hours
  'Content-Type': 'application/json'
};

export async function POST(request) {
  let debugInfo = ''; // 用于存储调试信息
  debugInfo += 'Received request for file upload...\n';

  const { env, cf, ctx } = getRequestContext();
  const formData = await request.formData();
  const file = formData.get('file');
  if (!file) {
    debugInfo += 'No file uploaded\n';
    return new Response('No file uploaded', { status: 400 });
  }

  const uploadUrl = 'https://api.da8m.cn/api/upload';
  const newFormData = new FormData();
  newFormData.append('file', file);

  try {
    debugInfo += `Preparing to send the file to the upload URL: ${uploadUrl}\n`;
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

    debugInfo += `Received response from server with status: ${res.status}\n`;
    const textResponse = await res.text(); // 捕获文本响应
    debugInfo += `Response Text: ${textResponse}\n`; // 查看响应文本

    let responseData;
    try {
      responseData = JSON.parse(textResponse);
      debugInfo += `Parsed JSON response: ${JSON.stringify(responseData)}\n`;
    } catch (err) {
      debugInfo += `Error parsing JSON: ${err.message}\n`;
      return new Response(debugInfo, {
        status: 500,
        headers: corsHeaders,
      });
    }

    if (res.ok && responseData.status === 1) {
      const fileUrl = responseData.img; // 图片 URL
      const data = {
        url: fileUrl,
        code: 200,
        message: 'Upload successful'
      };
      debugInfo += `File uploaded successfully: ${fileUrl}\n`;
      return new Response(debugInfo + JSON.stringify(data), {
        status: 200,
        headers: corsHeaders,
      });
    } else {
      debugInfo += `Upload failed. Response Status: ${responseData.status}, Message: ${responseData.message}\n`;
      return new Response(debugInfo, {
        status: res.status,
        headers: corsHeaders,
      });
    }
  } catch (error) {
    debugInfo += `Error Occurred: ${error}\n`;
    return new Response(debugInfo, {
      status: 500,
      headers: corsHeaders,
    });
  }
}
