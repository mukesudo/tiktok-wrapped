/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.tiktokcdn.com", pathname: "/**" },
      { protocol: "https", hostname: "**.muscdn.com", pathname: "/**" },
      { protocol: "https", hostname: "**.ibyteimg.com", pathname: "/**" },
      { protocol: "https", hostname: "**.bytecdn.cn", pathname: "/**" }
    ]
  }
};

module.exports = nextConfig;
