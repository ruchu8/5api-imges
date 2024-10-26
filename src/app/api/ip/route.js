import { NextResponse } from "next/server";
import { headers } from 'next/headers'
import { getRequestContext } from '@cloudflare/next-on-pages';

// ...

export const runtime = 'edge';
export async function GET(request) {
  // 获取客户端的IP地址
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || request.socket.remoteAddress;

  // 过滤出IPv4地址
  const clientIp = ip ? ip.split(',').map(ip => ip.trim()).find(ip => /^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$/.test(ip)) || 'IP not found' : 'IP not found';

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
}

async function insertImageData(env, src, referer, ip, rating, time) {
  try {
    const instdata = await env.prepare(
      `INSERT INTO imginfo (url, referer, ip, rating, total, time)
           VALUES ('${src}', '${referer}', '${ip}', ${rating}, 1, '${time}')`
    ).run();
  } catch (error) {
    // 可以在这里处理错误
  }
}
