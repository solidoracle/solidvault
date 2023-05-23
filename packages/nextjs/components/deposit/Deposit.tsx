import { useState } from 'react';
import { useDeposit } from '../../hooks/other/useDeposit';
import { useSovBalance } from '../../hooks/other/useSovBalance';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
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

export const Deposit = ({ apy }: DepositProps) => {
  const { wethApprove, allowance } = useApprove();
  const { handleDeposit, isLoading, isError, depositValue, setDepositValue } = useDeposit();
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>('ETH');
  const noAllowanceSet = Number(ethers.utils.formatEther(allowance)) === 0;
  const allowanceToLow = Number(depositValue) > Number(ethers.utils.formatEther(allowance));
  const isWeth = currencyCode === 'WETH';

  return (
    <TabPanel px={0} pt={6}>
      {isError && <Error />}
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
          <Button colorScheme="green" mb="2" width="100%" onClick={wethApprove}>
            Approve
          </Button>
        ) : (
          <Button
            colorScheme="purple"
            width="100%"
            onClick={() => handleDeposit({ currencyCode })}
            isDisabled={depositValue <= 0 || isError}
            isLoading={isLoading}>
            Deposit
          </Button>
        )}
      </form>
    </TabPanel>
  );
};

const Error = () => {
  return (
    <Box mb="6">
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>Unable to allow deposits</AlertTitle>
        <AlertDescription>Please try again later.</AlertDescription>
      </Alert>
    </Box>
  );
};
