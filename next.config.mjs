import withPWA from 'next-pwa';

const nextConfig = withPWA({
  dest: 'public',
  register: false,
  sw: 'sw.js',
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
})({});

export default nextConfig;
