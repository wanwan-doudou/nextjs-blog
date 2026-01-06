declare namespace JSX {
  interface IntrinsicElements {
    "meting-js": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        id?: string;
        server?: string;
        type?: string;
        auto?: string;
        fixed?: string;
        mini?: string;
        autoplay?: string | boolean;
        theme?: string;
        loop?: string;
        order?: string;
        preload?: string;
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
