// Load environment variables
require('dotenv').config();

module.exports = {
    // Wallet Settings
    PRIVATE_KEY: process.env.KIICHAIN_PRIVATE_KEY || 'YOUR_PRIVATE_KEY_HERE',
    
    // Network Settings
    NETWORK: {
        RPC_URL: 'https://a.sentry.testnet.kiivalidator.com:8645/',
        REST_URL: 'https://lcd.uno.sentry.testnet.v3.kiivalidator.com',
        CHAIN_ID: 1336,
        STAKING_CONTRACT: '0x0000000000000000000000000000000000000800',
        DELEGATE_FUNCTION: '0x53266bbb'
    },

    // Main Strategies
    STRATEGIES: {
        CONSERVATIVE: {
            minBalance: 1,
            stakePercentage: 0.7,
            strategy: 'lowest_commission',
            reserveGas: 0.1,
            testMode: true
        },
        BALANCED: {
            minBalance: 0.5,
            stakePercentage: 0.8,
            strategy: 'balanced',
            reserveGas: 0.08,
            testMode: false
        },
        AGGRESSIVE: {
            minBalance: 0.2,
            stakePercentage: 0.95,
            strategy: 'best_ratio',
            reserveGas: 0.05,
            testMode: false
        },
        BEGINNER: {
            minBalance: 1,
            stakePercentage: 0.7,
            strategy: 'balanced',
            reserveGas: 0.1,
            testMode: true
        },
        INTERMEDIATE: {
            minBalance: 0.5,
            stakePercentage: 0.8,
            strategy: 'balanced',
            reserveGas: 0.08,
            testMode: false
        }
    },

    // Quick Config Presets (yang dibutuhkan jekicen.js)
    QUICK_CONFIGS: {
        BEGINNER: {
            minBalance: 1,
            stakePercentage: 0.7,
            strategy: 'balanced',
            reserveGas: 0.1,
            testMode: true,
            enableMonitoring: true
        },
        INTERMEDIATE: {
            minBalance: 0.5,
            stakePercentage: 0.8,
            strategy: 'balanced',
            reserveGas: 0.08,
            testMode: false,
            enableMonitoring: true,
            autoClaimRewards: true
        },
        EXPERT: {
            minBalance: 0.2,
            stakePercentage: 0.95,
            strategy: 'best_ratio',
            reserveGas: 0.05,
            testMode: false,
            enableMonitoring: true,
            autoClaimRewards: true,
            enableNotifications: true
        },
        WHALE: {
            minBalance: 10,
            stakePercentage: 0.98,
            strategy: 'best_ratio',
            reserveGas: 1,
            testMode: false,
            enableMonitoring: true,
            autoClaimRewards: true,
            enableNotifications: true
        }
    },

    // Monitoring Settings
    MONITORING: {
        enableMonitoring: true,
        monitorInterval: 10 * 60 * 1000, // 10 minutes
        autoClaimRewards: true,
        minRewardsForClaim: 1,
        enableNotifications: false,
        logLevel: 'info'
    },

    // Gas Settings
    GAS: {
        gasLimit: 250000,
        maxFeePerGas: '60000000000', // 60 Gwei
        maxPriorityFeePerGas: '15000000000', // 15 Gwei
        gasMultiplier: 1.1
    },

    // Safety Settings
    SAFETY: {
        maxStakePerTransaction: 1000,
        dailyStakeLimit: 5000,
        emergencyStop: false,
        testMode: true, // Global test mode
        backupValidators: [
            'kiivaloper1zsnvhm8jn2qngmk2cuegjq6a66r8mn8uurhtcc', // Crosnest
            'kiivaloper10e2ccvg737har86ktyp3vlecq4hz4dcvwnctyg', // Nodeist
            'kiivaloper1zumlpw2c86ycg36a2zjtxdrj936vmjx3h5sjdd'  // KiiMidas
        ]
    },

    // Logging Settings
    LOGGING: {
        enableFileLogging: true,
        logDirectory: './logs',
        maxLogFiles: 10,
        maxLogSize: '10MB',
        logFormat: 'combined'
    },

    // Notifications (Optional)
    NOTIFICATIONS: {
        discord: {
            enabled: false,
            webhookUrl: process.env.DISCORD_WEBHOOK || '',
            mentions: ['@everyone']
        },
        telegram: {
            enabled: false,
            botToken: process.env.TELEGRAM_BOT_TOKEN || '',
            chatId: process.env.TELEGRAM_CHAT_ID || ''
        }
    },

    // Validator Preferences
    VALIDATOR_FILTERS: {
        excludeJailed: true,
        excludeInactive: true,
        maxCommissionRate: 0.15, // 15%
        minVotingPower: 1000000,
        preferredValidators: [
            'kiivaloper1zsnvhm8jn2qngmk2cuegjq6a66r8mn8uurhtcc', // Crosnest - 5%
            'kiivaloper10e2ccvg737har86ktyp3vlecq4hz4dcvwnctyg', // Nodeist - 5%
            'kiivaloper1z0fyvylcz3x8yqanu2th2f9s8vljf83p2ygjqc', // NodeStake - 5%
        ],
        blacklistedValidators: []
    },

    // Validation Function
    validateConfig: function() {
        const errors = [];
        
        // Check private key
        if (!process.env.KIICHAIN_PRIVATE_KEY && this.PRIVATE_KEY === 'YOUR_PRIVATE_KEY_HERE') {
            errors.push('Private key not configured. Set KIICHAIN_PRIVATE_KEY in .env file.');
        }
        
        // Check network
        if (!this.NETWORK.RPC_URL) {
            errors.push('RPC URL not configured.');
        }
        
        // Check required directories
        const fs = require('fs');
        if (!fs.existsSync(this.LOGGING.logDirectory)) {
            try {
                fs.mkdirSync(this.LOGGING.logDirectory, { recursive: true });
                console.log(`📁 Created logs directory: ${this.LOGGING.logDirectory}`);
            } catch (error) {
                errors.push(`Cannot create logs directory: ${error.message}`);
            }
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    },

    // Helper function to get strategy by name
    getStrategy: function(strategyName) {
        const strategy = this.QUICK_CONFIGS[strategyName.toUpperCase()] || 
                        this.STRATEGIES[strategyName.toUpperCase()] ||
                        this.QUICK_CONFIGS.BEGINNER;
        
        console.log(`📋 Using ${strategyName.toUpperCase()} strategy:`, {
            minBalance: strategy.minBalance,
            stakePercentage: `${strategy.stakePercentage * 100}%`,
            strategy: strategy.strategy,
            testMode: strategy.testMode
        });
        
        return strategy;
    }
};