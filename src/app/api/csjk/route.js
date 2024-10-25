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
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || request.socket.remoteAddress;
  const clientIp = ip ? ip.split(',')[0].trim() : 'IP not found';
  const referer = request.headers.get('Referer') || "Referer"; // Use a more descriptive variable name

  const req_url = new URL(request.url);


  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400', // 24小时
      },
    });
  }

  try {
    const uploadUrl = 'https://xzxx.uir.cn/index/Index/upload.html';
    const formData = await request.formData(); // Parse the FormData
    const newHeaders = {
      'Connection': 'keep-alive',
      'Content-Length': formData.get('file').size, // Get Content-Length dynamically
      'sec-ch-ua-platform': 'Windows',
      'X-Requested-With': 'XMLHttpRequest',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0',
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'sec-ch-ua': '"Chromium";v="130", "Microsoft Edge";v="130", "Not?A_Brand";v="99"',
      'sec-ch-ua-mobile': '?0',
      'Origin': 'https://xzxx.uir.cn',
      'Sec-Fetch-Site': 'same-origin',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Dest': 'empty',
      'Referer': 'https://xzxx.uir.cn/index/Index/mail.html',
      'Accept-Encoding': 'gzip, deflate, br, zstd',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
      'Content-Type': formData.get('file').type //get the Content-Type from the form data
    };
      

    const res = await fetch(uploadUrl, {
      method: 'POST',
      headers: newHeaders,
      body: formData, // Use the parsed FormData
    });


    let resdata;
    try {
      resdata = await res.json();
    } catch (jsonError) {
      // Handle cases where the response is not valid JSON
      console.error("Error parsing JSON response:", jsonError);
      return new Response(JSON.stringify({ status: 500, message: 'Error parsing server response.  Check server logs for details.' }), {
          status: 500,
          headers: corsHeaders,
      });

    }

    const data = {
      "url": resdata.url || resdata.data || "URL not found in response", // Handle variations in response structure
      "code": res.status, //Use the HTTP status code from the response.
      "name": resdata.filekey || resdata.filename || "Filename not found in response" // Handle variations in response structure

    };

    try {
      if (env.IMG) {
        const nowTime = await get_nowTime();
        await insertImageData(env.IMG, data.url, referer, clientIp, 7, nowTime);
      }
    } catch (error) {
      console.error("Error inserting image data:", error);
    }

    return Response.json(data, {
      status: 200,
      headers: corsHeaders,
    });

  } catch (error) {
    console.error("Error during upload:", error);
    return Response.json({
      status: 500,
      message: `Upload failed: ${error.message}`,
      success: false
    }, {
      status: 500,
      headers: corsHeaders,
    });
  }
}

// ... (rest of your code remains the same)
