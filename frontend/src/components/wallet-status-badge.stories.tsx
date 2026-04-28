import type { Meta, StoryObj } from "@storybook/react";
import { WalletStatusBadge } from "./wallet-status-badge";

const DEMO_ADDRESS = "GDHDNRH7MGDYHXE3OLVMB4TBBGXLDKLUWZSPJQ6XKGFRMVF5YPB3MHX";

const meta: Meta<typeof WalletStatusBadge> = {
  title: "Core/WalletStatusBadge",
  component: WalletStatusBadge,
  tags: ["autodocs"],
  argTypes: {
    isLoading: { control: "boolean" },
    isCompact: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof WalletStatusBadge>;

export const Connected: Story = {
  args: {
    wallet: {
      address: DEMO_ADDRESS,
      network: "testnet",
      health: "healthy",
      balance: 1250.75,
    },
  },
};

export const Disconnected: Story = {
  args: { wallet: null },
};

export const Loading: Story = {
  args: { wallet: null, isLoading: true },
};

export const Degraded: Story = {
  args: {
    wallet: {
      address: DEMO_ADDRESS,
      network: "mainnet",
      health: "degraded",
      balance: 500,
    },
  },
};

export const Compact: Story = {
  args: {
    wallet: {
      address: DEMO_ADDRESS,
      network: "testnet",
      health: "healthy",
      balance: 3000,
    },
    isCompact: true,
  },
};

export const Mainnet: Story = {
  args: {
    wallet: {
      address: DEMO_ADDRESS,
      network: "mainnet",
      health: "healthy",
      balance: 10_000,
    },
  },
};
