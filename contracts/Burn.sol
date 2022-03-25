// this is self destructing
pragma solidity ^0.4.11;

contract Burner {
    uint256 public totalBurned;

    function Purge() public {
        assembly {
            mstore(0, 0x30ff)
            // transfer all funds to a new contract that will selfdestruct
            // and destroy all ether in the process.
            create(balance(address), 30, 2)
            pop
        }
    }

    function Burn() payable {
        totalBurned += msg.value;
    }
}