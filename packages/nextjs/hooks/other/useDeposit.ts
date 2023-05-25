import { useState } from 'react';
import { CurrencyCode } from '../../components/deposit';
import { SOLIDVAULT_ABI, SOLIDVAULT_CONTRACT_ADDRESS } from '../../components/deposit/constants';
import { ethers } from 'ethers';
import {
  useAccount,
  useContractWrite,
  usePrepareContractWrite,
  usePrepareSendTransaction,
  useSendTransaction,
  useWaitForTransaction,
} from 'wagmi';
import useApprove from '~~/hooks/other/useApprove';

export const useDeposit = () => {
  const { address } = useAccount();
  const { approve, allowance } = useApprove();
  const [depositValue, setDepositValue] = useState(0);
  const [sendTransactionHash, setSendTransactionHash] = useState('');

  const { config: depositConfig } = usePrepareContractWrite({
    address: SOLIDVAULT_CONTRACT_ADDRESS,
    abi: SOLIDVAULT_ABI,
    functionName: 'deposit',
    args: [parseEther(depositValue), address],
  });

  const { write: deposit } = useContractWrite({
    ...depositConfig,
  });

  // usePrepareSendTransaction is used to prepare the config that is passed to useSendTransaction (as recommended by Wagmi docs)
  const { config } = usePrepareSendTransaction({
    request: { to: SOLIDVAULT_CONTRACT_ADDRESS, value: parseEther(depositValue) },
  });

  // useSendTransaction calls the fallback function inside the contract ('receive'). This hook is only used for sending ETH.
  const { sendTransaction: sendEth } = useSendTransaction({
    ...config,
    onSuccess: (data: any) => setSendTransactionHash(data.hash),
  });

  // useWaitForTransaction takes the hash of a processing transaction and provides updates on where the transaction is up to.
  const { isLoading: isDepositProcessing } = useWaitForTransaction({
    enabled: !!sendTransactionHash,
    hash: sendTransactionHash as `0x${string}`,
    // TODO: onSuccess: Show success toast message
    onSuccess: (data: any) => console.log('completed', data),
    // TODO: onError: Show error toast message
  });

  const handleDeposit = ({ currencyCode }: CurrencyCode) => {
    // if 'WETH' we need to make sure the user has approved the value of WETH before allowing them to deposit.
    if (currencyCode === 'WETH') {
      if (allowance.lt(parseEther(depositValue))) {
        approve(depositValue);
      }

      console.log({ deposit });
      if (!deposit) {
        // TODO: Handle deposit not existing
        return;
      }

      deposit();
      return;
    }

    if (!sendEth) {
      // TODO: Handle sendETH not existing
      return;
    }

    sendEth();
    return;
  };

  return { handleDeposit, depositValue, setDepositValue, isDepositProcessing };
};

// TODO: Move to a util
export const parseEther = (value: number) => {
  if (!value || value === 0) {
    return ethers.utils.parseEther('0');
  }
  return ethers.utils.parseEther(value.toString());
};
