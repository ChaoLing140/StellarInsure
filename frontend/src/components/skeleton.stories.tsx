import type { Meta, StoryObj } from "@storybook/react";
import { Skeleton, SkeletonText } from "./skeleton";

const meta: Meta<typeof Skeleton> = {
  title: "Core/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Block: Story = {
  args: { style: { width: 200, height: 40 } },
};

export const Circle: Story = {
  args: { style: { width: 48, height: 48, borderRadius: "50%" } },
};

export const CardPlaceholder: Story = {
  render: () => (
    <div style={{ width: 320, padding: 16, border: "1px solid #e2e8f0", borderRadius: 8 }}>
      <Skeleton style={{ width: "100%", height: 120, marginBottom: 12 }} />
      <SkeletonText lines={3} />
    </div>
  ),
};

export const TextLines: StoryObj<typeof SkeletonText> = {
  render: () => <SkeletonText lines={4} style={{ width: 320 }} />,
};

export const InlineRow: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Skeleton style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0 }} />
      <SkeletonText lines={2} style={{ flex: 1 }} />
    </div>
  ),
};
