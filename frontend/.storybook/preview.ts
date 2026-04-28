import type { Preview } from "@storybook/react";
import "../src/app/globals.css";
import "../src/app/tokens.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /date$/i,
      },
    },
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "#ffffff" },
        { name: "dark", value: "#0f1117" },
        { name: "surface", value: "#f5f6fa" },
      ],
    },
  },
};

export default preview;
