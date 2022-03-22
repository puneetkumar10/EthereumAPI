var blockchainService = require('../services/blockchainService');
var validator = require('email-validator');
var Cryptr = require('cryptr');
var cryptr = new Cryptr('kCLnMnC4pL');

exports.makeWallet = (req, next) => {
    var q = req.body;
    var email = q.email;
    if (validator.validate(email) == false) {
        let err = "Invalid email";
        next(err, null);
    }
    else {
        blockchainService.generateWallet(email, (err, result) => {
            if (err) {
                next(err, null)
            } else {
                let pub_encrypt = cryptr.encrypt(result.public_address);
                let pri_encrypt = cryptr.encrypt(result.private_address);
                result.pub_encrypt = pub_encrypt;
                result.pri_encrypt = pri_encrypt;
                next(null, result);
            }
        })
    }
};

exports.addEther = (public_addr, next) => {
    blockchainService.addEther(public_addr, async (err, result) => {
        if (err) {
            next(err, null);
        }
        else {
            next(null, result);
        }
    });
};

exports.deployContract = async (req, next) => {
    var q = req.body;
    var data = {
        propertyId: q.propertyId,
        propertyAddr: q.propertyAddr,
        propertyPrice: q.propertyPrice,
        buyerName: q.buyerName,
        buyerAccount: q.buyerAccount,
        sellerName: q.sellerName,
        sellerAccount: q.sellerAccount,
        leasePeriod: q.leasePeriod,
        annualRent: q.annualRent,
        bmFee: q.bmFee,
        escrowFee: q.escrowFee,
        companyFee: q.companyFee
    };
    blockchainService.deployContract(data, (err, result) => {
        if (err) {
            next(err.message, null)
        } else {
            next(null, result)
        }
    });
}

exports.getBuyer = (req, next) => {
    blockchainService.getBuyer(req.body.contractAddr, async (err, result) => {
        if (err) {
            next(err, null);
        }
        else {
            delete result["0"];
            delete result["1"];
            delete result["2"];
            next(null, result);
        }
    });
};