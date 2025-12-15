// 站点配置 - 参考原 gal 主题 _config.yml
export const siteConfig = {
  // ==================== 基础信息 ====================
  title: "这个爱酱不太聪明",
  description: "技术宅改变世界",
  author: "这个爱酱不太聪明",
  url: "https://example.com",

  // ==================== Logo与头像 ====================
  useLogo: false,
  logoImage: "",
  navbarText: "这个爱酱不太聪明",
  authorImage: "/images/avatar.jpg",

  // ==================== 导航菜单 ====================
  menu: [
    { title: "首页", icon: "Home", url: "/" },
    { title: "归档", icon: "Archive", url: "/archives" },
    { title: "壁纸", icon: "Image", url: "/wallpaper" },
    { title: "关于我", icon: "User", url: "/about" },
  ],

  // ==================== 图片API配置 ====================
  // 文章封面图
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

  // 背景轮播图
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

  // 壁纸页面
  wallpaper: {
    pcApiUrls: [
      "https://t.alcy.cc/ycy",
      "https://t.alcy.cc/ysz",
      "https://t.alcy.cc/pc",
      "https://t.alcy.cc/moe",
      "https://t.alcy.cc/fj",
      "https://t.alcy.cc/bd",
      "https://t.alcy.cc/ys",
    ],
    batchSize: 12,
    maxImages: 120,
  },

  // ==================== 侧边栏配置 ====================
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

  // ==================== 功能配置 ====================
  // 代码高亮主题
  highlightTheme: "atom-one-dark",

  // 分页配置
  postsPerPage: 10,

  // ==================== 小组件配置 ====================
  // 音乐播放器
  musicPlayer: {
    enable: true,
    title: "歌单",
    playlistId: "8692231711",
    server: "tencent",
    autoplay: false,
    volume: 0.1,
    theme: "#cc543a",
  },

  // 看板娘
  sakanaWidget: {
    enable: true,
    position: {
      bottom: "10px",
      right: "10px",
    },
  },
};

export type SiteConfig = typeof siteConfig;
