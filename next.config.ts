/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Este é o servidor de fotos do Google
      },
    ],
  },
};

export default nextConfig;