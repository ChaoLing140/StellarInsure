import type { Meta, StoryObj } from "@storybook/react";
import { StatusPill, type PolicyStatus } from "./status-pill";

const ALL_STATUSES: PolicyStatus[] = ["active", "expired", "claimed", "cancelled", "pending"];

const meta: Meta<typeof StatusPill> = {
  title: "Core/StatusPill",
  component: StatusPill,
  tags: ["autodocs"],
  argTypes: {
    status: { control: "select", options: ALL_STATUSES },
  },
};

export default meta;
type Story = StoryObj<typeof StatusPill>;

export const Active: Story = { args: { status: "active" } };
export const Expired: Story = { args: { status: "expired" } };
export const Claimed: Story = { args: { status: "claimed" } };
export const Cancelled: Story = { args: { status: "cancelled" } };
export const Pending: Story = { args: { status: "pending" } };

export const AllStatuses: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {ALL_STATUSES.map((status) => (
        <StatusPill key={status} status={status} />
      ))}
    </div>
  ),
};
