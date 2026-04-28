# Frontend Architecture Guide

## Overview

The StellarInsure frontend is built with Next.js 14, TypeScript, and Tailwind CSS. It provides a modern, responsive interface for creating policies, submitting claims, and managing risk pool participation.

## Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.x | React framework with SSR/SSG |
| TypeScript | 5.x | Type-safe development |
| Tailwind CSS | 3.x | Utility-first styling |
| Freighter | Latest | Stellar wallet integration |
| Stellar SDK | Latest | Blockchain interactions |
| React Query | 5.x | Data fetching and caching |
| Zustand | 4.x | State management |
| Playwright | Latest | E2E testing |
| Storybook | 7.x | Component development |

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js 14 app directory
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   ├── globals.css         # Global styles
│   │   ├── tokens.css          # Design tokens
│   │   ├── create/             # Policy creation
│   │   │   ├── page.tsx
│   │   │   └── create-page-client.tsx
│   │   ├── policies/           # Policy management
│   │   │   ├── page.tsx
│   │   │   ├── policies-list-page-client.tsx
│   │   │   └── [policyId]/
│   │   │       ├── page.tsx
│   │   │       └── policy-detail-page-client.tsx
│   │   ├── claims/             # Claim submission
│   │   │   └── [claimId]/
│   │   │       ├── page.tsx
│   │   │       └── claim-detail-page-client.tsx
│   │   ├── history/            # Transaction history
│   │   │   ├── page.tsx
│   │   │   └── history-page-client.tsx
│   │   ├── treasury/           # Treasury dashboard
│   │   │   ├── page.tsx
│   │   │   └── treasury-page-client.tsx
│   │   ├── settings/           # User settings
│   │   │   ├── page.tsx
│   │   │   └── settings-page-client.tsx
│   │   └── legal/              # Legal pages
│   │       ├── layout.tsx
│   │       ├── privacy/
│   │       └── terms/
│   ├── components/             # Reusable components
│   │   ├── ui/                 # Base UI components
│   │   ├── policy/             # Policy-specific components
│   │   ├── claim/              # Claim-specific components
│   │   ├── pool/               # Risk pool components
│   │   └── wallet/             # Wallet integration
│   ├── lib/                    # Utilities and helpers
│   │   ├── stellar.ts          # Stellar SDK wrapper
│   │   ├── contract.ts         # Smart contract interactions
│   │   ├── api.ts              # Backend API client
│   │   └── utils.ts            # Helper functions
│   ├── hooks/                  # Custom React hooks
│   │   ├── useWallet.ts        # Wallet connection
│   │   ├── usePolicies.ts      # Policy data fetching
│   │   ├── useClaims.ts        # Claim data fetching
│   │   └── usePool.ts          # Pool data fetching
│   ├── stores/                 # Zustand state stores
│   │   ├── walletStore.ts      # Wallet state
│   │   ├── policyStore.ts      # Policy state
│   │   └── uiStore.ts          # UI state
│   └── types/                  # TypeScript types
│       ├── policy.ts
│       ├── claim.ts
│       └── pool.ts
├── e2e/                        # Playwright E2E tests
│   ├── home.spec.ts
│   ├── navigation.spec.ts
│   ├── policies.spec.ts
│   └── visual-regression.spec.ts
├── .storybook/                 # Storybook configuration
│   ├── main.ts
│   └── preview.ts
├── public/                     # Static assets
├── next.config.js              # Next.js configuration
├── tailwind.config.js          # Tailwind configuration
├── playwright.config.ts        # Playwright configuration
└── package.json
```

## Component Architecture

### Page Components

Pages are split into server and client components following Next.js 14 patterns:

**Server Component (page.tsx):**
```typescript
// app/policies/page.tsx
import { Metadata } from 'next';
import PoliciesListPageClient from './policies-list-page-client';

export const metadata: Metadata = {
  title: 'My Policies | StellarInsure',
  description: 'View and manage your insurance policies'
};

export default function PoliciesPage() {
  return <PoliciesListPageClient />;
}
```

**Client Component (policies-list-page-client.tsx):**
```typescript
'use client';

