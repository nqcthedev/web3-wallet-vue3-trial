## Web3 Wallet Trial (Vue 3 + Vite + TypeScript)

A production-style Web3 wallet dashboard with MetaMask integration, token balances (USDC/USDT + custom ERC-20), and centralized error handling.

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

```
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
```

---

## Scripts

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview build
```

---

## Features

### Wallet (MetaMask)

- Detects installed wallets (currently MetaMask via `MetaMaskAdapter`)
- Connect / disconnect via Pinia store `useWalletStore`
- Tracks account, chain, status with epoch-based stale-guard
- Handles `accountsChanged`, `chainChanged`, `disconnect` events

### Token Balances (USDC/USDT)

- Config-driven via `config/tokens.ts`
- Uses `web3.js` + `getErc20Balance` for balance, decimals, symbol
- Pinia store `useTokenBalancesStore` with status per token: `ok | na | error | loading`
- UI shows network info, unsupported network warning, error states with retry

### Custom Token Balance

- User inputs any ERC-20 contract address on the current chain
- Validates wallet connected, non-empty input, valid address format
- Displays formatted balance, decimals, contract address with copy button

---

## Error Handling & Messages

- All user-facing **error messages** come from `src/messages/errors.ts`
- All user-facing **success/info messages** come from `src/messages/success.ts`
- Web3/provider errors are mapped via `web3ErrorMapper.ts` to `ErrorKey`
- UI components render `ERROR_MESSAGES[store.errorKey]` and never show raw blockchain/RPC messages

---

## Supported Networks

- Ethereum Mainnet (1), Sepolia (11155111)
- BNB Chain Mainnet (56), Testnet (97)
- Base Mainnet (8453), Sepolia (84532)

---

## Getting Started

```bash
npm install
npm run dev
```

1. Install MetaMask and switch to a supported network (e.g., BNB Testnet)
2. Connect wallet via the **Wallet Connection** card
3. View token balances and check custom ERC-20 tokens
