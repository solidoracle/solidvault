import { useState } from "react";
import Head from "next/head";
import {
  Box,
  Button,
  Container,
  Divider,
  Grid,
  GridItem,
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
  Select,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from "@chakra-ui/react";
import type { NextPage } from "next";
import { MdSettings } from "react-icons/md";

// TODO: Color variables (/color scheme)
// TODO: Componentise

const Home: NextPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [slippage, setSlippage] = useState(0.5);
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
                <Tab>Redeem</Tab>
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
              <TabPanel px={0} pt={6}>
                <form>
                  <Grid gridTemplateColumns={"1.4fr 1fr"} gap={4} mb={5}>
                    <GridItem>
                      <Input placeholder="1.5" type="number" />
                    </GridItem>
                    <GridItem>
                      <Select>
                        <option value="option1">WMATIC</option>
                        <option value="option2">MATIC</option>
                      </Select>
                    </GridItem>
                  </Grid>
                  <Divider orientation="horizontal" />
                  <Box display="flex">
                    <Text fontSize="xl" marginRight={2} marginBottom={0} fontWeight="medium">
                      0.000000
                    </Text>
                    <Text fontSize="xl" marginBottom={0} fontWeight="medium">
                      SVT
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
                  <Button colorScheme="purple" width="100%">
                    Deposit
                  </Button>
                </form>
              </TabPanel>
              <TabPanel px={0}>
                <form>
                  <Grid alignItems="center" gridTemplateColumns={"1.4fr 1fr"} gap={4} mb={5}>
                    <GridItem>
                      <Input placeholder="1.5" type="number" />
                    </GridItem>
                    <GridItem>
                      <Text fontSize="lg" my={0}>
                        SVT
                      </Text>
                    </GridItem>
                  </Grid>
                  <Divider orientation="horizontal" />
                  <Box display="flex">
                    <Text fontSize="xl" marginRight={2} marginBottom={0} fontWeight="medium">
                      0.000000
                    </Text>
                    <Text fontSize="xl" marginBottom={0} fontWeight="medium">
                      WMATIC
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
                  <Button colorScheme="purple" width="100%">
                    Redeem
                  </Button>
                </form>
              </TabPanel>
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
