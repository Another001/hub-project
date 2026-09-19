/** @type {import('next').NextConfig} */
const nextConfig = {
  // react-pdf + pdfjs-dist cần transpile để build được trên Next 14
  transpilePackages: ["react-pdf", "pdfjs-dist"],
};

export default nextConfig;
