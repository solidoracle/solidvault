import { useState } from 'react';
import { CurrencyCode } from '../../components/deposit';
import { SOLIDVAULT_CONTRACT_ADDRESS } from '../../components/deposit/constants';
import { useScaffoldContractWrite } from '../scaffold-eth';
import { ethers } from 'ethers';
import { useAccount, usePrepareSendTransaction, useSendTransaction, useWaitForTransaction } from 'wagmi';
import useApprove from '~~/hooks/other/useApprove';

export const useDeposit = () => {
  const { address } = useAccount();
  const { approve, allowance } = useApprove();
  const [depositValue, setDepositValue] = useState(0);
  const [sendTransactionHash, setSendTransactionHash] = useState('');

  // useScaffoldContractWrite writes to the specified function in the specified contract.
  const { writeAsync: deposit } = useScaffoldContractWrite({
    contractName: 'SolidVault',
    functionName: 'deposit',
    args: [parseEther(depositValue), address],
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
    hash: sendTransactionHash,
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
      deposit();
      return;
    }

    if (!sendEth) {
      // TODO: Handle sendETH not existing properly - or will it always exist?
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
