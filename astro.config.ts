import mdx from '@astrojs/mdx'
import partytown from '@astrojs/partytown'
import sitemap from '@astrojs/sitemap'
import compress from 'astro-compress'
import robotsTxt from 'astro-robots-txt'
import { defineConfig } from 'astro/config'
import rehypeExternalLinks from 'rehype-external-links'
import rehypeKatex from 'rehype-katex'
import rehypeSlug from 'rehype-slug'
import remarkMath from 'remark-math'
import UnoCSS from 'unocss/astro'
import { themeConfig } from './src/config'
import { rehypeImgToFigure } from './src/plugins/rehype-img-to-figure.mjs'
import { remarkReadingTime } from './src/plugins/remark-reading-time.mjs'

const url = themeConfig.site.url
const linkPrefetch = themeConfig.preload.linkPrefetch
const imageHostURL = themeConfig.preload.imageHostURL
const imageConfig = imageHostURL
  ? {
      // Configure domains and remotePatterns to optimize remote images in Markdown files using ![alt](src) syntax (adds width and height)
      // Docs: https://docs.astro.build/en/guides/images/#authorizing-remote-images
      image: {
        domains: [imageHostURL],
        remotePatterns: [{ protocol: 'https' }],
      },
    }
  : {}

export default defineConfig({
  site: url,
  base: '/',
  trailingSlash: 'always',
  prefetch: {
    prefetchAll: true,
    defaultStrategy: linkPrefetch,
  },
  ...imageConfig,
  integrations: [
    UnoCSS({
      injectReset: true,
    }),
    mdx(),
    partytown({
      config: {
        forward: ['dataLayer.push'],
      },
    }),
    sitemap(),
    robotsTxt(),
    compress(),
  ],
  markdown: {
    remarkPlugins: [
      remarkMath,
      remarkReadingTime,
    ],
    rehypePlugins: [
      rehypeSlug,
      rehypeKatex,
      rehypeImgToFigure,
      [
        rehypeExternalLinks,
        {
          target: '_blank',
          rel: ['nofollow', 'noopener', 'noreferrer', 'external'],
          protocols: ['http', 'https', 'mailto'],
        },
      ],
    ],
    shikiConfig: {
      // available themes: https://shiki.style/themes
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    },
  },
  devToolbar: {
    enabled: false,
  },
})
