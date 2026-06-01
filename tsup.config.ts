import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: { core: "src/core/index.ts" },
    format: ["cjs", "esm"],
    dts: true,
    sourcemap: true,
    clean: true,
    external: ["react", "react-native"],
  },
  {
    entry: { react: "src/react/index.ts" },
    format: ["cjs", "esm"],
    dts: true,
    sourcemap: true,
    external: ["react", "react-dom"],
  },
  {
    entry: { "react-native": "src/react-native/index.ts" },
    format: ["cjs", "esm"],
    dts: true,
    sourcemap: true,
    external: ["react", "react-native", "expo-av", "react-native-sound"],
  },
]);
