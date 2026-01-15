## Web3 Wallet Trial (Vue 3 + Vite + TypeScript)

A small, production-style Web3 wallet dashboard built with **Vue 3 + TypeScript + Vite**, using **Pinia** for state management, **Tailwind CSS v4** for styling, **web3.js v4** for EVM interactions, and **vue-sonner** for toasts.

The app focuses on:
- Clean architecture and folder structure
- Safe Web3 integration (MetaMask, EIP-1193)
- Token balances (fixed tokens + custom ERC-20)
- Centralized, user-friendly error handling

---

## Tech Stack

- **Vue 3** (Composition API)
- **TypeScript**
- **Vite 5**
- **Pinia 2**
- **Tailwind CSS v4** via `@tailwindcss/vite` (no PostCSS config)
- **web3.js v4** (EVM)
- **vue-sonner** (toast notifications)

---

## Project Structure (src/)
src/
├─ app/
│  ├─ App.vue                 # Root component, wires layout + feature cards
│  └─ main-layout.vue         # App shell, header, theme toggle
│
├─ components/
│  ├─ wallet/
│  │  └─ WalletConnect.vue    # Wallet connect/disconnect UI + status
│  ├─ token-balance-card/
│  │  ├─ TokenBalancesCard.vue # USDC/USDT balances section
│  │  └─ TokenBalanceCard.vue  # Single token balance card
│  ├─ custom-token-balance/
│  │  └─ CustomTokenBalanceCard.vue # Custom ERC-20 balance UI
│  └─ ui/
│     ├─ StatusBadge.vue
│     ├─ InlineAlert.vue
│     ├─ Skeleton.vue
│     ├─ SectionHeader.vue
│     └─ CopyButton.vue
│
├─ config/
│  ├─ chains.ts               # Supported chains configuration
│  ├─ tokens.ts               # Token metadata (USDC, USDT) per chain
│  └─ rpc.ts                  # RPC URLs per chain
│
├─ features/
│  └─ tokens/
│     └─ core/
│        └─ erc20.ts          # ERC-20 read helpers (balanceOf, decimals, symbol)
│
├─ messages/
│  ├─ errors.ts               # ERROR_MESSAGES, ErrorKey
│  └─ success.ts              # SUCCESS_MESSAGES
│
├─ shared/
│  ├─ composables/
│  │  └─ useCopyAddress.ts
│  ├─ types/
│  │  ├─ index.ts
│  │  └─ window.d.ts
│  └─ utils/
│     ├─ index.ts
│     ├─ clipboard.ts
│     ├─ epoch.ts
│     ├─ wallet.ts
│     ├─ web3.ts
│     └─ web3ErrorMapper.ts
│
├─ store/
│  ├─ wallet/
│  │  ├─ wallet.ts
│  │  └─ index.ts
│  ├─ tokenBalances/
│  │  ├─ tokenBalances.ts
│  │  └─ index.ts
│  └─ customTokenBalance/
│     ├─ customTokenBalance.ts
│     └─ index.ts
│
├─ theme/
│  └─ useTheme.ts
│
├─ wallet/
│  ├─ adapters/
│  │  ├─ index.ts
│  │  └─ metamask.ts
│  └─ core/
│     └─ types.ts
│
├─ styles/
│  └─ main.css
│
├─ main.ts
└─ vite-env.d.ts
---

## Scripts

```bash
# Start dev server
npm run dev

# Type-check + production build
npm run build

# Preview production build
npm run preview
```

---

## Supported Networks

The app supports the following EVM networks:
- **Ethereum Mainnet** (chainId: 1)
- **Ethereum Sepolia** (chainId: 11155111)
- **BNB Chain Mainnet** (chainId: 56)
- **BNB Chain Testnet** (chainId: 97) – recommended for testing
- **Base Mainnet** (chainId: 8453)
- **Base Sepolia** (chainId: 84532)

Token balances (USDC/USDT) are available on configured chains. See `src/config/tokens.ts` for token addresses per chain.

---

## Web3 Features

### Wallet (MetaMask)

- Detects installed wallets (currently MetaMask via `MetaMaskAdapter`)
- Connect / disconnect (local) via Pinia store `useWalletStore`
- Tracks:
  - `installedWallets`, `activeWalletId`
  - `status` (`idle | connecting | connected | error`)
  - `account`, `accounts`
  - `chainIdHex`, `chainIdDec`
  - `epoch` for stale-guard
- Normalized events:
  - `accountsChanged`
  - `chainChanged`
  - `disconnect`
- Toasts:
  - Connect success
  - User rejection
  - Technical connect error
  - Account switch
  - Disconnect (info)

