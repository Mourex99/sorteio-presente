/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // Ignora erros de ESLint durante o build
  },
  typescript: {
    ignoreBuildErrors: true, // Ignora erros de TypeScript durante o build
  }
}

module.exports = nextConfig
