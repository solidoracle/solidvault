import { ethers } from 'ethers';
import { useAccount, useBalance } from 'wagmi';
import { SOLIDVAULT_TOKEN_ADDRESS } from '~~/utils/constants';

export const useSovBalance = () => {
  const { address } = useAccount();

  const { data: sovBalance } = useBalance({
    address: address,
    token: SOLIDVAULT_TOKEN_ADDRESS,
  });

  return { sovBalance: sovBalance?.formatted ? sovBalance.formatted : '0.000' };
};
