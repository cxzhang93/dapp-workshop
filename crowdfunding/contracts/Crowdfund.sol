// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @notice A single-campaign classroom example using native ETH.
contract Crowdfund {
    address payable public immutable owner;
    uint public immutable goal;
    uint public immutable deadline;
    // Historical total; it does not decrease when a supporter receives a refund.
    uint public raised;
    bool public claimed;
    mapping(address => uint) public contributions;

    event Contributed(address indexed supporter, uint amount);
    event Refunded(address indexed supporter, uint amount);
    event Claimed(uint amount);

    constructor(uint target, uint duration) {
        require(target > 0 && duration > 0, "Invalid campaign");
        owner = payable(msg.sender);
        goal = target;
        deadline = block.timestamp + duration;
    }

    function contribute() external payable {
        require(block.timestamp < deadline, "Campaign ended");
        require(msg.value > 0, "Zero contribution");
        contributions[msg.sender] += msg.value;
        raised += msg.value;
        emit Contributed(msg.sender, msg.value);
    }

    function claim() external {
        require(msg.sender == owner, "Owner only");
        require(block.timestamp >= deadline && raised >= goal, "Goal not settled");
        require(!claimed, "Already claimed");
        claimed = true;
        uint amount = address(this).balance;
        (bool ok,) = owner.call{value: amount}("");
        require(ok, "Transfer failed");
        emit Claimed(amount);
    }

    function refund() external {
        require(block.timestamp >= deadline && raised < goal, "Refund unavailable");
        uint amount = contributions[msg.sender];
        require(amount > 0, "Nothing to refund");
        // Clear the credit before the external call. A failure rolls back the change.
        contributions[msg.sender] = 0;
        (bool ok,) = payable(msg.sender).call{value: amount}("");
        require(ok, "Transfer failed");
        emit Refunded(msg.sender, amount);
    }
}
