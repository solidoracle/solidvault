import { useState } from "react";
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
} from "@chakra-ui/react";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import useApprove from "~~/hooks/other/useApprove";
import { useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { DataPool } from "~~/services/aave/getDataPools";

interface DepositProps {
  apy: DataPool["apy"];
}

export const Deposit = ({ apy }: DepositProps) => {
  const { address } = useAccount();
  const [depositValue, setDepositValue] = useState(0);
  const { wethApprove, allowance } = useApprove();
  const [isDepositing, setIsDepositing] = useState(false);

  const { writeAsync: deposit } = useScaffoldContractWrite({
    contractName: "SolidVault",
    functionName: "deposit",
    args: [
      depositValue.toString() == "" ? ethers.utils.parseEther("0") : ethers.utils.parseEther(depositValue.toString()),
      address,
    ],
  });

  const { data: sovBalance } = useScaffoldContractRead({
    contractName: "SolidVault",
    functionName: "balanceOf",
    args: [address],
  });

  const handleDeposit = async () => {
    setIsDepositing(true);

    if (Number(ethers.utils.formatEther(allowance)) < Number(depositValue)) {
      wethApprove?.();
      return deposit?.();
      setIsDepositing(false);
    } else {
      return deposit?.();
      setIsDepositing(false);
    }
  };

  return (
    <TabPanel px={0} pt={6}>
      <form>
        <Grid gridTemplateColumns={"1.4fr 1fr"} gap={4} mb={5}>
          <GridItem>
            <NumberInput
              onChange={(stringVal, numberVal) => {
                setDepositValue(numberVal);
              }}
            >
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
                {sovBalance ? ethers.utils.formatEther(sovBalance) : "0.000"}
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
        <Button colorScheme="purple" width="100%" onClick={handleDeposit} isLoading={isDepositing}>
          Deposit
        </Button>
      </form>
    </TabPanel>
  );
};