### Token Balances (USDC/USDT)

- Config-driven via `config/tokens.ts`
- Uses `web3.js` + `getErc20Balance` for:
  - `balanceOf`
  - `decimals` (with fallback & logging)
  - `symbol`
- Pinia store `useTokenBalancesStore`:
  - Balances for `USDC`, `USDT`
  - `status` per token: `ok | na | error | loading`
  - `fetchEpoch` guard to avoid stale responses
- UI:
  - `TokenBalancesCard.vue` shows:
    - Network info with chain ID
    - Not-connected state
    - Unsupported network warning
    - Error state (mapped via `ErrorKey`) with retry button
    - Per-token cards with status badge + balance value
    - Skeleton loading states

### Custom Token Balance

- `CustomTokenBalanceCard.vue` + `useCustomTokenBalanceStore`
- User inputs any ERC-20 contract address on the current chain
- Validates:
  - Wallet connected
  - Non-empty input
  - Valid Ethereum address format (0x...)
- On "Check Balance":
  - Calls `getErc20Balance` for the given contract + account
  - Uses its own `fetchEpoch` + wallet epoch to avoid stale results
  - Handles success / error / loading states
- Displays:
  - Token balance (formatted)
  - Decimals
  - Contract address (shortened) with copy button
  - Clear button to reset state

---

## Error Handling & Messages

- All user-facing **error messages** come from `src/messages/errors.ts`:
  - `ERROR_MESSAGES` (as `const`)
  - `ErrorKey = keyof typeof ERROR_MESSAGES`
- All user-facing **success/info messages** (toasts, helper text, labels) come from:
  - `src/messages/success.ts`
- Core pattern:
  - Web3 / provider errors are passed through `web3ErrorMapper.ts`
  - `web3ErrorMapper` inspects raw `Error` / Web3 error objects and returns an `ErrorKey`
  - Pinia stores keep only `errorKey: ErrorKey | null` in state
  - UI components render `ERROR_MESSAGES[store.errorKey]` and never show raw blockchain / RPC messages

This keeps blockchain/Web3 technical details out of the UI while giving users clear, consistent feedback.

---

## Tailwind CSS v4 Setup

- Uses `@tailwindcss/vite`:
  - Configured in `vite.config.ts` via `tailwindcss()` plugin
- No `postcss.config.js`, no manual autoprefixer
- Global styles imported in `src/main.ts`:

```ts
import './styles/main.css'
```

---

## UI/UX Features

- **Modern, clean design**:
  - Professional Web3 wallet interface
  - Mobile-first responsive layout
  - Dark mode support (toggle in header)
  - Smooth transitions and animations
- **Shared UI components**:
  - `StatusBadge` – connection status indicators
  - `InlineAlert` – contextual alerts (info/warning/error)
  - `Skeleton` – loading placeholders
  - `SectionHeader` – consistent section titles
  - `CopyButton` – one-click address copying
- **User experience**:
  - Clear state indicators (connected/disconnected/loading/error)
  - Friendly error messages (no technical jargon)
  - Toast notifications for important actions
  - Touch-friendly buttons (min 44px height)
  - Keyboard navigation support

---

## Development Notes

- **Dark mode**:
  - Controlled by `useTheme()` (`src/theme/useTheme.ts`)
  - Applies `class="dark"` on `document.documentElement`
  - Initialized **before** app mount in `main.ts` to avoid flicker
  - Persisted in `localStorage`
- **Stale-request protection**:
  - All async Web3 calls that update state use an `epoch` pattern:
    - Each request snapshots an epoch value
    - Before committing, checks `isStaleRequest(currentEpoch, expectedEpoch)`
  - Prevents race conditions when user switches account/chain quickly
  - Implemented in:
    - `useWalletStore` – wallet connection/account changes
    - `useTokenBalancesStore` – token balance fetches
    - `useCustomTokenBalanceStore` – custom token queries
- **Console logging**:
  - Only for dev/debug (e.g., Web3 error details, clipboard failures)
  - Never displayed directly to users
- **Code splitting**:
  - Vendor chunks separated (vue, web3, ui libraries)
  - Optimized bundle size for production

---

## Getting Started

```bash
npm install
npm run dev
```

Then open the local dev URL printed by Vite (typically `http://localhost:5173`) and:

1. Ensure MetaMask is installed and on a supported network (e.g. BNB Testnet for token balances).
2. Connect wallet via the **Wallet Connection** card.
3. Check:
   - USDC/USDT balances in **Token Balances** card.
   - Custom ERC-20 balances in **Custom Token Balance** card.

