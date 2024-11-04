import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full h-1/12 text-center bg-slate-200 flex flex-col justify-center items-center">
      <div>
        <p className="text-xs text-gray-500">
          Copyright Ⓒ 2024 All rights reserved. 请勿上传违反中国法律的图片，违者后果自负。 本站会记录上传者IP地址。本程序基于 Cloudflare Pages，开源于
          <Link
            href="https://github.com/x-dr/telegraph-Image"
            className="text-blue-300 hover:text-red-900 ml-1"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub Telegraph-Image
          </Link>
        </p>
        <ul style={{ display: 'flex', flexWrap: 'nowrap', listStyleType: 'none', padding: 0, margin: 0 }}>
          <li>
            <h4>友情链接：</h4>
          </li>
          <li style={{ marginRight: '10px' }}>
            <a href="https://58.linkpc.net" target="_blank">免费API接口</a>
          </li>
          <li style={{ marginRight: '10px' }}>
            <a href="http://ruchu888.ysepan.com/" target="_blank">如初的网盘</a>
          </li>
          <li style={{ marginRight: '10px' }}>
            <a href="http://wcq.us.kg/" target="_blank">传奇知识</a>
          </li>
          <li style={{ marginRight: '10px' }}>
            <a href="https://api.592.us.kg/" target="_blank">随机图片API</a>
          </li>
          <li style={{ marginRight: '10px' }}>
            <a href="https://img.592.us.kg/" target="_blank">图床上传</a>
          </li>
          <li style={{ marginRight: '10px' }}>
            <a href="https://592.us.kg" target="_blank">如初的博客</a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
