/** @type {import('next').NextConfig} */
const uploadsUrl = process.env.NEXT_PUBLIC_UPLOADS_URL || 'http://localhost:5000';
const internalApi = process.env.INTERNAL_API_URL;

const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['mongoose', 'bcrypt'],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'http', hostname: 'localhost', port: '5000' },
      { protocol: 'https', hostname: '**' },
    ],
  },
  async rewrites() {
    const rules = [];

    // Optional: proxy /api through Next.js (single public port / same-origin cookies)
    if (internalApi) {
      rules.push({
        source: '/api/:path*',
        destination: `${internalApi}/api/:path*`,
      });
    }

    rules.push({
      source: '/uploads/:path*',
      destination: `${uploadsUrl}/uploads/:path*`,
    });

    return rules;
  },
};

export default nextConfig;
