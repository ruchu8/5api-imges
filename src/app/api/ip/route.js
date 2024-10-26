export const runtime = 'edge';

export async function GET(request) {
  try {
    // 从请求头获取IP地址
    const xForwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const remoteAddress = request.socket.remoteAddress;

    // 尝试获取有效的IP地址
    let ip = xForwardedFor ? xForwardedFor.split(',')[0].trim() : realIp || remoteAddress;

    // 验证并确保是IPv4地址
    const isValidIPv4 = (ip) => {
      const ipv4Pattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$)){3}/;
      return ipv4Pattern.test(ip);
    }

    const clientIp = isValidIPv4(ip) ? ip : 'IP not found';

    // 返回 IP 信息
    return new Response(
      JSON.stringify({
        status: 'success',
        xForwardedFor,
        realIp,
        remoteAddress,
        clientIp
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    // 处理错误并返回相应信息
    console.error("Error occurred:", error);
    return new Response(
      JSON.stringify({
        status: 'error',
        message: 'Internal Server Error',
        details: error.message
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
