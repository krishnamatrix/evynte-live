/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable if you need to use images from external domains
  images: {
    domains: [],
  },
  // Environment variables exposed to the browser
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000',
  },
}

module.exports = nextConfig
