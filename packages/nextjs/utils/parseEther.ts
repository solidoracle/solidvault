import { ethers } from 'ethers';

export const parseEther = (value: number) => {
  if (!value || value === 0) {
    return ethers.utils.parseEther('0');
  }
  return ethers.utils.parseEther(value.toString());
};
