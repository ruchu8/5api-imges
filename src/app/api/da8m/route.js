export const runtime = 'edge';
import { getRequestContext } from '@cloudflare/next-on-pages';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400', // 24 hours
  'Content-Type': 'application/json'
};

export async function POST(request) {
  console.log('Received request for file upload...'); // 第一步，接收到请求

  const { env, cf, ctx } = getRequestContext();
  const formData = await request.formData();
  const file = formData.get('file'); // 获取文件字段
  if (!file) {
    console.log('No file uploaded'); // 没有上传文件
    return new Response('No file uploaded', { status: 400 });
  }

  const uploadUrl = 'https://api.da8m.cn/api/upload';
  const newFormData = new FormData();
  newFormData.append('file', file); // 添加文件到 FormData

  try {
    console.log('Preparing to send the file to the upload URL:', uploadUrl); // 准备发送请求
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

    console.log('Received response from server with status:', res.status); // 查看响应状态

    const textResponse = await res.text(); // 捕获文本响应
    console.log('Response Text:', textResponse); // 查看响应文本

    let responseData;
    try {
      responseData = JSON.parse(textResponse); // 尝试解析为 JSON
      console.log('Parsed JSON response:', responseData); // 查看解析后的 JSON
    } catch (err) {
      console.log('Error parsing JSON:', err.message); // JSON 解析错误
      return Response.json({
        status: 500,
        message: `Error parsing JSON: ${err.message}`,
        success: false,
        rawResponse: textResponse // 返回原始响应
      }, {
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
      console.log('File uploaded successfully:', fileUrl);
      return Response.json(data, {
        status: 200,
        headers: corsHeaders,
      });
    } else {
      console.log('Upload failed. Response Status:', responseData.status, 'Message:', responseData.message);
      return Response.json({
        status: responseData.status || 500,
        message: responseData.message || 'Upload failed',
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
