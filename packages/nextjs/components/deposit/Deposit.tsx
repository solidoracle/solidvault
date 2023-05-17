import { Dispatch, SetStateAction, useState } from "react";
import { SOLIDVAULT_ABI, SOLIDVAULT_CONTRACT_ADDRESS, WETH_ABI, WETH_CONTRACT_ADDRESS } from "./constants";
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
import { useAccount, useContractRead, useContractWrite } from "wagmi";
import { DataPool } from "~~/services/aave/getDataPools";

interface DepositProps {
  apy: DataPool["apy"];
}

export const Deposit = ({ apy }: DepositProps) => {
  const { address } = useAccount();
  const [depositValue, setDepositValue] = useState(0);

  // const { writeAsync: deposit, isLoading: isDepositLoading } = useScaffoldContractWrite({
  //   contractName: "SolidVault",
  //   functionName: "deposit",
  //   args: [
  //     depositValue.toString() == "" ? ethers.utils.parseEther("0") : ethers.utils.parseEther(depositValue.toString()),
  //     address,
  //   ],
  // });

  const { write: approve } = useContractWrite({
    address: WETH_CONTRACT_ADDRESS,
    abi: WETH_ABI,
    functionName: "approve",
    mode: "recklesslyUnprepared",
    args: [SOLIDVAULT_CONTRACT_ADDRESS, ethers.utils.parseEther(depositValue.toString())],
  });

  const { data: allowance } = useContractRead({
    address: WETH_CONTRACT_ADDRESS,
    abi: WETH_ABI,
    functionName: "approve",
    args: [address, SOLIDVAULT_CONTRACT_ADDRESS],
  });

  console.log(allowance, "allowance");

  const { write: deposit, isLoading: isDepositLoading } = useContractWrite({
    address: SOLIDVAULT_CONTRACT_ADDRESS,
    abi: SOLIDVAULT_ABI,
    functionName: "deposit",
    mode: "recklesslyUnprepared",
    args: [
      depositValue.toString() == "" ? ethers.utils.parseEther("0") : ethers.utils.parseEther(depositValue.toString()),
      address,
    ],
    onError: error => {
      console.log(error);
    },
  });

  const onDeposit = async () => {
    // approve();
    deposit();
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
                0.000000
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
        <Button colorScheme="purple" width="100%" onClick={() => onDeposit()} isLoading={isDepositLoading}>
          Deposit
        </Button>
      </form>
    </TabPanel>
  );
};
