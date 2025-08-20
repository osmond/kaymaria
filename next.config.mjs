// Ensure Next.js transpiles ESM-only dependencies like react-hook-form
// and associated resolver packages.
const nextConfig = {
  transpilePackages: ['react-hook-form', '@hookform/resolvers'],
};

export default nextConfig;
