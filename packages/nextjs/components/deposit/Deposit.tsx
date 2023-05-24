import { useState } from 'react';
import { useDeposit } from '../../hooks/other/useDeposit';
import {
  Box,
  Button,
  Divider,
  Grid,
  GridItem,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  TabPanel,
  Text,
} from '@chakra-ui/react';
import { ethers } from 'ethers';
import useApprove from '~~/hooks/other/useApprove';
import { DataPool } from '~~/services/aave/getDataPools';

export type CurrencyCode = 'ETH' | 'WETH';
interface DepositProps {
  apy: DataPool['apy'];
}

// Questions for Matteo:
// 1. What am I doing wrong with the WETH deposit? I still get the UNPREDICTABLE_GAS_LIMIT error. - I have deployed the contract and updated the SOLIDVAULT_CONTRACT_ADDRESS
// 2. useWaitForTransaction hook takes a hash property that is throwing a lint error. Is there a best way to handle this? Eg. a util to remove the 0x and then add it as a template literal?

// TODO: Can we watch approve transaction, force a rerender and update the UI once it is complete? Currently you need to refresh the page.
// TODO: Check the APY is coming from the correct pool address

export const Deposit = ({ apy }: DepositProps) => {
  const { approve, allowance } = useApprove();
  const { handleDeposit, depositValue, setDepositValue, isDepositProcessing } = useDeposit();
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>('ETH');
  const noAllowanceSet = Number(ethers.utils.formatEther(allowance)) === 0;
  const allowanceToLow = Number(depositValue) > Number(ethers.utils.formatEther(allowance));
  const isWeth = currencyCode === 'WETH';

  return (
    <TabPanel px={0} pt={6}>
      <form>
        <Grid gridTemplateColumns={'1.4fr 1fr'} gap={4} mb={5}>
          <GridItem>
            <NumberInput
              min={0}
              onChange={(_stringVal, numberVal) => {
                setDepositValue(numberVal);
              }}>
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </GridItem>
          <GridItem>
            <Select onChange={e => setCurrencyCode(e.target.value as CurrencyCode)}>
              <option value="ETH">ETH</option>
              <option value="WETH">WETH</option>
            </Select>
          </GridItem>
        </Grid>
        <Divider orientation="horizontal" />
        <Box>
          <Text fontSize="md" fontWeight="medium" color="gray.400">
            {apy}% APY
          </Text>
        </Box>
        {(isWeth && noAllowanceSet) || (isWeth && allowanceToLow) ? (
          <Button colorScheme="green" mb="2" width="100%" onClick={() => approve(depositValue)}>
            Approve
          </Button>
        ) : (
          <Button
            colorScheme="purple"
            width="100%"
            onClick={() => handleDeposit({ currencyCode })}
            isDisabled={depositValue <= 0}
            isLoading={isDepositProcessing}>
            Deposit
          </Button>
        )}
      </form>
    </TabPanel>
  );
};
