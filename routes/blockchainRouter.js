var express = require('express');
var router = express.Router();
var blockchainController = require('../controllers/blockchainController');
var responseService = require('../services/responseService');

/**
 * @description api to deploy ethereum smart contracts as agreements
 * @params email
 * @returns publicKey, privateKey
 */
router.post("/wallet/create", (req, res) => {
  blockchainController.makeWallet(req, (err, result) => {
    if (err) {
      responseService.response(req, err, null, res);
    }
    else {
      responseService.response(req, null, result, res);
    }
  });
});

/**
 * @description api to deploy ethereum smart contracts as agreements
 * @params public key
 * @returns transaction hash
 */
router.post("/wallet/addETH", (req, res) => {
  public_addr = req.body.public_addr;
  blockchainController.addEther(public_addr, (err, result) => {
    if (err)
      responseService.response(req, err, null, res);
    else
      responseService.response(req, null, result, res);
  });
});

/**
 * @description api to deploy ethereum smart contracts as agreements
 * @params propertyId, propertyAddress, propertyPrice, buyerName, buyerAccount, sellerName, sellerAccount, leasePeriod, annualRent, bmFee, escrowFee, companyFee
 * @returns Transaction details object.
 */
router.post('/contract/deploy', function (req, res) {
  blockchainController.deployContract(req,(err, result) => {
    if (err)
    responseService.response(req, err, null, res);
    else
    responseService.response(req, null, result, res);
  })
});

/**
 * @description get buyer information
 * @params contract address
 * @returns Transaction details object.
 */
router.post('/buyer/getinfo', function (req, res) {
  blockchainController.getBuyer(req,(err, result) => {
    if (err)
    responseService.response(req, err, null, res);
    else
    responseService.response(req, null, result, res);
  })
});

module.exports = router;
