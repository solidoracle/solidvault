import { WETH_CONTRACT_ADDRESS } from '../../components/deposit/constants';
import { useAccount, useBalance } from 'wagmi';

// TODO: Handle isError/isLoading in a generic query loader component
// TODO: use useBalance in the useSovBalance hook

export const useWethBalance = () => {
  const { address } = useAccount();
  const { data, isError, isLoading } = useBalance({
    address: address,
    token: WETH_CONTRACT_ADDRESS,
  });

  return { wethBalance: data?.formatted ? data.formatted : '0.000' };
};
