// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

// this will forward all ethers to 0x0
// need to configure to forward ERC20 instead (trivial change)
// WARNING: needs relatively high gas limit (~32,000)
// does not write string to blockchain since it is an internal transaction

contract Burner {
    function Burn() payable public {
        bytes memory sendData = abi.encode("hello there");
        (bool success,) = address(0).call{value: msg.value}(sendData);
        require(success);
        // payable(address(0)).call({value: msg.value ether})(abi.encode("HELLO THERE!"));
    }
}