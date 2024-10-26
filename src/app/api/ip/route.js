import { NextResponse } from "next/server";
import { headers } from 'next/headers';
import { getRequestContext } from '@cloudflare/next-on-pages';

// ...

export const runtime = 'edge';
export async function GET(request) {
  try {
    // 获取客户端的IP地址
    const xForwardedFor = request.headers.get('x-forwarded-for');
    const xRealIp = request.headers.get('x-real-ip');
    const remoteAddress = request.socket.remoteAddress;

    let ipList = [];
    if (xForwardedFor) {
      ipList = xForwardedFor.split(',').map(ip => ip.trim());
    } else if (xRealIp) {
      ipList = [xRealIp.trim()];
    } else if (remoteAddress) {
      ipList = [remoteAddress];
    }

    // 提取IPv4地址
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    const clientIp = ipList.find(ip => ipv4Regex.test(ip)) || 'IP not found';

    return new Response(
      JSON.stringify({
        ip: clientIp
      }),
      {
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching IP address:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal Server Error'
      }),
      {
        status: 500,
        headers: {
          'content-type': 'application/json',
        },
      }
    );
  }
}

async function insertImageData(env, src, referer, ip, rating, time) {
  try {
    const instdata = await env.prepare(
      `INSERT INTO imginfo (url, referer, ip, rating, total, time)
           VALUES ('${src}', '${referer}', '${ip}', ${rating}, 1, '${time}')`
    ).run();
  } catch (error) {
    console.error('Error inserting image data:', error);
  }
}
