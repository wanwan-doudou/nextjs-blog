import nextPlugin from "@next/eslint-plugin-next";
import reactPlugin from "eslint-plugin-react";
import hooksPlugin from "eslint-plugin-react-hooks";

export default [
  // React recommended (Flat config)
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat["jsx-runtime"],
  
  // Custom configuration for Next.js and React Hooks
  {
    plugins: {
      "@next/next": nextPlugin,
      "react-hooks": hooksPlugin,
    },
    rules: {
      ...hooksPlugin.configs.recommended.rules,
      ...nextPlugin.configs["recommended"].rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  
  // Ignores
  {
      ignores: [".next/"],
  }
];