import { usePolicies } from '@/hooks/usePolicies';
import { PolicyCard } from '@/components/policy/PolicyCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function PoliciesListPageClient() {
  const { policies, isLoading, error } = usePolicies();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Policies</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {policies.map(policy => (
          <PolicyCard key={policy.id} policy={policy} />
        ))}
      </div>
    </div>
  );
}
```

### Reusable Components

**PolicyCard Component:**
```typescript
// components/policy/PolicyCard.tsx
import { Policy } from '@/types/policy';
import { formatXLM, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface PolicyCardProps {
  policy: Policy;
}

export function PolicyCard({ policy }: PolicyCardProps) {
  const statusColor = {
    active: 'green',
    expired: 'gray',
    cancelled: 'red',
    claim_pending: 'yellow'
  }[policy.status];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold">Policy #{policy.id}</h3>
        <Badge color={statusColor}>{policy.status}</Badge>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Type:</span>
          <span className="font-medium">{policy.policy_type}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Coverage:</span>
          <span className="font-medium">{formatXLM(policy.coverage_amount)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Premium:</span>
          <span className="font-medium">{formatXLM(policy.premium)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Expires:</span>
          <span className="font-medium">{formatDate(policy.end_time)}</span>
        </div>
      </div>
      
      <Button href={`/policies/${policy.id}`} variant="primary" fullWidth>
        View Details
      </Button>
    </div>
  );
}
```

## State Management

### Wallet State (Zustand)

```typescript
// stores/walletStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WalletState {
  address: string | null;
  isConnected: boolean;
  network: 'testnet' | 'mainnet';
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: (network: 'testnet' | 'mainnet') => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      address: null,
      isConnected: false,
      network: 'testnet',
      
      connect: async () => {
        try {
          const freighter = await import('@stellar/freighter-api');
          const { address } = await freighter.requestAccess();
          set({ address, isConnected: true });
        } catch (error) {
          console.error('Failed to connect wallet:', error);
          throw error;
        }
      },
      
      disconnect: () => {
        set({ address: null, isConnected: false });
      },
      
      switchNetwork: (network) => {
        set({ network });
      }
    }),
    {
      name: 'wallet-storage'
    }
  )
);
```

### Data Fetching (React Query)

```typescript
// hooks/usePolicies.ts
import { useQuery } from '@tanstack/react-query';
import { useWalletStore } from '@/stores/walletStore';
import { api } from '@/lib/api';

export function usePolicies() {
  const address = useWalletStore(state => state.address);
  
  return useQuery({
    queryKey: ['policies', address],
    queryFn: () => api.policies.list(),
    enabled: !!address,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000 // 1 minute
  });
}

export function usePolicy(policyId: number) {
  return useQuery({
    queryKey: ['policy', policyId],
    queryFn: () => api.policies.get(policyId),
    enabled: !!policyId
  });
}
```

## Routing

Next.js 14 App Router with file-based routing:

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `app/page.tsx` | Home page |
| `/create` | `app/create/page.tsx` | Create new policy |
| `/policies` | `app/policies/page.tsx` | List all policies |
| `/policies/[id]` | `app/policies/[id]/page.tsx` | Policy details |
| `/claims/[id]` | `app/claims/[id]/page.tsx` | Claim details |
| `/history` | `app/history/page.tsx` | Transaction history |
| `/treasury` | `app/treasury/page.tsx` | Treasury dashboard |
| `/settings` | `app/settings/page.tsx` | User settings |
| `/legal/privacy` | `app/legal/privacy/page.tsx` | Privacy policy |
| `/legal/terms` | `app/legal/terms/page.tsx` | Terms of service |

### Dynamic Routes

```typescript
// app/policies/[policyId]/page.tsx
interface PageProps {
  params: { policyId: string };
}

export default function PolicyDetailPage({ params }: PageProps) {
  return <PolicyDetailPageClient policyId={parseInt(params.policyId)} />;
}

// Generate static params for SSG
export async function generateStaticParams() {
  const policies = await fetchAllPolicies();
  return policies.map(policy => ({
    policyId: policy.id.toString()
  }));
}
```

## Wallet Integration

### Freighter Wallet Connection

```typescript
// lib/stellar.ts
import * as StellarSdk from '@stellar/stellar-sdk';
import { isConnected, requestAccess, signTransaction } from '@stellar/freighter-api';

export class StellarClient {
  private server: StellarSdk.Server;
  private network: string;

  constructor(network: 'testnet' | 'mainnet' = 'testnet') {
    this.network = network;
    const rpcUrl = network === 'testnet'
      ? 'https://soroban-testnet.stellar.org'
      : 'https://soroban-mainnet.stellar.org';
    this.server = new StellarSdk.Server(rpcUrl);
  }

  async connectWallet(): Promise<string> {
    const connected = await isConnected();
    if (!connected) {
      throw new Error('Freighter wallet not installed');
    }
    
    const { address } = await requestAccess();
    return address;
  }

  async signAndSubmit(transaction: StellarSdk.Transaction): Promise<string> {
    const xdr = transaction.toXDR();
    const signedXDR = await signTransaction(xdr, {
      network: this.network,
      networkPassphrase: this.network === 'testnet'
        ? StellarSdk.Networks.TESTNET
        : StellarSdk.Networks.PUBLIC
    });
    
    const signedTx = StellarSdk.TransactionBuilder.fromXDR(
      signedXDR,
      this.network === 'testnet'
        ? StellarSdk.Networks.TESTNET
        : StellarSdk.Networks.PUBLIC
    );
    
    const result = await this.server.submitTransaction(signedTx);
    return result.hash;
  }
}
```

### Contract Interactions

```typescript
// lib/contract.ts
import * as StellarSdk from '@stellar/stellar-sdk';
import { StellarClient } from './stellar';

export class StellarInsureContract {
  private client: StellarClient;
  private contractId: string;

  constructor(contractId: string, network: 'testnet' | 'mainnet' = 'testnet') {
    this.client = new StellarClient(network);
    this.contractId = contractId;
  }

