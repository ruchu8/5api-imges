export const runtime = 'edge';

export async function GET(request) {
  // 从请求头获取IP地址
  const xForwardedFor = request.headers.get('x-forwarded-for');
  const ip = xForwardedFor ? xForwardedFor.split(',')[0].trim() : 
            request.headers.get('x-real-ip') || 
            request.socket.remoteAddress;

  // 验证并确保是IPv4地址
  const isValidIPv4 = (ip) => {
    const ipv4Pattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$)){3}/;
    return ipv4Pattern.test(ip);
  }

  const clientIp = isValidIPv4(ip) ? ip : 'IP not found';

  return new Response(
    JSON.stringify({ ip: clientIp }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}
