import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Разрешаем next/image грузить фото проектов из Supabase Storage.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
