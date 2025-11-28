# VendorElect

**FHE-Powered Vendor Potential Rating System**

A decentralized application that enables enterprises to assess vendor potential using Fully Homomorphic Encryption (FHE), ensuring complete data privacy while performing on-chain calculations.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Network](https://img.shields.io/badge/network-Sepolia-purple.svg)
![FHE](https://img.shields.io/badge/powered%20by-Zama%20FHEVM-green.svg)

## Problem Statement

Traditional vendor assessment systems require enterprises to expose sensitive business metrics (revenue, employee count, tax records) to third-party evaluators. This creates:

- **Privacy risks**: Confidential business data exposed during evaluation
- **Trust issues**: Reliance on centralized entities to handle sensitive information
- **Compliance challenges**: Difficulty meeting data protection regulations (GDPR, etc.)

## Solution

VendorElect leverages **Fully Homomorphic Encryption (FHE)** to solve this problem:

1. **Client-side encryption**: All sensitive data is encrypted in the browser before submission
2. **On-chain FHE computation**: Smart contract performs rating calculations on encrypted data
3. **User-controlled decryption**: Only the data owner can decrypt and view results

**Result**: Complete vendor assessment without ever exposing plaintext business data.

## How It Works

### Rating Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Browser   │────▶│  Smart       │────▶│   Browser   │
│  Encrypt    │     │  Contract    │     │  Decrypt    │
│  6 metrics  │     │  FHE Calc    │     │  Results    │
└─────────────┘     └──────────────┘     └─────────────┘
```

### Rating Indicators (6 metrics)

| Indicator | Grade A | Grade B | Grade C |
|-----------|---------|---------|---------|
| Registered Capital | >$10M | $3M-$10M | <$3M |
| Years in Business | 5+ years | 3-5 years | <3 years |
| Employee Count | 200+ | 50-200 | <50 |
| Annual Tax Payment | >$5M | $1M-$5M | <$1M |
| Annual Revenue | >$50M | $10M-$50M | <$10M |
| Litigation Record | None | - | Has Record |

### Grading Rules

- **Grade A**: ≥4 metrics at A-level AND no litigation record
- **Grade B**: ≥4 metrics at B-level or above AND no litigation record  
- **Grade C**: All other cases

## Tech Stack

### Smart Contract
- **Solidity 0.8.24** with FHEVM
- **Zama FHEVM** for FHE operations
- **Hardhat** for development & deployment

### Frontend
- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS** with custom Renaissance Glassmorphism theme
- **wagmi + Web3Modal** for wallet connection
- **@zama-fhe/relayer-sdk** for FHE encryption/decryption

## Project Structure

```
VendorElect/
├── contracts/              # Smart contract
│   ├── src/
│   │   └── VendorElect.sol # Main FHE contract
│   ├── scripts/
│   │   └── deploy.ts       # Deployment script
│   └── hardhat.config.ts
├── frontend/               # Next.js frontend
│   ├── src/
│   │   ├── app/           # Pages
│   │   ├── components/    # React components
│   │   └── lib/           # Utilities & FHE client
│   └── package.json
└── README.md
```

## Deployment

### Contract (Sepolia Testnet)

**Contract Address**: `0x635594B5C1cD97273139D0A4e03822EBDE122CE4`

[View on Etherscan](https://sepolia.etherscan.io/address/0x635594B5C1cD97273139D0A4e03822EBDE122CE4#code)

### Local Development

```bash
# Clone the repository
git clone https://github.com/jennahaaa/VendorElect.git
cd VendorElect

# Install contract dependencies
cd contracts
pnpm install

# Install frontend dependencies
cd ../frontend
pnpm install

# Run frontend
pnpm dev
```

### Testing

```bash
cd contracts
pnpm test
```

**Test Coverage:**

| Category | Tests | Description |
|----------|-------|-------------|
| Deployment | 4 | Contract deployment & initial state |
| View Functions | 2 | `getOverallGrade`, `getItemGrades` |
| Access Control | 1 | Multi-user isolation |
| Documentation | 3 | Rating rules & FHE security model |

**Note**: FHE operations (encryption/decryption) require the live FHEVM network (Sepolia) and cannot be simulated locally. These are tested through the frontend integration on testnet.

## Usage

1. **Connect Wallet**: Click "Connect Wallet" and select your wallet (auto-switches to Sepolia)
2. **Select Indicators**: Choose one tier (A/B/C) for each of the 6 business metrics
3. **Encrypt & Submit**: Data is encrypted client-side and submitted to the blockchain
4. **Decrypt Result**: Sign to authorize decryption and view your rating

## Business Potential

VendorElect addresses a real market need in B2B vendor management:

- **Target Market**: Enterprise procurement departments, supply chain managers
- **Use Cases**: 
  - Pre-qualification screening
  - Ongoing vendor risk assessment
  - Compliance-friendly due diligence
- **Revenue Model**: SaaS subscription for enterprise deployments
- **Scalability**: Can extend to other confidential scoring systems (credit, insurance, etc.)

## Security

- All sensitive data encrypted using Zama's TFHE scheme
- No plaintext data ever touches the blockchain
- User-controlled decryption with EIP-712 signatures
- Contract verified on Etherscan

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

- [Zama](https://www.zama.ai/) for FHEVM technology
- Built for the [Zama Developer Program](https://www.zama.ai/programs/developer-program)

