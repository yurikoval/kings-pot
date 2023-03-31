pragma solidity ^0.8.0;
//SPDX-License-Identifier: MIT

contract TimedLottery {
  address payable public lastDonor; // the last person to put into the pot; becomes the winner of the pot
  address payable public owner;
  uint256 public potSize; // track the size of the pot
  uint256 public timer; // track the timestamp when timer runs out
  uint256 public constant timerReset = (24 hours) * 6 * 30; // initial time when the timer reset => timer = now() + timerReset
  uint256 public constant timerIncrement = 15 minutes; // how much time to add when someone transfers eth into the pot
  uint256 public constant ownerPercentage = 20;
  uint256 public constant claimPeriod = 5 minutes;

  constructor() {
    owner = payable(msg.sender);
    timer = block.timestamp + timerReset;
  }

  function fund() external payable {
    require(!(block.timestamp > timer && block.timestamp < timer + claimPeriod), "Funding is closed during claim period");
    require(msg.value > 0, "funding amount must be greater than 0.");

    // rollover
    if (potSize > 0 && block.timestamp > timer + claimPeriod) { rolloverPot(); }

    lastDonor = payable(msg.sender);
    potSize += msg.value;

    if (timer < block.timestamp) {
        // restart the game
        timer = block.timestamp + timerReset;
    } else {
        // regular increment
        timer += timerIncrement;
    }
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

  function rolloverPot() internal {
    uint256 ownerAmount = (potSize * ownerPercentage) / 100;
    uint256 rolloverAmount = potSize - ownerAmount;
    owner.transfer(ownerAmount);
    potSize = rolloverAmount;
    timer = block.timestamp + timerReset;
  }

  receive() external payable {}
  fallback() external payable {}
}
