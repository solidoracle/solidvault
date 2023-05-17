import { useState } from "react";
import { BigNumber, ethers } from "ethers";
import { useAccount, useContractRead, useContractWrite, usePrepareContractWrite } from "wagmi";
import {
  SOLIDVAULT_ABI,
  SOLIDVAULT_CONTRACT_ADDRESS,
  WETH_ABI,
  WETH_CONTRACT_ADDRESS,
} from "~~/components/deposit/constants";

export default function useApprove() {
  const [allowance, setAllowance] = useState(BigNumber.from("0"));
  const { address } = useAccount();

  useContractRead({
    address: WETH_CONTRACT_ADDRESS,
    abi: WETH_ABI,
    functionName: "allowance",
    args: [address, SOLIDVAULT_CONTRACT_ADDRESS],
    watch: true,
    onSuccess(data: BigNumber) {
      setAllowance(data);
    },
  });

  const { config: wethApproveConfig } = usePrepareContractWrite({
    address: WETH_CONTRACT_ADDRESS,
    abi: WETH_ABI,
    functionName: "approve",
    args: [SOLIDVAULT_CONTRACT_ADDRESS, ethers.utils.parseEther("100")],
  });

  const { write: wethApprove } = useContractWrite({
    ...wethApproveConfig,
  });

  const { config: sovApproveConfig } = usePrepareContractWrite({
    address: SOLIDVAULT_CONTRACT_ADDRESS,
    abi: SOLIDVAULT_ABI,
    functionName: "approve",
    args: [address, ethers.utils.parseEther("100")],
  });

  const { write: sovApprove } = useContractWrite({
    ...sovApproveConfig,
  });

  return { allowance, wethApprove };
}
