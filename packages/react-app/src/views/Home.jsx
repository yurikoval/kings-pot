import React, { useState } from "react";
import { ethers } from "ethers";
import { useContractReader } from "eth-hooks";
import { Button } from "antd";
import { EtherInput, PotTimer } from "../components";

function Home({ readContracts, tx, writeContracts }) {
  const potSizeBigNumber = useContractReader(readContracts, "TimedLottery", "potSize");
  const potSize = !potSizeBigNumber ? 0 : ethers.utils.formatEther(potSizeBigNumber);

  const [fundAmount, setFundAmount] = useState(ethers.utils.parseEther("0"));

  console.log(tx);
  console.log(readContracts);
  console.log(writeContracts);
  return (
    <div>
      <div>King's Pot: {potSize} ETH</div>
      <EtherInput
        onChange={amt => {
          try {
            const newValue = amt.startsWith(".") ? `0${amt}` : amt;
            setFundAmount(ethers.utils.parseEther("" + newValue));
          } catch (e) {
            console.error(e);
            setFundAmount(ethers.utils.parseEther("0"));
          }
        }}
      />
      <Button
        onClick={async () => {
          /* notice how you pass a call back for tx updates too */
          const result = tx(writeContracts.TimedLottery.fund({ value: fundAmount }), update => {
            console.log("📡 Transaction Update:", update);
            if (update && (update.status === "confirmed" || update.status === 1)) {
              console.log(" 🍾 Transaction " + update.hash + " finished!");
              console.log(
                `⛽️ ${update.gasUsed}/${update.gasLimit || update.gas} @ ${
                  parseFloat(update.gasPrice) / 1000000000
                } gwei`,
              );
            }
          });
          console.log("awaiting metamask/web3 confirm result...", result);
          console.log(await result);
        }}
      >
        Add to Pot!
      </Button>
      <PotTimer readContracts={readContracts} />
    </div>
  );
}

export default Home;
