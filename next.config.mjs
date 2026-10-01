import createNextIntlPlugin from 'next-intl/plugin';

// 用 next-intl 插件包裹原本的 Next 配置。
// 插件默认加载 ./i18n/request.ts（语言加载逻辑）。
const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default withNextIntl(nextConfig);
