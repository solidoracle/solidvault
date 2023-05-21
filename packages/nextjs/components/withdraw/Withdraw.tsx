import { Box, Button, Divider, Grid, GridItem, Input, TabPanel, Text } from '@chakra-ui/react';

export const Withdraw = () => {
  return (
    <TabPanel px={0}>
      <form>
        <Grid alignItems="center" gridTemplateColumns={'1.4fr 1fr'} gap={4} mb={5}>
          <GridItem>
            <Input placeholder="1.5" type="number" />
          </GridItem>
          <GridItem>
            <Text fontSize="lg" my={0}>
              SOV
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
          Withdraw
        </Button>
      </form>
    </TabPanel>
  );
};
