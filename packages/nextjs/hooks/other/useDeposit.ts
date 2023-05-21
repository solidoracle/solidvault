import { useState } from 'react';
import { useScaffoldContractWrite } from '../scaffold-eth';
import { ethers } from 'ethers';
import { useAccount } from 'wagmi';
import useApprove from '~~/hooks/other/useApprove';

export const useDeposit = () => {
  const { address } = useAccount();
  const { wethApprove, allowance } = useApprove();
  const [depositValue, setDepositValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const handleDepositValue = () => {
    if (!depositValue || depositValue === 0) {
      return ethers.utils.parseEther('0');
    }
    return ethers.utils.parseEther(depositValue.toString());
  };

  const { writeAsync: deposit } = useScaffoldContractWrite({
    contractName: 'SolidVault',
    functionName: 'deposit',
    args: [handleDepositValue(), address],
  });

  const handleDeposit = () => {
    setIsLoading(true);

    if (!wethApprove) {
      // TODO: Make error a string value not boolean so different errors can be returned
      setIsError(true);
      return;
    }

    // TODO: Add error here if allowance < depositValue
    if (Number(ethers.utils.formatEther(allowance)) > Number(depositValue)) {
      deposit();
      setIsLoading(false);
      return;
    }
  };

  return { handleDeposit, isLoading, isError, depositValue, setDepositValue };
};
