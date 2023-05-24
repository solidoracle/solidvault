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
import { useNetwork } from 'wagmi';
import useApprove from '~~/hooks/other/useApprove';
import { DataPool } from '~~/services/aave/getDataPools';

export type CurrencyCode = 'ETH' | 'WETH';
interface DepositProps {
  apy: DataPool['apy'];
}

export const Deposit = ({ apy }: DepositProps) => {
  const { wethApprove, allowance, isLoading: isApproveLoading } = useApprove();
  const { handleDeposit, isLoading, isError, depositValue, setDepositValue } = useDeposit();
  const { sovBalance } = useSovBalance();
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
        <Box display="flex" justifyContent="space-between">
          <Box>
            <Box display="flex">
              <Text fontSize="xl" marginRight={2} marginBottom={0} fontWeight="medium">
                {/* TODO: This should be the amount of SOV you will receive based on the depositValue */}
                {sovBalance}
              </Text>
              <Text fontSize="xl" marginBottom={0} fontWeight="medium">
                SOV
              </Text>
            </Box>
            <Box display="flex">
              {/* TODO: Do we need the minimum amount? */}
              <Text fontSize="md" marginRight={2} marginTop={0} fontWeight="medium" color="gray.400">
                Minimum:
              </Text>
              <Text fontSize="md" marginTop={0} fontWeight="medium" color="gray.400">
                0.000000
              </Text>
            </Box>
          </Box>
          <Box alignSelf="end">
            <Text fontSize="md" fontWeight="medium" color="gray.400">
              {apy}% APY
            </Text>
          </Box>
        </Box>
        <Button
          colorScheme="purple"
          width="100%"
          onClick={() => handleDeposit({ currencyCode })}
          isDisabled={depositValue <= 0 || isError}
          isLoading={isLoading}>
          Deposit
        </Button>
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
