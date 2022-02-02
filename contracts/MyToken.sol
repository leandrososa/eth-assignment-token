pragma solidity 0.6.1;

import "./ERC20Mintable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";

contract MyToken is ERC20Mintable, ERC20Detailed {
    constructor(uint256 amount) ERC20Detailed("StarDucks Cappucino Token", "CAPPU", 0) public {
        mint(msg.sender, amount);
    }
}