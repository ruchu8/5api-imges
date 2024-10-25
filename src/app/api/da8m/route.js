export const runtime = 'edge';
import { getRequestContext } from '@cloudflare/next-on-pages';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*', // Allow all headers
  'Access-Control-Max-Age': '86400', // 24 hours
  'Content-Type': 'application/json'
};

export async function POST(request) {
  const { env, cf, ctx } = getRequestContext();

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const token = formData.get('token'); // Get token from FormData

    if (!file || !token) {
      return new Response(JSON.stringify({ status: 400, message: 'No file or token provided' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const uploadUrl = 'https://api.da8m.cn/api/upload';

    const newFormData = new FormData();
    newFormData.append('file', file);
    newFormData.append('token', token); // Add token to the new FormData

    const res = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        'Connection': 'keep-alive',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        'Accept': '*/*', // Simplified Accept header
        'Origin': 'http://mlw10086.serv00.net', // Use the correct Origin
        'Referer': 'http://mlw10086.serv00.net/', // Use the correct Referer
      },
      body: newFormData
    });


    const responseData = await res.json();
    console.log('Response Data:', responseData);

    if (res.ok && responseData.status === 1) {
      const fileUrl = `https://assets.da8m.cn/${responseData.imgurl}`; // Correct URL construction
      const data = {
        url: fileUrl,
        code: 200,
        message: 'Upload successful',
        id: responseData.id
      };
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: corsHeaders,
      });
    } else {
      return new Response(JSON.stringify({
        status: responseData.status || 500,
        message: responseData.msg || 'Upload failed',
        success: false
      }), {
        status: res.status,
        headers: corsHeaders,
      });
    }
  } catch (error) {
    console.error("Error during upload:", error); // Log the error for debugging
    return new Response(JSON.stringify({
      status: 500,
      message: `Error: ${error.message}`,
      success: false
    }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}
