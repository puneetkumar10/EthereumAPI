var Tx = require('ethereumjs-tx');
var config = require('../config/config').config();
const Web3 = require('web3');
var hdkey = require('ethereumjs-wallet/hdkey');
var bip39 = require('bip39') // npm i -S bip39
var md5 = require('md5');
var sha256 = require('sha256')
const web3 = new Web3(config.web3Provider);
var contractBytecode = require('../contract/bytecode');
var contractAbi = require('../contract/abi');
const fs = require('fs');
var compiler = require('solc');

async function send(privateKey, transaction) {
    return new Promise(async (resolve, reject) => {
        try {
            const account = web3.eth.accounts.privateKeyToAccount(privateKey);
            let options = {
                to: transaction._parent._address,
                data: transaction.encodeABI(),
                gas: await transaction.estimateGas({ from: account.address }),
                gasPrice: await getGasPrice(),
                nonce: web3.utils.toHex(await web3.eth.getTransactionCount(account.address, 'pending'))
            };

            let signed = await web3.eth.accounts.signTransaction(options, account.privateKey);
            let txHash = await web3.utils.sha3(signed.rawTransaction);
            //sending tx to txs pool
            web3.eth.sendSignedTransaction(signed.rawTransaction);

            return resolve(txHash);
        } catch (error) {
            return reject(error);
        }
    })
}


/**
 * @description return current GasPrice
 * @returns {Promise} - that return GasPrice in wei
 */
 function getGasPrice() {
    try {
        return web3.eth.getGasPrice();
    } catch (error) {
        return config.gasPriceInGwei;
    }
    
}
module.exports = {send}