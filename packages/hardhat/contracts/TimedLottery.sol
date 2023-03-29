pragma solidity ^0.8.0;
//SPDX-License-Identifier: MIT

contract TimedLottery {
  address payable public lastDonor; // the last person to put into the pot; becomes the winner of the pot
  uint256 public potSize; // track the size of the pot
  uint256 public timer; // track the timestamp when timer runs out
  uint256 public constant timerReset = (24 hours) * 6 * 30; // initial time when the timer reset => timer = now() + timerReset
  uint256 public constant timerIncrement = 15 minutes; // how much time to add when someone transfers eth into the pot

  constructor() {
    timer = block.timestamp + timerReset;
  }

  function fund() external payable {
    require(msg.value > 0, "funding amount must be greater than 0.");
    require(block.timestamp < timer, "Funding window is closed.");

    lastDonor = payable(msg.sender);
    potSize += msg.value;
    timer += timerIncrement;
  }

  function claimPot() external {
    require(block.timestamp > timer, "Claim window is closed.");
    require(potSize > 0, "Pot is empty.");
    require(msg.sender == lastDonor, "Only the winner can claim the potSize.");

    uint256 amount = potSize;
    potSize = 0;
    lastDonor.transfer(amount);

    // reset timer
    timer = block.timestamp + timerReset;
  }

  receive() external payable {}
  fallback() external payable {}
}
