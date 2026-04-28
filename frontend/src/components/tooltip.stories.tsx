import type { Meta, StoryObj } from "@storybook/react";
import { Tooltip } from "./tooltip";

const meta: Meta<typeof Tooltip> = {
  title: "Core/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  argTypes: {
    placement: { control: "select", options: ["top", "bottom", "left", "right"] },
    showDelay: { control: { type: "number", min: 0, max: 2000 } },
    hideDelay: { control: { type: "number", min: 0, max: 2000 } },
  },
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  args: {
    content: "This is a helpful tooltip",
    placement: "top",
  },
  render: (args) => (
    <div style={{ padding: 64, display: "flex", justifyContent: "center" }}>
      <Tooltip {...args}>
        <button type="button">Hover me</button>
      </Tooltip>
    </div>
  ),
};

export const Placements: Story = {
  render: () => (
    <div style={{ padding: 80, display: "flex", gap: 24, justifyContent: "center" }}>
      {(["top", "bottom", "left", "right"] as const).map((placement) => (
        <Tooltip key={placement} content={`Placement: ${placement}`} placement={placement}>
          <button type="button">{placement}</button>
        </Tooltip>
      ))}
    </div>
  ),
};

export const NoDelay: Story = {
  args: {
    content: "Appears instantly",
    placement: "top",
    showDelay: 0,
    hideDelay: 0,
  },
  render: (args) => (
    <div style={{ padding: 64, display: "flex", justifyContent: "center" }}>
      <Tooltip {...args}>
        <button type="button">No delay</button>
      </Tooltip>
    </div>
  ),
};
