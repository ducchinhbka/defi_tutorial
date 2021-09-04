pragma solidity ^0.5.0;

import "./DappToken.sol";
import "./DaiToken.sol";

contract TokenFarm {

    string public name = "Os Farm Token";
    DappToken public dappToken;
    DaiToken public daiToken;
    address public owner;

    mapping(address => uint) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public isStaking;
    address[] public stakers;


    constructor(DappToken _dappToken, DaiToken _daiToken) public {
        dappToken = _dappToken;
        daiToken = _daiToken;
        owner = msg.sender;
    }

    // Stake Tokens (deposit)
    function stakeTokens(uint _amount) public {

        require(_amount > 0, "amount of tokens");

        // transfer mock dai token to this contract
        daiToken.transferFrom(msg.sender, address(this), _amount);
        stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount; 

        if(!hasStaked[msg.sender])
        {
           stakers.push(msg.sender); 
        }

        hasStaked[msg.sender] = true;
        isStaking[msg.sender] = true;

    }


    // Unstaking (withdraw)

    function unstakeTokens() public {

        uint balance = stakingBalance[msg.sender];

        require(balance > 0, "balance must not be 0");

        daiToken.transfer(msg.sender, balance);

        stakingBalance[msg.sender] = 0;

        isStaking[msg.sender] = false;
        
    }

    // Issue Tokens (reward)
    function issueTokens() public {

        require(msg.sender == owner, "only owner can issue");

        for(uint i=0; i<stakers.length; i++){

            address rec = stakers[i];
            uint balance = stakingBalance[rec];

            if(balance > 0)
            {
                dappToken.transfer(rec, balance);
            }
        }
    }

}