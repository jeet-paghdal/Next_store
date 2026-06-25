// This next.config.ts snippet tells Next.js’s built‑in <Image> component which external hosts it’s allowed to optimize and serve images from. By default, Next.js only lets you load local files or domains you explicitly whitelist.
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'laszjosntshjtmgadjhf.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
    ],
  },
}

export default nextConfig
