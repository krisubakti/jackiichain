#  Kiichain Multi-Wallet Staking Bot

Advanced automated staking bot for Kiichain network with multi-wallet support, beautiful CLI interface, and multiple staking strategies.

## Features

- **Multi-Wallet Support** - Manage up to 10 wallets simultaneously
- **Smart Validator Selection** - Choose from 6 trusted validators
- **Flexible Staking** - Multiple percentage options (10%, 20%, 30%, 40%, 50%, 70%)
- **Random Strategies** - Diversify across validators and percentages
- **Test Mode** - Safe simulation before live transactions
- **Balance Management** - Real-time balance checking and faucet suggestions
- **Beautiful Interface** - Colorful CLI with professional styling

 ## Supported Validators

- **Crosnest** (5% commission) 🟢
- **Nodeist** (5% commission) 🟢  
- **NodeStake** (5% commission) 🟢
- **KiiMidas** (10% commission) 🟡
- **LuckyStar** (10% commission) 🟡
- **ValKiirie** (10% commission) 🟡

## Installation

### Prerequisites
- Node.js 16.0.0 or higher
- npm or yarn package manager

### Quick Setup
```bash
# Clone repository
git clone https://github.com/krisubakti/jackiichain.git
cd jackiichain

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your wallet private keys
nano .env
```

## Configuration

### Environment Setup
Create `.env` file with your wallet private keys:

```bash
# Individual Wallets (Recommended)
WALLET_1=your_first_private_key_here
WALLET_1_NAME=Main Trading Wallet

WALLET_2=your_second_private_key_here
WALLET_2_NAME=Secondary Wallet

WALLET_3=your_third_private_key_here
WALLET_3_NAME=Backup Wallet

# Or Bulk Format
KIICHAIN_PRIVATE_KEYS=key1,key2,key3,key4,key5
```

**⚠️ SECURITY WARNING:**
- Never share your `.env` file
- Use different wallets for different risk levels
- Keep emergency wallets with minimal funds
- Private keys should NOT include "0x" prefix

## Usage

### Interactive Menu
```bash
# Start interactive bot
npm start
# or
node enhanced-main.js
```

### Quick Commands
```bash
# Demo mode
npm run demo

# Check balances
npm run balances

# Show validators
npm run validators

# Show configuration
npm run config
```

## Menu Options

### 1. Check All Wallet Balances
- Real-time balance checking
- Total portfolio summary
- Network status verification

### 2. Show Validator Pool
- Display all 6 supported validators
- Commission rates and status
- Validator websites and addresses

### 3. Start Stake (Choose Options)
Interactive staking with full control:
- **Wallet Selection**: Individual, all wallets, or random
- **Validator Choice**: Specific validator or random
- **Percentage**: 10%-70% or random selection
- **Confirmation**: Required before live transactions

### 4. Bulk Stake All Wallets
- Automatically stake from all wallets
- Random validator and percentage selection
- Perfect for portfolio diversification

### 5. Custom Stake Session
- Multiple rounds (1-10) with random combinations
- Test or live mode options
- Maximum diversification strategy

### 6. Bot Configuration
- View loaded wallets and balances
- Check environment variables
- Network and contract information

## Usage Examples

### Conservative Strategy
```bash
# Use menu option 3
# Select individual wallet
# Choose low commission validator (Crosnest/Nodeist)
# Stake 10-20% of balance
```

### Aggressive Strategy
```bash
# Use menu option 4 (Bulk stake all)
# Random validator selection
# Higher percentage allocation
```

### Diversification Strategy
```bash
# Use menu option 5 (Custom sessions)
# Multiple rounds with random combinations
# Spread across different validators
```

## Expected Output

```
KIICHAIN STAKING BOT
==================================================
[$] 1. Check All Wallet Balances
[฿] 2. Show Validator Pool
[↭] 3. Start Stake (Choose Options)
[⌂] 4. Bulk Stake All Wallets
[◊] 5. Custom Stake Session
[➤] 6. Bot Configuration
[✕] 0. Exit
==================================================
```

## 🔧 Troubleshooting

### Common Issues

**1. Insufficient Balance**
```
Error: Stake amount too small. Need at least 0.01 KII
Solution: Get faucet from https://faucet.kiichain.io/
```

**2. Network Connection**
```
Error: Failed to connect to network
Solution: Check internet connection and RPC endpoint
```

**3. Invalid Private Key**
```
Error: Failed to load wallet
Solution: Verify private key format (without 0x prefix)
```

### Getting Test Funds
- **Faucet**: https://faucet.kiichain.io/
- **Discord**: Join Kiichain Discord for faucet access
- **Requirements**: Minimum 0.1 KII for staking + gas fees

## Security Best Practices

1. **Never commit .env files**
2. **Use test amounts first**
3. **Keep backup wallets**
4. **Monitor transactions**
5. **Use hardware wallets for large amounts**

## Technical Details

- **Network**: Kiichain Testnet (oro_1336-1)
- **RPC**: https://json-rpc.uno.sentry.testnet.v3.kiivalidator.com/
- **Contract**: 0x0000000000000000000000000000000000000800
- **Gas Limit**: 203,415
- **Gas Price**: 60 Gwei (max)

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create pull request

## License

MIT License - see LICENSE file for details

## ⚠️ Disclaimer

This software is for educational purposes. Use at your own risk. Always verify transactions and amounts before confirming. Not responsible for any financial losses.

## 🔗 Links

- **Kiichain**: https://kiichain.io/
- **Explorer**: https://explorer.kiichain.io/
- **Faucet**: https://faucet.kiichain.io/
- **Discord**: https://discord.gg/kiichain
