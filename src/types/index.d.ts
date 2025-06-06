
type Exclude<T, U> = T extends U ? never : T

export interface ThemeConfig {

  site: {
    title: string
    subtitle: string
    description: string
    author: string
    url: string
    favicon: string
    posts: string
    tags: string
    about: string
    toc: string
  }

  color: {
    mode: 'light' | 'dark' | 'auto'
    light: {
      primary: string
      secondary: string
      background: string
    }
    dark: {
      primary: string
      secondary: string
      background: string
    }
  }

  global: {
    fontStyle: 'sans' | 'serif'
    dateFormat: 'YYYY-MM-DD' | 'MM-DD-YYYY' | 'DD-MM-YYYY' | 'MONTH DAY YYYY' | 'DAY MONTH YYYY'
    titleGap: 1 | 2 | 3
    katex: boolean
  }

  comment: {
    enabled: boolean
    waline?: {
      serverURL?: string
      emoji?: string[]
      search?: boolean
      imageUploader?: boolean
    }
  }

  seo?: {
    twitterID?: string
    verification?: {
      google?: string
      bing?: string
      yandex?: string
      baidu?: string
    }
    googleAnalyticsID?: string
    umamiAnalyticsID?: string
    follow?: {
      feedID?: string
      userID?: string
    }
    apiflashKey?: string
  }

  footer: {
    links: {
      name: string
      url: string
    }[]
    startYear: number
  }

  preload: {
    linkPrefetch: 'hover' | 'tap' | 'viewport' | 'load'
    commentURL?: string
    imageHostURL?: string
    customGoogleAnalyticsJS?: string
    customUmamiAnalyticsJS?: string
  }
}

export default ThemeConfig
