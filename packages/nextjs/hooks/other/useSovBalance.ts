import { useScaffoldContractRead } from "../scaffold-eth";
import { ethers } from "ethers";
import { useAccount } from "wagmi";

export const useSovBalance = () => {
  const { address } = useAccount();

  const { data: sovBalance } = useScaffoldContractRead({
    contractName: "SolidVault",
    functionName: "balanceOf",
    args: [address],
  });

  return { sovBalance: sovBalance ? ethers.utils.formatEther(sovBalance) : "0.000" };
};
