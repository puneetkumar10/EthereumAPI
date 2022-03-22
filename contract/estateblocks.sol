pragma solidity ^0.4.24;


/**
 * @title Ownable
 * @dev The Ownable contract has an owner address, and provides basic authorization control
 * functions, this simplifies the implementation of "user permissions".
 */
contract Ownable {
  address public owner;


  event OwnershipRenounced(address indexed previousOwner);
  event OwnershipTransferred(
    address indexed previousOwner,
    address indexed newOwner
  );


  /**
   * @dev The Ownable constructor sets the original `owner` of the contract to the sender
   * account.
   */
  constructor() public {
    owner = msg.sender;
  }

  /**
   * @dev Throws if called by any account other than the owner.
   */
  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  /**
   * @dev Allows the current owner to relinquish control of the contract.
   * @notice Renouncing to ownership will leave the contract without an owner.
   * It will not be possible to call the functions with the `onlyOwner`
   * modifier anymore.
   */
  function renounceOwnership() public onlyOwner {
    emit OwnershipRenounced(owner);
    owner = address(0);
  }

  /**
   * @dev Allows the current owner to transfer control of the contract to a newOwner.
   * @param _newOwner The address to transfer ownership to.
   */
  function transferOwnership(address _newOwner) public onlyOwner {
    _transferOwnership(_newOwner);
  }

  /**
   * @dev Transfers control of the contract to a newOwner.
   * @param _newOwner The address to transfer ownership to.
   */
  function _transferOwnership(address _newOwner) internal {
    require(_newOwner != address(0));
    emit OwnershipTransferred(owner, _newOwner);
    owner = _newOwner;
  }
}






/**
 * @title SafeMath
 * @dev Math operations with safety checks that throw on error
 */
library SafeMath {

  /**
  * @dev Multiplies two numbers, throws on overflow.
  */
  function mul(uint256 _a, uint256 _b) internal pure returns (uint256 c) {
    // Gas optimization: this is cheaper than asserting 'a' not being zero, but the
    // benefit is lost if 'b' is also tested.
    // See: https://github.com/OpenZeppelin/openzeppelin-solidity/pull/522
    if (_a == 0) {
      return 0;
    }

    c = _a * _b;
    assert(c / _a == _b);
    return c;
  }

  /**
  * @dev Integer division of two numbers, truncating the quotient.
  */
  function div(uint256 _a, uint256 _b) internal pure returns (uint256) {
    // assert(_b > 0); // Solidity automatically throws when dividing by 0
    // uint256 c = _a / _b;
    // assert(_a == _b * c + _a % _b); // There is no case in which this doesn't hold
    return _a / _b;
  }

  /**
  * @dev Subtracts two numbers, throws on overflow (i.e. if subtrahend is greater than minuend).
  */
  function sub(uint256 _a, uint256 _b) internal pure returns (uint256) {
    assert(_b <= _a);
    return _a - _b;
  }

  /**
  * @dev Adds two numbers, throws on overflow.
  */
  function add(uint256 _a, uint256 _b) internal pure returns (uint256 c) {
    c = _a + _b;
    assert(c >= _a);
    return c;
  }
}


contract EstateBlock is Ownable {
    using SafeMath for uint256;

    struct PropertyInfo {
        string propertyId;
        string propertyAddress;
        uint256 price;
    }
    struct Person {
        string name;
        address account;
        bool signature;
    }
    PropertyInfo public property;
    Person public buyer;
    Person public seller;
    uint256 leasePeriod; // leaseInfo object LAST
    uint256 annualRent;
    uint256 decimal = 18;
    uint256 bmFee; // 5% of the annual rent, to be paid monthly in arrears (charging the buyers) 10 ** 18
    uint256 escrowFee; // 0.5% of total rent amount (ex - rent is 100k/yr for 3 years, then escrow fee will be 0.5 % of 300k) 10 ** 17
    uint256 companyFee; // 2% of the sale price (charging the sellers) 10 ** 18

    constructor(
        string _propertyId,
        string _propertyAddress,
        uint256 _price,   // ** 18
        string _buyerName,
        address _buyerAccount,
        string _sellerName,
        address _sellerAccount,
        uint256 _leasePeriod, // ** 18 => 1 * (10 ** 18) for 1 yr || 5 * (10 ** 17) for 6 Months
        uint256 _annualRent, // ** 18
        uint256 _bmFee,     // ** 18
        uint256 _escrowFee, // ** 18 because we will manage 0.5 * (10 ** 18) is 5 * (10 ** 17)
        uint256 _companyFee // ** 18
    ) public {
        property = PropertyInfo(_propertyId,_propertyAddress,_price);
        buyer = Person(_buyerName,_buyerAccount,false);
        seller = Person(_sellerName,_sellerAccount,false);
        leasePeriod = _leasePeriod;
        bmFee = _bmFee;
        escrowFee = _escrowFee;
        companyFee = _companyFee;
        annualRent = _annualRent;
        bmFee = bmFee.mul(annualRent.div(10 ** decimal)).div(100);
        escrowFee = escrowFee.mul(annualRent).div(10 ** decimal).mul(leasePeriod).div(10 ** decimal).div(100);
        companyFee = companyFee.mul(_price).div(10 ** decimal).div(100);
    }
    
    modifier onlyBuyerSeller() {
        require(msg.sender == buyer.account || msg.sender == seller.account);
        _;
    }
    
    function signAgreement(address _addr) public onlyBuyerSeller {
        if (_addr == buyer.account) {
            buyer.signature = true;
        } else if (_addr == seller.account) {
            seller.signature = true;
        }
    }

    function getPropertyInfo() external view returns (string, string, uint256) {
        return (property.propertyId, property.propertyAddress, property.price);
    }

    function getLeasePeriod() external view returns (uint256) {
        return leasePeriod;
    }

    function getAnnualRent() external view returns (uint256) {
        return annualRent;
    }


    function getBuyerInfo() external view returns (string, address, bool) {
        return (buyer.name, buyer.account, buyer.signature);
    }

    function getSellerInfo() external view returns (string, address, bool) {
        return (seller.name, seller.account, seller.signature);
    }

    function getbmFee() external view returns (uint256) {
        return bmFee;
    }
    
    function getEscrowFee() external view returns (uint256) {
        return escrowFee;
    }
    
    function getCompanyFee() external view returns (uint256) {
        return companyFee;
    }
    
    // seller
    function getPayout() external view returns (uint256) {
        //propertyPrice - (annualRent * years) - escrowFee - companyFee
        return property.price.sub(annualRent.mul(leasePeriod).div(10 ** decimal)).sub(escrowFee).sub(companyFee);
    }

    function getEffectiveSellPrice() external view returns (uint256) {
        //propertyPrice - escrowFee - companyFee
        return property.price.sub(escrowFee).sub(companyFee);
    }
    
    // buyer
    function getPayable() external view returns (uint256) {
        //   propertyPrice + (annualRent * leasePeriod) - bmFee(leasePeriod)  -> mul by -1
        return property.price;
    }
    
    function getEffectivePurchasePrice() external view returns (uint256) {
        // propertyPrice - (annualRent * leasePeriod) + bmFee(leasePeriod) -> mul by -1 
        return property.price.sub(annualRent.mul(leasePeriod).div(10 ** decimal)).add(bmFee.mul(leasePeriod).div(10 ** decimal));
    }
}
