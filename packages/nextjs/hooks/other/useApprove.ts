import { useState } from 'react';
import { parseEther } from './useDeposit';
import { BigNumber, ethers } from 'ethers';
import { useAccount, useContractRead, useContractWrite, usePrepareContractWrite } from 'wagmi';
import { SOLIDVAULT_CONTRACT_ADDRESS, WETH_ABI, WETH_CONTRACT_ADDRESS } from '~~/components/deposit/constants';

// TODO: Should these be Scaffold ETH hooks? -> solidoracle: no as we need to pass in the weth contract address that is not in scaffold-eth
export default function useApprove() {
  const [allowance, setAllowance] = useState(BigNumber.from('0'));
  const [approveAmount, setApproveAmount] = useState(0);
  const { address } = useAccount();

  useContractRead({
    address: WETH_CONTRACT_ADDRESS,
    abi: WETH_ABI,
    functionName: 'allowance',
    args: [address, SOLIDVAULT_CONTRACT_ADDRESS],
    watch: true,
    onSuccess(data: BigNumber) {
      setAllowance(data);
    },
  });

  const { config: wethApproveConfig } = usePrepareContractWrite({
    address: WETH_CONTRACT_ADDRESS,
    abi: WETH_ABI,
    functionName: 'approve',
    args: [SOLIDVAULT_CONTRACT_ADDRESS, parseEther(approveAmount)],
  });

  const { write: wethApprove, isLoading } = useContractWrite({
    ...wethApproveConfig,
  });

  const approve = async (amount: number) => {
    setApproveAmount(amount);
    await wethApprove?.();
  };

  return { allowance, isLoading, approve };
}
