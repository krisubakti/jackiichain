const { ethers } = require('ethers');
const colors = {
    reset: '\x1b[0m',
    cyan: '\x1b[36m',
    blue: '\x1b[34m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    white: '\x1b[37m',
    bold: '\x1b[1m',
    magenta: '\x1b[35m',
    purple: '\x1b[35m',
    brightGreen: '\x1b[92m',
    brightBlue: '\x1b[94m',
    brightYellow: '\x1b[93m'
};

class KiichainStakingBot {
    constructor(privateKey, rpcUrl = 'https://json-rpc.uno.sentry.testnet.v3.kiivalidator.com/') {
        this.chainId = 1336;
        this.stakingContract = '0x0000000000000000000000000000000000000800';
        this.provider = new ethers.JsonRpcProvider(rpcUrl);
        this.wallet = new ethers.Wallet(privateKey, this.provider);
        
        this.stakingInterface = new ethers.Interface([
            'function delegate(address delegator, string validator, uint256 amount)'
        ]);
    }

    async getBalance() {
        const balance = await this.provider.getBalance(this.wallet.address);
        return parseFloat(ethers.formatEther(balance));
    }

    async autoStake(config) {
        try {
            const balance = await this.getBalance();
            const stakePercentage = config.stakePercentage || 50;
            const stakeAmount = (balance * stakePercentage) / 100;
            
            if (stakeAmount < 0.01) {
                return {
                    success: false,
                    error: `Stake amount too small. Need at least 0.01 KII, calculated ${stakeAmount.toFixed(4)} KII`,
                    needMoreFunds: true,
                    suggestedAmount: 0.1,
                    currentBalance: balance
                };
            }
            
            const gasReserve = 0.01;
            if (balance - stakeAmount < gasReserve) {
                return {
                    success: false,
                    error: `Insufficient balance for gas fees. Need ${gasReserve} KII reserved for gas`,
                    needMoreFunds: true,
                    suggestedAmount: stakeAmount + gasReserve + 0.01,
                    currentBalance: balance
                };
            }

            if (config.testMode) {
                this.logTest(stakeAmount, config.specificValidator);
                return {
                    success: true,
                    testMode: true,
                    amount: stakeAmount,
                    validator: config.specificValidator || 'test-validator'
                };
            }

            const validatorAddress = config.specificValidator || await this.getBestValidator(config.selectionMethod);
            this.logTransactionStart(balance, stakeAmount, stakePercentage, validatorAddress);
            const txHash = await this.executeStake(validatorAddress, stakeAmount);
            this.logSuccess(txHash, stakeAmount);
            
            return {
                success: true,
                txHash: txHash,
                amount: stakeAmount,
                validator: validatorAddress,
                testMode: false
            };

        } catch (error) {
            this.logError(error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    logTransactionStart(balance, stakeAmount, percentage, validator) {
        console.log(`\n${colors.cyan}${colors.bold}STARTING KIICHAIN STAKING TRANSACTION${colors.reset}`);
        console.log(`${colors.blue}═══════════════════════════════════════════════${colors.reset}`);
        console.log(`${colors.white}$ Balance:    ${colors.brightYellow}${balance.toFixed(4)} KII${colors.reset}`);
        console.log(`${colors.white}↭ Stake:      ${colors.brightGreen}${stakeAmount.toFixed(4)} KII${colors.reset} ${colors.cyan}(${percentage}%)${colors.reset}`);
        console.log(`${colors.white}⇎ Validator:  ${colors.brightBlue}${validator.substring(0, 20)}...${colors.reset}`);
        console.log(`${colors.blue}═══════════════════════════════════════════════${colors.reset}`);
    }

    logTest(stakeAmount, validator) {
        console.log(`\n${colors.yellow}${colors.bold}🧪 TEST MODE SIMULATION${colors.reset}`);
        console.log(`${colors.yellow}═══════════════════════════════════════════════${colors.reset}`);
        console.log(`${colors.white}$ Would stake: ${colors.brightYellow}${stakeAmount.toFixed(4)} KII${colors.reset}`);
        console.log(`${colors.white}⇎ To validator: ${colors.cyan}${validator?.substring(0, 20)}...${colors.reset}`);
        console.log(`${colors.green}✓ Test completed successfully!${colors.reset}`);
        console.log(`${colors.yellow}═══════════════════════════════════════════════${colors.reset}\n`);
    }

    logSuccess(txHash, amount) {
        console.log(`\n${colors.green}${colors.bold}🎉 STAKING SUCCESSFUL!${colors.reset}`);
        console.log(`${colors.green}═══════════════════════════════════════════════${colors.reset}`);
        console.log(`${colors.white}$ Staked:   ${colors.brightGreen}${amount.toFixed(4)} KII${colors.reset}`);
        console.log(`${colors.white}↭ TX Hash:  ${colors.brightBlue}${txHash.substring(0, 20)}...${colors.reset}`);
        console.log(`${colors.white}Ħ Status:   ${colors.brightGreen}CONFIRMED${colors.reset}`);
        console.log(`${colors.green}═══════════════════════════════════════════════${colors.reset}\n`);
    }

    logError(errorMsg) {
        console.log(`\n${colors.red}${colors.bold}✕ STAKING FAILED${colors.reset}`);
        console.log(`${colors.red}═══════════════════════════════════════════════${colors.reset}`);
        console.log(`${colors.white}‼ Error: ${colors.red}${errorMsg}${colors.reset}`);
        console.log(`${colors.red}═══════════════════════════════════════════════${colors.reset}\n`);
    }

    async executeStake(validatorAddress, amount) {
        try {
            const nonce = await this.provider.getTransactionCount(this.wallet.address);
            console.log(`${colors.cyan}📡 Broadcasting transaction...${colors.reset}`);
            const amountWei = ethers.parseEther(amount.toString());
            const data = this.stakingInterface.encodeFunctionData('delegate', [
                this.wallet.address,
                validatorAddress,
                amountWei
            ]);
            
            const transaction = {
                to: this.stakingContract,
                data: data,
                gasLimit: 203415,
                maxFeePerGas: ethers.parseUnits('60', 'gwei'),
                maxPriorityFeePerGas: ethers.parseUnits('15', 'gwei'),
                chainId: this.chainId,
                nonce: nonce,
                type: 2
            };
            
            const txResponse = await this.wallet.sendTransaction(transaction);
            console.log(`${colors.yellow}⏳ Confirming transaction...${colors.reset}`);
            const receipt = await txResponse.wait();
            
            if (receipt.status === 1) {
                return txResponse.hash;
            } else {
                throw new Error(`Transaction failed: status = ${receipt.status}`);
            }
            
        } catch (error) {
            throw error;
        }
    }
    
    async getBestValidator(method = 'balanced') {
        const validators = [
            'kiivaloper1zsnvhm8jn2qngmk2cuegjq6a66r8mn8uurhtcc',
            'kiivaloper10e2ccvg737har86ktyp3vlecq4hz4dcvwnctyg',
            'kiivaloper1z0fyvylcz3x8yqanu2th2f9s8vljf83p2ygjqc'
        ];
        
        if (method === 'random') {
            return validators[Math.floor(Math.random() * validators.length)];
        }
        
        return validators[0];
    }
}

module.exports = KiichainStakingBot;