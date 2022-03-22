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
var transactionService = require("../services/transactionService");

exports.generateWallet = (email, next) => {
    try {
        var passSeed = md5(email + sha256(config.salt));
        var mnemonic = bip39.entropyToMnemonic(passSeed);
        var seed = bip39.mnemonicToSeedHex(mnemonic)
        var walletx = hdkey.fromMasterSeed(seed);
        var private_address = walletx.derivePath("m/0/1").getWallet().getPrivateKeyString();
        var public_address = walletx.derivePath("m/0/1").getWallet().getAddressString();

        var priKey = Buffer.from(config.adminPriKey.slice(2), 'hex');

        // build the transaction 
        web3.eth.getTransactionCount(config.adminPubKey, (err, txCount) => {
            if (txCount) {
                var txObject = {
                    nonce: web3.utils.toHex(txCount),
                    to: public_address,
                    value: web3.utils.toHex(web3.utils.toWei('1', 'ether')),
                    gasLimit: web3.utils.toHex('21000'),
                    gasPrice: web3.utils.toHex(web3.utils.toWei('10', 'gwei'))
                };
            } else if (err && err.message) {
                next(err.message, null);
            }

            // sign the transaction 
            const tx = new Tx(txObject);
            tx.sign(priKey);

            // serialize the transaction 
            const serializeTransaction = tx.serialize();
            const raw = '0x' + serializeTransaction.toString('hex')

            web3.eth.sendSignedTransaction(raw, (err, txHash) => {
                if (txHash) {
                    next(null, { public_address: public_address, private_address: private_address, transactionHash: txHash });
                }
                else if (err && err.message) {
                    next(err.message, null);
                }
                else {
                    next('Unable to sendRawTransaction', null);
                }
            });
        })
    } catch (error) {
        next(error, null)
    }
}

exports.addEther = (public_addr, next) => {
    var priKey = Buffer.from(config.adminPriKey.slice(2), 'hex');
    // build the transaction 
    web3.eth.getTransactionCount(config.adminPubKey, (err, txCount) => {
        if (txCount) {
            var txObject = {
                nonce: web3.utils.toHex(txCount),
                to: public_addr,
                value: web3.utils.toHex(web3.utils.toWei('2', 'ether')),
                gasLimit: web3.utils.toHex('21000'),
                gasPrice: web3.utils.toHex(web3.utils.toWei('10', 'gwei'))
            };
        } else if (err && err.message) {
            next(err.message, null);
        }

        // sign the transaction 
        const tx = new Tx(txObject);
        tx.sign(priKey);

        // serialize the transaction 
        const serializeTransaction = tx.serialize();
        const raw = '0x' + serializeTransaction.toString('hex')

        web3.eth.sendSignedTransaction(raw, (err, txHash) => {
            if (txHash) {
                next(null, txHash);
            }
            else if (err && err.message) {
                next(err.message, null);
            }
            else {
                next('Unable to sendRawTransaction', null);
            }
        });
    })
}


exports.deployContract = async (data, next) => {
    const PRIVATE_KEY = config.adminPriKey;
    const CONTRACT_ARGS = ["TestToken", "TT"];
    
    try {
        // const web3 = new Web3(NODE_ADDRESS);
        // const account = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);
            // const sourceCode = fs.readFileSync('/home/puneet/puneet/projects/EstateblocsEthereum/contract/23april_2.sol', 'utf8').toString();
            // const compiledCode = compiler.compile(sourceCode, 1).contracts[':EstateBlock']
            // const abi = JSON.parse(compiledCode.interface);
            // const bin = compiledCode.bytecode;
            const abi = contractAbi.abi;
            const bin = contractBytecode.bytecode;

            const contract = new web3.eth.Contract(abi);
            const options = { data: bin, arguments: CONTRACT_ARGS }; // "0x" + bin removed 
            const transaction = contract.deploy(options);
            const receipt = await transactionService.send(PRIVATE_KEY, transaction);
            console.log("receipt is :",receipt)
            if (web3.currentProvider.constructor.name == "WebsocketProvider")
                web3.currentProvider.connection.close();
            
            next(null, receipt)
        }
        catch (error) {
            next(error, null)
        }
   
}

exports.getBuyer = (contractAddr, next) => {
    const abi = contractAbi.abi;
    const contractInstance = new web3.eth.Contract(abi, contractAddr);
    contractInstance.methods.buyer().call((err, result) => {
        if (err) {
            next(err, null)
        } else {
            next(null, result)
        }
    })
}