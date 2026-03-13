// Network configuration
module.exports = {
    networks: {
        mainnet: {
            url: process.env.MAINNET_RPC_URL,
            chainId: 1
        },
        testnet: {
            url: process.env.TESTNET_RPC_URL,
            chainId: 5
        }
    }
};
