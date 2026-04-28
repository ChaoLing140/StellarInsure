import type { Meta, StoryObj } from "@storybook/react";
import { Icon, type IconName } from "./icon";

const ALL_ICONS: IconName[] = [
  "alert", "calendar", "check", "clock", "document", "globe", "heart",
  "language", "shield", "spark", "wallet", "arrow-up-right", "chevron-down",
  "chevron-up", "help", "refresh", "plus", "close", "grid-3x3", "list",
  "chevron-up-down", "zap", "alert-triangle", "activity", "layers",
  "trending-up", "trending-down", "verify", "alert-circle", "copy",
  "upload", "trash", "edit", "chevron-right",
];

const meta: Meta<typeof Icon> = {
  title: "Core/Icon",
  component: Icon,
  tags: ["autodocs"],
  argTypes: {
    name: { control: "select", options: ALL_ICONS },
    size: { control: "radio", options: ["sm", "md", "lg"] },
    tone: {
      control: "select",
      options: ["default", "muted", "accent", "warning", "success", "danger", "contrast"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Icon>;

export const Default: Story = {
  args: { name: "shield", size: "md", tone: "default" },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
      <Icon name="shield" size="sm" />
      <Icon name="shield" size="md" />
      <Icon name="shield" size="lg" />
    </div>
  ),
};

export const Tones: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
      {(["default", "muted", "accent", "warning", "success", "danger"] as const).map(
        (tone) => <Icon key={tone} name="check" size="lg" tone={tone} label={tone} />,
      )}
    </div>
  ),
};

export const AllIcons: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
      {ALL_ICONS.map((name) => (
        <div
          key={name}
          title={name}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, width: 56 }}
        >
          <Icon name={name} size="md" />
          <span style={{ fontSize: 9, textAlign: "center", wordBreak: "break-all" }}>{name}</span>
        </div>
      ))}
    </div>
  ),
};
