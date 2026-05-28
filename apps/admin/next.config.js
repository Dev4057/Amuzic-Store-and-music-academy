/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@amuzic/shared', '@amuzic/db', '@react-pdf/renderer'],
}

module.exports = nextConfig
