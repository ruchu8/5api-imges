export const runtime = 'edge';
import { getRequestContext } from '@cloudflare/next-on-pages';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400', // 24 hours
  'Content-Type': 'application/json'
};

/* 
  接口来自 https://www.nodeseek.com/post-158028-1
  网友提供的免费IPFS上传接口
  另外建议配合使用 https://github.com/BlueSkyXN/WorkerJS_CloudFlare_ImageBed/blob/main/UserScript/ipfs-fix.js
*/

export async function POST(request) {
  const { env, cf, ctx } = getRequestContext();
  console.log('Request received:', request.url);

  // 只允许 POST 请求
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    // 解析表单数据
    const formData = await request.formData();
    const file = formData.get('image'); // 使用 'image' 字段名
    if (!file) {
      return new Response('No file uploaded', { status: 400, headers: corsHeaders });
    }

    // 准备新的 FormData 发送到 IPFS 网关
    const newFormData = new FormData();
    newFormData.append('file', file, file.name);

    // IPFS 网关上传 URL
    const ipfsUrl = 'https://api.img2ipfs.org/api/v0/add?pin=false';

    // 使用 fetch API 发送文件到 IPFS 网关
    const response = await fetch(ipfsUrl, {
      method: 'POST',
      body: newFormData,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
      }
    });

    // 检查请求状态
    if (response.ok) {
      const result = await response.json();
      console.log("上传成功！");

      // 从返回结果中提取哈希值和文件名
      const fileName = result.Name;
      const fileHash = result.Hash;
      const fileSize = result.Size;
      
      console.log(`文件名: ${fileName}`);
      console.log(`哈希值: ${fileHash}`);
      console.log(`大小: ${fileSize} 字节`);

      // 构建图片访问链接
      const accessUrl = `https://i0.wp.com/eth.sucks/ipfs/${fileHash}`;
      console.log(`图片访问链接: ${accessUrl}`);

      // 返回成功的链接
      return Response.json({ url: accessUrl }, { status: 200, headers: corsHeaders });
    } else {
      console.error(`上传失败，状态码: ${response.status}`);
      return new Response(`Upload failed with status: ${response.status}`, { status: response.status, headers: corsHeaders });
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response('Internal Server Error', { status: 500, headers: corsHeaders });
  }
}

// 处理 OPTIONS 请求
export async function OPTIONS(request) {
  return new Response(null, {
    headers: {
      ...corsHeaders,
    },
  });
}
