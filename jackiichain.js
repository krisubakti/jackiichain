require('dotenv').config();
const { ethers } = require('ethers');
const readline = require('readline');

const colors = {
    reset: '\x1b[0m',
    cyan: '\x1b[36m',
    blue: '\x1b[34m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    white: '\x1b[37m',
    bold: '\x1b[1m',
    bright: '\x1b[1m',
    magenta: '\x1b[35m',
    purple: '\x1b[35m',
    brightGreen: '\x1b[92m',
    brightBlue: '\x1b[94m',
    brightYellow: '\x1b[93m'
};

const logger = {
    info: (msg) => console.log(`${colors.green}[✓] ${msg}${colors.reset}`),
    wallet: (msg) => console.log(`${colors.white}[◨ ] ${msg}${colors.reset}`),
    warn: (msg) => console.log(`${colors.yellow}[!] ${msg}${colors.reset}`),
    error: (msg) => console.log(`${colors.red}[✕] ${msg}${colors.reset}`),
    success: (msg) => console.log(`${colors.green}[✓] ${msg}${colors.reset}`),
    loading: (msg) => console.log(`${colors.cyan}[↺] ${msg}${colors.reset}`),
    step: (msg) => console.log(`${colors.white}[➤] ${msg}${colors.reset}`),
    trade: (msg) => console.log(`${colors.magenta}[↭] ${msg}${colors.reset}`),
    profit: (msg) => console.log(`${colors.green}[$] ${msg}${colors.reset}`),
    token: (msg) => console.log(`${colors.cyan}[◊] ${msg}${colors.reset}`),
    validator: (msg) => console.log(`${colors.yellow}[฿] ${msg}${colors.reset}`),
    kiichain: (msg) => console.log(`${colors.purple}[⌂] ${msg}${colors.reset}`),
    banner: () => {
        console.log(`${colors.blue}${colors.bold}`);
        console.log('██████╗░███████╗███╗░░░███╗██████╗░███████╗██╗░░██╗  ██╗░░░░░░█████╗░██╗░░██╗░█████╗░████████╗');
        console.log('██╔══██╗██╔════╝████╗░████║██╔══██╗██╔════╝██║░██╔╝  ██║░░░░░██╔══██╗██║░░██║██╔══██╗╚══██╔══╝');
        console.log('██████╔╝█████╗░░██╔████╔██║██████╔╝█████╗░░█████═╝░  ██║░░░░░███████║███████║███████║░░░██║░░░');
        console.log('██╔═══╝░██╔══╝░░██║╚██╔╝██║██╔═══╝░██╔══╝░░██╔═██╗░  ██║░░░░░██╔══██║██╔══██║██╔══██║░░░██║░░░');
        console.log('██║░░░░░███████╗██║░╚═╝░██║██║░░░░░███████╗██║░╚██╗  ███████╗██║░░██║██║░░██║██║░░██║░░░██║░░░');
        console.log('╚═╝░░░░░╚══════╝╚═╝░░░░░╚═╝╚═╝░░░░░╚══════╝╚═╝░░╚═╝  ╚══════╝╚═╝░░╚═╝╚═╝░░╚═╝╚═╝░░░╚═╝░░░╚═╝░░░');
        console.log('                                                                                               ');

    }
};

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

class KiichainMultiWalletBot {
    constructor() {
        this.rpcUrl = 'https://json-rpc.uno.sentry.testnet.v3.kiivalidator.com/';
        this.chainId = 1336;
        this.stakingContract = '0x0000000000000000000000000000000000000800';
        this.wallets = [];
        this.provider = null;
        
        this.validators = [
            {
                name: 'Crosnest',
                address: 'kiivaloper1zsnvhm8jn2qngmk2cuegjq6a66r8mn8uurhtcc',
                commission: 5.0,
                website: 'https://www.cros-nest.com',
                status: 'active'
            },
            {
                name: 'Nodeist', 
                address: 'kiivaloper10e2ccvg737har86ktyp3vlecq4hz4dcvwnctyg',
                commission: 5.0,
                website: 'https://nodeist.net',
                status: 'active'
            },
            {
                name: 'NodeStake',
                address: 'kiivaloper1z0fyvylcz3x8yqanu2th2f9s8vljf83p2ygjqc',
                commission: 5.0,
                website: 'https://nodestake.org',
                status: 'active'
            },
            {
                name: 'KiiMidas',
                address: 'kiivaloper1zumlpw2c86ycg36a2zjtxdrj936vmjx3h5sjdd',
                commission: 10.0,
                website: 'https://app.kiichain.io',
                status: 'premium'
            },
            {
                name: 'LuckyStar',
                address: 'kiivaloper19hqa77qjf8ukfpcte2gkanvh7gwxds6qfsyerx',
                commission: 10.0,
                website: 'https://explorer.luckystar.asia/kii-Testnet-Oro',
                status: 'premium'
            },
            {
                name: 'ValKiirie',
                address: 'kiivaloper1at98tkmqr2gmq80g38rrtdc8wh8cj0qggevzqa',
                commission: 10.0,
                website: 'https://app.kiichain.io',
                status: 'premium'
            }
        ];
        
        this.stakePercentages = [10, 20, 30, 40, 50, 70];
    }
    
    async loadWallets() {
        logger.banner();
        logger.kiichain('Loading wallets from environment...');
        
        try {
            this.provider = new ethers.JsonRpcProvider(this.rpcUrl);
            await this.provider.getNetwork();
            logger.success('Connected to Kiichain network');
        } catch (error) {
            logger.error(`Failed to connect to network: ${error.message}`);
            return 0;
        }
        
        for (let i = 1; i <= 10; i++) {
            const privateKey = process.env[`WALLET_${i}`];
            const walletName = process.env[`WALLET_${i}_NAME`] || `Wallet ${i}`;
            
            if (privateKey && privateKey !== '') {
                try {
                    const wallet = new ethers.Wallet(privateKey, this.provider);

                    const balance = await this.provider.getBalance(wallet.address);
                    const ethBalance = parseFloat(ethers.formatEther(balance));
                    
                    this.wallets.push({
                        wallet: wallet,
                        name: walletName,
                        address: wallet.address,
                        balance: ethBalance
                    });
                    
                    logger.success(`Loaded ${walletName}: ${wallet.address.substring(0, 10)}...`);
                    logger.wallet(`  Balance: ${ethBalance.toFixed(4)} KII\n`);
                } catch (error) {
                    logger.error(`Failed to load ${walletName}: ${error.message}`);
                }
            }
        }
        
        const bulkKeys = process.env.KIICHAIN_PRIVATE_KEYS;
        if (bulkKeys) {
            const keys = bulkKeys.split(',').map(k => k.trim());
            for (let i = 0; i < keys.length; i++) {
                if (keys[i] && keys[i] !== '') {
                    try {
                        const wallet = new ethers.Wallet(keys[i], this.provider);
                        const balance = await this.provider.getBalance(wallet.address);
                        const ethBalance = parseFloat(ethers.formatEther(balance));
                        
                        this.wallets.push({
                            wallet: wallet,
                            name: `Bulk Wallet ${i + 1}`,
                            address: wallet.address,
                            balance: ethBalance
                        });
                        
                        logger.success(`Loaded Bulk Wallet ${i + 1}: ${wallet.address.substring(0, 10)}...`);
                        logger.wallet(`  Balance: ${ethBalance.toFixed(4)} KII\n`);
                    } catch (error) {
                        logger.error(`Failed to load bulk wallet ${i + 1}: ${error.message}`);
                    }
                }
            }
        }
        
        logger.kiichain(`Multi-Wallet Bot initialized with ${this.wallets.length} wallets`);
        logger.validator(`Validator pool: ${this.validators.length} validators available`);
        
        return this.wallets.length;
    }
    
    async showInteractiveMenu() {
        while (true) {
            console.log(`\n${colors.cyan}${colors.bold}KIICHAIN STAKING BOT${colors.reset}`);
            console.log(`${colors.blue}==================================================${colors.reset}`);
            logger.profit('1. Check All Wallet Balances');
            logger.validator('2. Show Validator Pool');
            logger.trade('3. Start Stake (Choose Options)');
            logger.kiichain('4. Bulk Stake All Wallets');
            logger.token('5. Custom Stake Session');
            logger.step('6. Bot Configuration');
            logger.error('0. Exit');
            console.log(`${colors.blue}==================================================${colors.reset}`);
            
            const choice = await question(`${colors.cyan}Pilih menu (0-6): ${colors.reset}`);
            
            try {
                switch (choice.trim()) {
                    case '1':
                        await this.showAllBalances();
                        break;
                    case '2':
                        this.showValidatorPool();
                        break;
                    case '3':
                        await this.liveStake();
                        break;
                    case '4':
                        await this.bulkStakeAll();
                        break;
                    case '5':
                        await this.customStakeSession();
                        break;
                    case '6':
                        this.showConfiguration();
                        break;
                    case '0':
                        logger.success('Terima kasih sudah menggunakan Kiichain Lahat Bot!');
                        rl.close();
                        process.exit(0);
                        break;
                    default:
                        logger.error('Pilihan tidak valid! Silakan pilih 0-6');
                        continue;
                }
                
                const continueChoice = await question(`\n${colors.cyan}Lanjut ke menu lain? (y/n): ${colors.reset}`);
                if (continueChoice.toLowerCase() !== 'y' && continueChoice !== '') {
                    logger.success('Terima kasih sudah menggunakan Kiichain Lahat Bot!');
                    rl.close();
                    break;
                }
            } catch (error) {
                logger.error(`Error: ${error.message}`);
                await question(`${colors.cyan}Press Enter to continue...${colors.reset}`);
            }
        }
    }
    
    async showAllBalances() {
        logger.kiichain(`Checking all wallet balances...`);
        console.log(`${colors.blue}==============================${colors.reset}`);
        
        let totalBalance = 0;
        for (const walletInfo of this.wallets) {
            try {
                const currentBalance = await this.provider.getBalance(walletInfo.wallet.address);
                const ethBalance = parseFloat(ethers.formatEther(currentBalance));
                walletInfo.balance = ethBalance;
                totalBalance += ethBalance;
                
                logger.wallet(`   ${walletInfo.name}: ${ethBalance.toFixed(4)} KII`);
            } catch (error) {
                logger.error(`   ${walletInfo.name}: Error fetching balance - ${error.message}`);
            }
        }
        
        logger.profit(`Total Balance: ${totalBalance.toFixed(4)} KII`);
        console.log(`${colors.blue}==============================${colors.reset}`);
    }
    
    showValidatorPool() {
        logger.validator(`Available Validator Pool:`);
        console.log(`${colors.blue}==================================================${colors.reset}`);
        
        this.validators.forEach((validator, index) => {
            const statusEmoji = validator.status === 'active' ? '🟢' : '🟡';
            const commissionColor = validator.commission <= 5 ? colors.green : colors.yellow;
            
            logger.step(`${index + 1}. ${validator.name} ${statusEmoji}`);
            console.log(`${commissionColor}   Commission: ${validator.commission}%${colors.reset}`);
            logger.step(`   Address: ${validator.address}`);
            logger.step(`   Website: ${validator.website}`);
            console.log('');
        });
        
        console.log(`${colors.blue}==============================${colors.reset}`);
    }
    
    async liveStake() {
        logger.trade(`LIVE STAKE CONFIGURATION`);
        console.log(`${colors.blue}==================================================${colors.reset}`);
        
        logger.step('Select wallet:');
        this.wallets.forEach((walletInfo, index) => {
            logger.wallet(`   ${index + 1}. ${walletInfo.name} (${walletInfo.balance.toFixed(4)} KII)`);
        });
        logger.wallet(`   ${this.wallets.length + 1}. All wallets`);
        logger.wallet(`   ${this.wallets.length + 2}. Random selection`);
        
        const walletChoice = await question(`${colors.cyan}Choose option (1-${this.wallets.length + 2}): ${colors.reset}`);
        let selectedWallets = [];
        
        if (walletChoice === (this.wallets.length + 1).toString()) {
            selectedWallets = [...this.wallets];
            logger.kiichain('Selected: All wallets');
        } else if (walletChoice === (this.wallets.length + 2).toString()) {
            const randomCount = Math.floor(Math.random() * 3) + 1;
            const shuffled = [...this.wallets].sort(() => 0.5 - Math.random());
            selectedWallets = shuffled.slice(0, randomCount);
            logger.kiichain(`Randomly selected: ${selectedWallets.length} wallets`);
        } else {
            const walletIndex = parseInt(walletChoice) - 1;
            if (walletIndex >= 0 && walletIndex < this.wallets.length) {
                selectedWallets = [this.wallets[walletIndex]];
                logger.success(`Selected: ${this.wallets[walletIndex].name}`);
            } else {
                logger.error('Invalid wallet selection!');
                return;
            }
        }
        
        logger.validator('Select validator:');
        this.validators.forEach((validator, index) => {
            const statusEmoji = validator.status === 'active' ? '🟢' : '🟡';
            logger.step(`   ${index + 1}. ${validator.name} ${statusEmoji} (${validator.commission}%)`);
        });
        logger.step(`   ${this.validators.length + 1}. Random validator`);
        
        const validatorChoice = await question(`${colors.cyan}Choose validator (1-${this.validators.length + 1}): ${colors.reset}`);
        let selectedValidator;
        
        if (validatorChoice === (this.validators.length + 1).toString()) {
            selectedValidator = this.validators[Math.floor(Math.random() * this.validators.length)];
            logger.kiichain(`Randomly selected: ${selectedValidator.name}`);
        } else {
            const validatorIndex = parseInt(validatorChoice) - 1;
            if (validatorIndex >= 0 && validatorIndex < this.validators.length) {
                selectedValidator = this.validators[validatorIndex];
                logger.success(`Selected: ${selectedValidator.name}`);
            } else {
                logger.error('Invalid validator selection!');
                return;
            }
        }
        
        logger.profit('Select stake percentage:');
        this.stakePercentages.forEach((percentage, index) => {
            logger.step(`   ${index + 1}. ${percentage}%`);
        });
        logger.step(`   ${this.stakePercentages.length + 1}. Random percentage`);
        
        const percentageChoice = await question(`${colors.cyan}Choose percentage (1-${this.stakePercentages.length + 1}): ${colors.reset}`);
        let selectedPercentage;
        
        if (percentageChoice === (this.stakePercentages.length + 1).toString()) {
            selectedPercentage = this.stakePercentages[Math.floor(Math.random() * this.stakePercentages.length)];
            logger.kiichain(`Randomly selected: ${selectedPercentage}%`);
        } else {
            const percentageIndex = parseInt(percentageChoice) - 1;
            if (percentageIndex >= 0 && percentageIndex < this.stakePercentages.length) {
                selectedPercentage = this.stakePercentages[percentageIndex];
                logger.success(`Selected: ${selectedPercentage}%`);
            } else {
                logger.error('Invalid percentage selection!');
                return;
            }
        }
        
        console.log(`\n${colors.red}${colors.bold}LIVE MODE CONFIRMATION${colors.reset}`);
        logger.error('This will execute REAL transactions on Kiichain!');
        logger.wallet(`Wallets: ${selectedWallets.length} wallet(s)`);
        selectedWallets.forEach(w => logger.step(`   • ${w.name}: ${w.balance.toFixed(4)} KII`));
        logger.validator(`Validator: ${selectedValidator.name} (${selectedValidator.commission}%)`);
        logger.profit(`Percentage: ${selectedPercentage}%`);
        
        const confirm = await question(`\n${colors.red}Type 'CONFIRM' to proceed with LIVE staking: ${colors.reset}`);
        
        if (confirm.toUpperCase() === 'CONFIRM') {
            await this.executeStakeSession(selectedWallets, selectedValidator, selectedPercentage, false);
        } else {
            logger.error('Live staking cancelled!');
        }
    }
    
    async bulkStakeAll() {
        logger.kiichain(`BULK STAKE ALL WALLETS`);
        
        if (this.wallets.length === 0) {
            logger.error('No wallets available for bulk staking!');
            return;
        }
        
        const randomValidator = this.validators[Math.floor(Math.random() * this.validators.length)];
        const randomPercentage = this.stakePercentages[Math.floor(Math.random() * this.stakePercentages.length)];
        
        logger.validator(`Randomly selected validator: ${randomValidator.name}`);
        logger.profit(`Randomly selected: ${randomPercentage}%`);
        logger.wallet(`Will stake from ${this.wallets.length} wallets:`);
        
        let totalWillStake = 0;
        this.wallets.forEach(w => {
            const stakeAmount = (w.balance * randomPercentage) / 100;
            totalWillStake += stakeAmount;
            logger.step(`   • ${w.name}: ${stakeAmount.toFixed(4)} KII (${randomPercentage}% of ${w.balance.toFixed(4)} KII)`);
        });
        
        logger.profit(`Total will stake: ${totalWillStake.toFixed(4)} KII`);
        
        console.log(`\n${colors.red}${colors.bold}⚠️  BULK LIVE MODE CONFIRMATION${colors.reset}`);
        logger.error(`This will stake ${randomPercentage}% from ALL ${this.wallets.length} wallets!`);
        logger.error(`Total stake amount: ${totalWillStake.toFixed(4)} KII`);
        
        const confirm = await question(`\n${colors.red}Type 'BULK' to proceed: ${colors.reset}`);
        
        if (confirm.toUpperCase() === 'BULK') {
            await this.executeStakeSession(this.wallets, randomValidator, randomPercentage, false);
        } else {
            logger.error('Bulk staking cancelled!');
        }
    }
    
    async customStakeSession() {
        logger.token(`CUSTOM STAKE SESSION`);
        logger.step('This will run multiple stake transactions with different random combinations...');
        
        const rounds = await question(`${colors.cyan}How many rounds? (1-10): ${colors.reset}`);
        const roundCount = parseInt(rounds);
        
        if (isNaN(roundCount) || roundCount < 1 || roundCount > 10) {
            logger.error('Invalid round count! Must be 1-10');
            return;
        }
        
        const mode = await question(`${colors.cyan}Mode? (test/live): ${colors.reset}`);
        const isTestMode = mode.toLowerCase() !== 'live';
        
        if (!isTestMode) {
            logger.error('LIVE MODE: This will execute REAL transactions!');
            const confirm = await question(`${colors.red}Type 'LIVE' to confirm: ${colors.reset}`);
            if (confirm.toUpperCase() !== 'LIVE') {
                logger.error('Custom session cancelled!');
                return;
            }
        }
        
        logger.loading(`Running ${roundCount} custom stake rounds in ${isTestMode ? 'TEST' : 'LIVE'} mode...`);
        
        for (let i = 1; i <= roundCount; i++) {
            logger.kiichain(`ROUND ${i}/${roundCount}`);
            
            const randomWallet = this.wallets[Math.floor(Math.random() * this.wallets.length)];
            const randomValidator = this.validators[Math.floor(Math.random() * this.validators.length)];
            const randomPercentage = this.stakePercentages[Math.floor(Math.random() * this.stakePercentages.length)];
            
            await this.executeStakeSession([randomWallet], randomValidator, randomPercentage, isTestMode);
            
            if (i < roundCount) {
                logger.loading('Waiting 3 seconds before next round...');
                await this.sleep(3000);
            }
        }
        
        logger.success(`Custom session completed! ${roundCount} rounds finished.`);
    }
    
    async executeStakeSession(wallets, validator, percentage, testMode = false) {
        const mode = testMode ? 'TEST' : 'LIVE';
        
        logger.kiichain(`Multi-Wallet Staking Session Started (${mode})`);
        console.log(`${colors.blue}═══════════════════════════════════════════════${colors.reset}`);
        
        const results = [];
        
        for (const walletInfo of wallets) {
            logger.loading(`Processing: ${walletInfo.name}`);
            
            const stakeAmount = (walletInfo.balance * percentage) / 100;
            
            if (testMode) {
                logger.warn(`TEST MODE: Would stake ${stakeAmount.toFixed(4)} KII`);
                results.push({
                    wallet: walletInfo.name,
                    validator: validator.name,
                    amount: stakeAmount,
                    success: true,
                    mode: 'TEST'
                });
            } else {
                try {
                    const KiichainStakingBot = require('./bot');
                    const stakingBot = new KiichainStakingBot(walletInfo.wallet.privateKey);
                    const result = await stakingBot.autoStake({
                        stakePercentage: percentage,
                        selectionMethod: 'specific',
                        specificValidator: validator.address,
                        testMode: false
                    });
                    
                    if (result.success) {
                        logger.success(`Transaction confirmed: ${result.txHash?.substring(0, 20)}...`);
                        results.push({
                            wallet: walletInfo.name,
                            validator: validator.name,
                            amount: stakeAmount,
                            success: true,
                            mode: 'LIVE',
                            txHash: result.txHash
                        });
                    } else {
                        if (result.needMoreFunds) {
                            logger.error(`Insufficient funds: ${walletInfo.name}`);
                            logger.warn(`   Current: ${result.currentBalance.toFixed(4)} KII`);
                            logger.warn(`   Needed: ${result.suggestedAmount.toFixed(4)} KII`);
                            logger.step(`   Get faucet: https://faucet.kiichain.io/`);
                        }
                        
                        results.push({
                            wallet: walletInfo.name,
                            validator: validator.name,
                            amount: stakeAmount,
                            success: false,
                            mode: 'LIVE',
                            error: result.error,
                            needMoreFunds: result.needMoreFunds,
                            suggestedAmount: result.suggestedAmount
                        });
                    }
                } catch (error) {
                    logger.error(`Transaction failed: ${error.message}`);
                    results.push({
                        wallet: walletInfo.name,
                        validator: validator.name,
                        amount: stakeAmount,
                        success: false,
                        mode: 'LIVE',
                        error: error.message
                    });
                }
            }
            
            if (wallets.length > 1) {
                await this.sleep(1000);
            }
        }
        
        this.printStakingSummary(results);
    }
    
    printStakingSummary(results) {
        console.log(`\n${colors.blue}${colors.bold}STAKING SESSION SUMMARY${colors.reset}`);
        console.log(`${colors.blue}═══════════════════════════════════════════════${colors.reset}`);
        
        const successful = results.filter(r => r.success);
        const failed = results.filter(r => !r.success);
        const needMoreFunds = failed.filter(r => r.needMoreFunds);
        
        successful.forEach(result => {
            const modeEmoji = result.mode === 'TEST' ? '🧪' : '🔥';
            logger.success(`${result.wallet}: ${colors.brightGreen}${result.amount.toFixed(4)} KII${colors.reset} → ${result.validator} ${modeEmoji}`);
            if (result.txHash) {
                logger.step(`   ${result.txHash.substring(0, 30)}...`);
            }
        });
        
        failed.filter(r => !r.needMoreFunds).forEach(result => {
            logger.error(`${result.wallet}: Transaction failed`);
        });
        
        if (needMoreFunds.length > 0) {
            console.log(`\n${colors.yellow}${colors.bold}WALLETS NEED MORE FUNDS${colors.reset}`);
            console.log(`${colors.yellow}═══════════════════════════════════════════════${colors.reset}`);
            
            needMoreFunds.forEach(result => {
                logger.warn(`${result.wallet}: Need ${result.suggestedAmount?.toFixed(4) || '0.1'} KII`);
                logger.step(`   Address: ${colors.cyan}${this.wallets.find(w => w.name === result.wallet)?.address || 'N/A'}${colors.reset}`);
            });
            
            console.log(`\n${colors.cyan}Get Free KII:${colors.reset}`);
            logger.step(`Faucet: ${colors.brightBlue}https://faucet.kiichain.io/${colors.reset}`);
            logger.step(`Discord: Get faucet from Kiichain Discord`);
        }
        
        console.log(`\n${colors.green}↭ Results: ${successful.length}/${results.length} successful${colors.reset}`);
        const totalStaked = successful.reduce((sum, r) => sum + r.amount, 0);
        logger.profit(`Total Staked: ${totalStaked.toFixed(4)} KII`);
        
        console.log(`${colors.blue}═══════════════════════════════════════════════${colors.reset}\n`);
    }
    
    showConfiguration() {
        logger.step(`BOT CONFIGURATION`);
        console.log(`${colors.blue}==================================================${colors.reset}`);
        logger.token(`Loaded Wallets: ${this.wallets.length}`);
        
        this.wallets.forEach((walletInfo, index) => {
            logger.wallet(`   ${index + 1}. ${walletInfo.name} (${walletInfo.address.substring(0, 10)}...)`);
        });
        
        logger.validator(`Validator Pool: ${this.validators.length} validators`);
        logger.profit(`Stake Options: ${this.stakePercentages.join('%, ')}%`);
        logger.step(`Chain ID: ${this.chainId}`);
        logger.step(`RPC URL: ${this.rpcUrl}`);
        logger.step(`Contract: ${this.stakingContract}`);
        
        console.log(`${colors.yellow}Environment Variables:${colors.reset}`);
        for (let i = 1; i <= 5; i++) {
            const hasWallet = process.env[`WALLET_${i}`] ? '✓ Set' : '✕ Not set';
            logger.step(`   WALLET_${i}: ${hasWallet}`);
        }
        
        const bulkKeys = process.env.KIICHAIN_PRIVATE_KEYS ? '✓ Set' : '✕ Not set';
        const mainKey = process.env.KIICHAIN_PRIVATE_KEY ? '✓ Set' : '✕ Not set';
        logger.step(`   BULK KEYS: ${bulkKeys}`);
        logger.step(`   MAIN KEY: ${mainKey}`);
        
        console.log(`${colors.blue}==============================${colors.reset}`);
    }
    
    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    
    const kiichainBot = new KiichainMultiWalletBot();
    
    try {
        const walletCount = await kiichainBot.loadWallets();
        
        if (walletCount === 0) {
            logger.error('No wallets found! Please check your .env file');
            logger.step('Add wallets to .env:');
            logger.step('   WALLET_1=your_private_key_here');
            logger.step('   WALLET_1_NAME=Main Wallet');
            logger.step('   WALLET_2=your_second_private_key');
            logger.step('   WALLET_2_NAME=Trading Wallet');
            rl.close();
            process.exit(1);
        }
        
        if (command === 'demo') {
            logger.kiichain('Running demo mode...');
            kiichainBot.showConfiguration();
            await kiichainBot.showAllBalances();
            kiichainBot.showValidatorPool();
            
            logger.success('Demo completed successfully!');
            logger.step('To run interactive menu:');
            logger.step('   node enhanced-main.js');
            rl.close();
            return;
        }
        
        if (command === 'balances') {
            await kiichainBot.showAllBalances();
            rl.close();
            return;
        }
        
        if (command === 'validators') {
            kiichainBot.showValidatorPool();
            rl.close();
            return;
        }
        
        if (command === 'config') {
            kiichainBot.showConfiguration();
            rl.close();
            return;
        }
        
        await kiichainBot.showInteractiveMenu();
        
    } catch (error) {
        logger.error(`Bot error: ${error.message}`);
        logger.step('Please check:');
        logger.step('   1. Your .env file configuration');
        logger.step('   2. Network connection');
        logger.step('   3. Private key format');
        rl.close();
        process.exit(1);
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = KiichainMultiWalletBot;