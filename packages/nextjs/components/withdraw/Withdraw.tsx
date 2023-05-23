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
        <Button colorScheme="purple" width="100%">
          Withdraw
        </Button>
      </form>
    </TabPanel>
  );
};
