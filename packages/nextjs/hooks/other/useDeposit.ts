import { useState } from 'react';
import { CurrencyCode } from '../../components/deposit';
import { SOLIDVAULT_CONTRACT_ADDRESS } from '../../components/deposit/constants';
import { useScaffoldContractWrite } from '../scaffold-eth';
import { ethers } from 'ethers';
import { useAccount, usePrepareSendTransaction, useSendTransaction } from 'wagmi';
import useApprove from '~~/hooks/other/useApprove';

export const useDeposit = () => {
  const { address } = useAccount();
  const { wethApprove, allowance } = useApprove();
  const [depositValue, setDepositValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const { writeAsync: deposit } = useScaffoldContractWrite({
    contractName: 'SolidVault',
    functionName: 'deposit',
    args: [parseEther(depositValue), address],
  });

  const { config } = usePrepareSendTransaction({
    request: { to: SOLIDVAULT_CONTRACT_ADDRESS, value: parseEther(depositValue) },
  });
  const { sendTransaction: sendEth } = useSendTransaction(config);

  const handleDeposit = ({ currencyCode }: CurrencyCode) => {
    setIsLoading(true);

    if (!wethApprove) {
      // TODO: Make error a string value not boolean so different errors can be returned
      setIsError(true);
      return;
    }

    if (currencyCode === 'WETH') {
      deposit();
      setIsLoading(false);
      return;
    }

    sendEth();
    setIsLoading(false);
    return;
  };

  return { handleDeposit, isLoading, isError, depositValue, setDepositValue };
};

const parseEther = (value: number) => {
  if (!value || value === 0) {
    return ethers.utils.parseEther('0');
  }
  return ethers.utils.parseEther(value.toString());
};
