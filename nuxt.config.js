const { SITE_ORIGIN, isGa4MeasurementId } = require('./utils/site')

const googleAnalyticsId = isGa4MeasurementId(process.env.GOOGLE_ANALYTICS_ID)
  ? process.env.GOOGLE_ANALYTICS_ID
  : ''

export default {
  // Target: https://go.nuxtjs.dev/config-target
  target: 'static',

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'aymaneMx.com',
    htmlAttrs: {lang: 'en'},
    meta: [
      {charset: 'utf-8'},
      {name: 'viewport', content: 'width=device-width, initial-scale=1'},
      {hid: 'description', name: 'description', content: 'aymaneMx -- django developer'},
      /* Twitter */
      {hid: "twitter:card", name: "twitter:card", content: "summary"},
      {hid: "twitter:site", name: "twitter:site", content: "@aymane_max"},
      {hid: "twitter:creator", name: "twitter:creator", content: "@aymane_max"},
      {hid: "twitter:title", name: "twitter:title", content: "aymaneMx.com"},
      {hid: "twitter:description", name: "twitter:description", content: 'aymaneMx -- django developer'},
      {hid: "twitter:image", name: "twitter:image", content: '/favicon.png'},
      /* Open-Graph */
      {hid: "og:type", name: "og:type", content: "website"},
      {hid: "og:site_name", name: "og:site_name", content: "aymaneMx.com"},
      {hid: "og:description", name: "og:description", content: 'aymaneMx -- django developer'},
      {hid: "og:image", name: "og:image", content: '/favicon.png'},
    ],
    link: [
      {rel: 'icon', type: 'image/x-icon', href: '/favicon.png'}
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    "@/plugins/util",
    "@/plugins/gtag.client.js",
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    'vue-notion/nuxt',
    '@nuxtjs/eslint-module'
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/sitemap',
    'nuxt-speedkit'
  ],

  publicRuntimeConfig: {
    googleAnalyticsId
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {},
  colorMode: {
    classSuffix: ''
  },

  // Sitemap Configuration: https://sitemap.nuxtjs.org/usage/sitemap-options#from-a-function-which-returns-a-promise
  sitemap: {
    hostname: SITE_ORIGIN,
    routes: async () => {
      const notion = require('vue-notion')
      const pageTable = await notion.getPageTable("ceef6f1a895a46b2a0e4a87b41405547")
      return pageTable.filter((item) => !!item.public).map((item) => `/posts/${item.slug}`)
    }
  },

  // speedkit: a tool to score 100% in lighthouse
  // https://nuxt-speedkit.grabarzundpartner.dev/
  speedkit: {
    detection: {
      performance: true,
      browserSupport: true
    },
    performanceMetrics: {
      device: {
        hardwareConcurrency: { min: 2, max: 48 },
        deviceMemory: { min: 2 }
      },
      timing: {
        fcp: 800,
        dcl: 1200
      },
      lighthouseDetectionByUserAgent: false
    },
    componentAutoImport: false,
    componentPrefix: undefined,
    lazyOffset: {
      component: '0%',
      asset: '0%'
    }
  }
}