  async createPolicy(params: {
    policyholder: string;
    policyType: string;
    coverageAmount: string;
    premium: string;
    duration: number;
    triggerCondition: string;
  }): Promise<number> {
    const contract = new StellarSdk.Contract(this.contractId);
    
    const tx = new StellarSdk.TransactionBuilder(
      await this.client.server.getAccount(params.policyholder),
      {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.TESTNET
      }
    )
      .addOperation(
        contract.call(
          'create_policy',
          StellarSdk.Address.fromString(params.policyholder).toScVal(),
          StellarSdk.nativeToScVal(params.policyType, { type: 'symbol' }),
          StellarSdk.nativeToScVal(params.coverageAmount, { type: 'i128' }),
          StellarSdk.nativeToScVal(params.premium, { type: 'i128' }),
          StellarSdk.nativeToScVal(params.duration, { type: 'u64' }),
          StellarSdk.nativeToScVal(params.triggerCondition, { type: 'string' })
        )
      )
      .setTimeout(30)
      .build();

    const hash = await this.client.signAndSubmit(tx);
    
    // Parse policy ID from transaction result
    const result = await this.client.server.getTransaction(hash);
    return this.parsePolicyId(result);
  }

  async calculatePremium(params: {
    policyType: string;
    coverageAmount: string;
    duration: number;
  }): Promise<string> {
    const contract = new StellarSdk.Contract(this.contractId);
    
    const result = await contract.call(
      'calculate_premium',
      StellarSdk.nativeToScVal(params.policyType, { type: 'symbol' }),
      StellarSdk.nativeToScVal(params.coverageAmount, { type: 'i128' }),
      StellarSdk.nativeToScVal(params.duration, { type: 'u64' })
    );
    
    return StellarSdk.scValToNative(result);
  }
}
```

## Styling

### Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1'
        },
        secondary: {
          50: '#faf5ff',
          500: '#a855f7',
          600: '#9333ea'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography')
  ]
};
```

### Design Tokens

```css
/* app/tokens.css */
:root {
  --color-primary: #0ea5e9;
  --color-secondary: #a855f7;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  
  --border-radius-sm: 0.25rem;
  --border-radius-md: 0.375rem;
  --border-radius-lg: 0.5rem;
  --border-radius-xl: 0.75rem;
}
```

## Testing

### E2E Tests (Playwright)

```typescript
// e2e/policies.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Policy Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('text=Connect Wallet');
    // Mock wallet connection
  });

  test('should create a new policy', async ({ page }) => {
    await page.goto('/create');
    
    await page.selectOption('[name="policyType"]', 'weather');
    await page.fill('[name="coverageAmount"]', '10000');
    await page.fill('[name="duration"]', '30');
    await page.fill('[name="triggerCondition"]', 'rainfall < 50mm');
    
    await page.click('button:has-text("Calculate Premium")');
    await expect(page.locator('.premium-amount')).toBeVisible();
    
    await page.click('button:has-text("Create Policy")');
    await expect(page).toHaveURL(/\/policies\/\d+/);
  });

  test('should display policy list', async ({ page }) => {
    await page.goto('/policies');
    
    await expect(page.locator('.policy-card')).toHaveCount(3);
    await expect(page.locator('text=Policy #1')).toBeVisible();
  });
});
```

### Component Tests (Storybook)

```typescript
// components/policy/PolicyCard.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { PolicyCard } from './PolicyCard';

const meta: Meta<typeof PolicyCard> = {
  title: 'Policy/PolicyCard',
  component: PolicyCard,
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof PolicyCard>;

export const Active: Story = {
  args: {
    policy: {
      id: 1,
      policy_type: 'weather',
      coverage_amount: '10000000000',
      premium: '500000000',
      status: 'active',
      end_time: Date.now() / 1000 + 2592000
    }
  }
};

export const Expired: Story = {
  args: {
    policy: {
      ...Active.args.policy,
      status: 'expired',
      end_time: Date.now() / 1000 - 86400
    }
  }
};
```

## Performance Optimization

1. **Code Splitting:**
   - Dynamic imports for heavy components
   - Route-based code splitting

2. **Image Optimization:**
   - Next.js Image component
   - WebP format with fallbacks

3. **Caching:**
   - React Query for data caching
   - Service worker for offline support

4. **Bundle Size:**
   - Tree shaking
   - Minimize dependencies
   - Lazy loading

## Deployment

### Build Process

```bash
# Install dependencies
npm install

# Run type checking
npm run type-check

# Run linting
npm run lint

# Run tests
npm run test

# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables

```env
# .env.production
NEXT_PUBLIC_STELLAR_NETWORK=mainnet
NEXT_PUBLIC_CONTRACT_ID=CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_API_URL=https://api.stellarinsure.io
NEXT_PUBLIC_HORIZON_URL=https://horizon.stellar.org
```

## Accessibility

All components follow WCAG 2.1 Level AA guidelines:

- Semantic HTML
- ARIA labels and roles
- Keyboard navigation
- Screen reader support
- Color contrast ratios
- Focus indicators

## Browser Support

- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Mobile browsers (iOS Safari, Chrome Android)
