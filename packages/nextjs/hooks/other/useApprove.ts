import { useState } from 'react';
import { parseEther } from './useDeposit';
import { BigNumber } from 'ethers';
import { useAccount, useContractRead, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { SOLIDVAULT_CONTRACT_ADDRESS, WETH_ABI, WETH_CONTRACT_ADDRESS } from '~~/utils/constants';

export default function useApprove() {
  const [allowance, setAllowance] = useState(BigNumber.from('0'));
  const [approveAmount, setApproveAmount] = useState(0);
  const { address } = useAccount();
  const [approveHash, setApproveHash] = useState('');

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

  const { write: wethApprove } = useContractWrite({
    ...wethApproveConfig,
    onSuccess(data) {
      setApproveHash(data.hash);
    },
  });

  const { isLoading: isApproveProcessing } = useWaitForTransaction({
    enabled: !!approveHash,
    hash: approveHash as `0x${string}`,
    // TODO: onSuccess: Show success toast message
    onSuccess: (data: any) => console.log('completed', data),
    // TODO: onError: Show error toast message
  });

  const approve = async (amount: number) => {
    setApproveAmount(amount);
    await wethApprove?.();
  };

  return { allowance, approve, isApproveProcessing };
}
