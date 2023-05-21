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
import { DataPool } from '~~/services/aave/getDataPools';

interface DepositProps {
  apy: DataPool['apy'];
}

export const Deposit = ({ apy }: DepositProps) => {
  const { handleDeposit, isLoading, isError, depositValue, setDepositValue } = useDeposit();
  const { sovBalance } = useSovBalance();

  return (
    <TabPanel px={0} pt={6}>
      {isError ? (
        <Error />
      ) : (
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
              <Select>
                <option value="option1">ETH</option>
                <option value="option2">WETH</option>
              </Select>
            </GridItem>
          </Grid>
          <Divider orientation="horizontal" />
          <Box display="flex" justifyContent="space-between">
            <Box>
              <Box display="flex">
                <Text fontSize="xl" marginRight={2} marginBottom={0} fontWeight="medium">
                  {sovBalance}
                </Text>
                <Text fontSize="xl" marginBottom={0} fontWeight="medium">
                  SOV
                </Text>
              </Box>
              <Box display="flex">
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
            onClick={handleDeposit}
            isDisabled={depositValue <= 0}
            isLoading={isLoading}>
            Deposit
          </Button>
        </form>
      )}
    </TabPanel>
  );
};

const Error = () => {
  return (
    <Box>
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>Unable to allow deposits</AlertTitle>
        <AlertDescription>Please try again later.</AlertDescription>
      </Alert>
    </Box>
  );
};
