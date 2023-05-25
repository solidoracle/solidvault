import { useState } from 'react';
import { useDeposit } from '../../hooks/other/useDeposit';
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
import { useWethBalance } from '~~/hooks/other/useWethBalance';
import { DataPool } from '~~/services/aave/getDataPools';

export type CurrencyCode = 'ETH' | 'WETH';
interface DepositProps {
  apy: DataPool['apy'];
}

// TODO: Can we watch approve transaction, force a rerender and update the UI once it is complete? Currently you need to refresh the page.
// TODO: Check the APY is coming from the correct pool address
// TODO: Altering the depositValue to x number of decimal places breaks the app - needs investigating.

export const Deposit = ({ apy }: DepositProps) => {
  const { approve, allowance } = useApprove();
  const { wethBalance } = useWethBalance();

  const { handleDeposit, depositValue, setDepositValue, isDepositProcessing } = useDeposit();
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>('ETH');
  const noAllowanceSet = Number(ethers.utils.formatEther(allowance)) === 0;
  const allowanceToLow = Number(depositValue) > Number(ethers.utils.formatEther(allowance));
  const isWeth = currencyCode === 'WETH';
  const insufficentWeth = isWeth && depositValue > Number(wethBalance);

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
            isDisabled={depositValue <= 0 || insufficentWeth}
            isLoading={isDepositProcessing}>
            Deposit
          </Button>
        )}
        {/* TODO: need error for insufficient ETH too? */}
        {insufficentWeth && (
          <Error
            errorTitle="Warning"
            errorDescription="You have insufficient funds to complete this deposit. Please increase your funds or alter the deposit amount before continuing."
          />
        )}
      </form>
    </TabPanel>
  );
};

// TODO: Move to own component
const Error = ({ errorTitle, errorDescription }: { errorTitle: string; errorDescription: string }) => {
  return (
    <Box mb="6">
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>{errorTitle}</AlertTitle>
        <AlertDescription>{errorDescription}</AlertDescription>
      </Alert>
    </Box>
  );
};
