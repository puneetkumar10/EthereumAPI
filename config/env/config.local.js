var localConfig = {
  database: {
    defaultRole: 'user'
  },
  debug: true,
  allowedOrigins: ['http://localhost:4200' , "*"],
  etherScan : {
    etherScanApiKey: 'Y84WIF6Q1R7UIAJA68WPTP3QWZIHUW6T3B',
  },
  // web3Provider:'https://rinkeby.infura.io/jkYJLm4yhJuFJqGAVvMe',
  web3Provider:'https://rinkeby.infura.io/v3/0b68e0892bed435b93af3d6c5a0df340',
  salt:'7NntKKjVXmG2',
  // admin creds
  adminPubKey: "0x52005afe7ca0f2795530a9d73c271ecef6aa8976",
  adminPriKey: "0x4dc5ce76feaf4ed3367592026924c22c7faf8efc9e8b9190c324e695b7b19bd8"
}
module.exports = localConfig;