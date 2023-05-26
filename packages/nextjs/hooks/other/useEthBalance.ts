import { useAccount, useBalance } from 'wagmi';

export const useEthBalance = () => {
  const { address } = useAccount();
  const { data } = useBalance({
    address: address,
  });

  return { ethBalance: data?.formatted ? data.formatted : '0.000' };
};
