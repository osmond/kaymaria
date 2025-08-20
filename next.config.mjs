// Ensure Next.js transpiles ESM-only dependencies like react-hook-form
const nextConfig = {
  transpilePackages: ['react-hook-form'],
};

export default nextConfig;
