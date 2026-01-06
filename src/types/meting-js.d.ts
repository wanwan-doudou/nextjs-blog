declare namespace JSX {
  interface IntrinsicElements {
    "meting-js": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        id?: string;
        server?: "netease" | "tencent" | "kugou" | "xiami" | "baidu";
        type?: "song" | "playlist" | "album" | "search" | "artist";
        auto?: string;
        fixed?: string;
        mini?: string;
        autoplay?: string | boolean;
        theme?: string;
        loop?: "all" | "one" | "none";
        order?: "list" | "random";
        preload?: "none" | "metadata" | "auto";
        volume?: string;
        mutex?: string;
        "lrc-type"?: string;
        "list-folded"?: string;
        "list-max-height"?: string;
        "storage-name"?: string;
      },
      HTMLElement
    >;
  }
}
