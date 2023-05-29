import { useState } from 'react';
import Head from 'next/head';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Container,
  Spinner,
  Tab,
  TabList,
  TabPanels,
  Tabs,
  Text,
} from '@chakra-ui/react';
import type { NextPage } from 'next';
import { Deposit } from '~~/components/deposit';
import { Withdraw } from '~~/components/withdraw';
import { useSovBalance } from '~~/hooks/other/useSovBalance';
import { useGetDataPoolsQuery } from '~~/queries/useGetDataPoolsQuery';

// TODO: Color variables (/color scheme)
// TODO: Add a QueryLoader

const Home: NextPage = () => {
  const { data: poolData, isLoading, isError } = useGetDataPoolsQuery(); // TODO: Still not sure this is the right pool?
  const { sovBalance } = useSovBalance();

  if (isLoading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" sx={{ minHeight: '30vh' }}>
        <Spinner size="xl" />
      </Box>
    );
  }

  // TODO: Update this to find the pool with the correct address
  if (isError || !poolData?.[0]?.apy) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" sx={{ minHeight: '30vh' }}>
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
            </TabList>
            <TabPanels>
              <Deposit apy={poolData[0].apy} />
              <Withdraw />
            </TabPanels>
          </Tabs>
          <Text fontSize="md" fontWeight="medium" color="gray.400">
            SOV Balance: {sovBalance}
          </Text>
        </Container>
      </main>
    </>
  );
};

export default Home;
