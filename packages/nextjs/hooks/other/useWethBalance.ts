import { WETH_CONTRACT_ADDRESS } from '../../utils/constants';
import { useAccount, useBalance } from 'wagmi';

export const useWethBalance = () => {
  const { address } = useAccount();
  const { data } = useBalance({
    address: address,
    token: WETH_CONTRACT_ADDRESS,
  });

  return { wethBalance: data?.formatted ? data.formatted : '0.000' };
};
