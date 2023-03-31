import { useContractReader } from "eth-hooks";
import React, { useCallback, useState, useEffect } from "react";

export default function PotTimer({ readContracts }) {
  const [secsLapsed, setSecsLapsed] = useState(-999);
  const timer = useContractReader(readContracts, "TimedLottery", "timer");
  const claimPeriod = 5 * 60;

  function secsToHMS(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const pad = num => (num < 10 ? "0" + num : num);

    return `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`;
  }

  const refreshClock = useCallback(() => {
    if (timer) {
      const nowDate = new Date();
      const date = new Date(timer.toNumber() * 1000);
      const secs = (nowDate.getTime() - date.getTime()) / 1000;
      setSecsLapsed(secs);
    }
  }, [timer]);

  useEffect(() => {
    const timerId = setInterval(refreshClock, 1000);
    return function cleanup() {
      clearInterval(timerId);
    };
  }, [refreshClock]);

  if (secsLapsed < 0) {
    return <span>{secsToHMS(secsLapsed * -1)} seconds left!</span>;
  }

  if (secsLapsed - claimPeriod < 0) {
    return <span>{secsToHMS((secsLapsed - claimPeriod) * -1)} seconds left to claim!</span>;
  }

  return <div>You can start your journey</div>;
}
