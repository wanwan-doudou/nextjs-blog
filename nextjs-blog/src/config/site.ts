// 站点配置 - 参考原 gal 主题 _config.yml
export const siteConfig = {
  // 基础信息
  title: "Gal Blog",
  description: "一个使用 Next.js 重构的博客",
  author: "Author",
  url: "https://example.com",

  // Logo配置
  useLogo: false,
  logoImage: "",
  navbarText: "Gal Blog",

  // 背景图配置
  xsBgImage: "https://t.alcy.cc/ycy",
  authorImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=gal",

  // 导航菜单
  menu: [
    { title: "首页", icon: "Home", url: "/" },
    { title: "归档", icon: "Archive", url: "/archives" },
    { title: "壁纸", icon: "Image", url: "/wallpaper" },
    { title: "关于我", icon: "User", url: "/about" },
  ],

  // 默认封面图API
  defaultPreview: {
    useApi: true,
    apiUrls: [
      "https://t.alcy.cc/ycy",
      "https://t.alcy.cc/ysz",
      "https://t.alcy.cc/pc",
      "https://t.alcy.cc/moe",
      "https://t.alcy.cc/fj",
    ],
  },

  // 侧边栏配置
  sidebar: {
    recentPosts: true,
    randomPosts: true,
    tags: true,
    friendLinks: true,
    links: true,
  },

  // 友情链接
  friendLinks: [
    { name: "KDays Forum", link: "http://kdays.net/days/" },
    { name: "萌导航", link: "http://www.moe123.com/" },
  ],

  // 个人链接
  links: [
    { name: "Github", link: "https://github.com/" },
    { name: "知乎", link: "https://www.zhihu.com/" },
  ],

  // 背景轮播配置
  slideBackground: {
    useApi: true,
    apiCount: 6,
    apiUrls: [
      "https://t.alcy.cc/ycy",
      "https://t.alcy.cc/ysz",
      "https://t.alcy.cc/pc",
      "https://t.alcy.cc/moe",
      "https://t.alcy.cc/fj",
      "https://t.alcy.cc/bd",
      "https://t.alcy.cc/ys",
    ],
  },

  // 壁纸页面配置
  wallpaper: {
    pcApiUrls: [
      "https://t.alcy.cc/ycy",
      "https://t.alcy.cc/ysz",
      "https://t.alcy.cc/pc",
      "https://t.alcy.cc/moe",
      "https://t.alcy.cc/fj",
    ],
    batchSize: 12,
    maxImages: 120,
  },

  // 代码高亮主题
  highlightTheme: "atom-one-dark",

  // 音乐播放器配置
  musicPlayer: {
    enable: false,
    title: "歌单",
    playlistId: "8692231711",
    server: "tencent",
    autoplay: false,
    volume: 0.1,
    theme: "#cc543a",
  },

  // 看板娘配置
  sakanaWidget: {
    enable: true,
    position: {
      bottom: "10px",
      right: "10px",
    },
  },

  // 分页配置
  postsPerPage: 10,
};

export type SiteConfig = typeof siteConfig;
