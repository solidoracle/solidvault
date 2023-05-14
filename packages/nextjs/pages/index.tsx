import { useState } from "react";
import Head from "next/head";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Container,
  Divider,
  Icon,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Tab,
  TabList,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";
import { ethers } from "ethers";
import type { NextPage } from "next";
import { MdSettings } from "react-icons/md";
import { useAccount } from "wagmi";
import { Deposit } from "~~/components/deposit";
import { Withdraw } from "~~/components/withdraw";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { useGetDataPoolsQuery } from "~~/queries/useGetDataPoolsQuery";

// TODO: Color variables (/color scheme)
// TODO: Add a QueryLoader

const Home: NextPage = () => {
  const { address } = useAccount();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [slippage, setSlippage] = useState(0.5);
  const [depositValue, setDepositValue] = useState(0);
  const { data: poolData, isLoading, isError } = useGetDataPoolsQuery(); // TODO: Still not sure this is the right pool?

  const { writeAsync: deposit, isLoading: isDepositLoading } = useScaffoldContractWrite({
    contractName: "SolidVault",
    functionName: "deposit",
    args: [
      depositValue.toString() == "" ? ethers.utils.parseEther("0") : ethers.utils.parseEther(depositValue.toString()),
      address,
      ethers.utils.parseEther("0"),
    ],
  });

  if (isLoading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" sx={{ minHeight: "30vh" }}>
        <Spinner size="xl" />
      </Box>
    );
  }

  // TODO: Update this to find the pool with the correct address
  if (isError || !poolData?.[0]?.apy) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" sx={{ minHeight: "30vh" }}>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Unable to connect to Aave</AlertTitle>
          <AlertDescription>We cannot retrieve the current APY.</AlertDescription>
        </Alert>
      </Box>
    );
  }

  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <title>🔮🏦SolidVault</title>
        <meta name="description" content="Created with 🏗 scaffold-eth" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Bai+Jamjuree&display=swap" rel="stylesheet" />
      </Head>
      <main>
        <Container mt={10} border="1px solid" borderColor="gray.400" borderRadius={12} px={10} py={4}>
          <Tabs width="100%" colorScheme="purple">
            <TabList display="flex" justifyContent="space-between">
              <Box display="flex">
                <Tab>Deposit</Tab>
                <Tab>Withdraw</Tab>
              </Box>
              <Box>
                <IconButton
                  size="lg"
                  bg="transparent"
                  icon={<Icon as={MdSettings} />}
                  aria-label="Slippage"
                  onClick={() => setIsModalOpen(true)}
                />
              </Box>
            </TabList>
            <TabPanels>
              <Deposit apy={poolData[0].apy} setDepositValue={setDepositValue} deposit={deposit} />
              <Withdraw />
            </TabPanels>
          </Tabs>
        </Container>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Slippage %</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Box display="flex" gap={2}>
                <Button colorScheme="purple" variant="outline" onClick={() => setSlippage(0.5)}>
                  0.5
                </Button>
                <Button colorScheme="purple" variant="outline" onClick={() => setSlippage(1.0)}>
                  1.0
                </Button>
              </Box>
              <Divider my={4} />
              <Input
                placeholder="Custom slippage"
                type="number"
                borderColor="purple.500"
                value={slippage}
                onChange={e => setSlippage(e.target.valueAsNumber)}
              />
            </ModalBody>

            <ModalFooter>
              <Button colorScheme="purple" mr={3} onClick={() => setIsModalOpen(false)}>
                Apply
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </main>
    </>
  );
};

export default Home;
