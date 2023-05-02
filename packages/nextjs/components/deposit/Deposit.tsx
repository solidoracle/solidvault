import { Box, Button, Divider, Grid, GridItem, Input, Select, TabPanel, Text } from "@chakra-ui/react";
import { DataPool } from "~~/services/aave/getDataPools";

interface DepositProps {
  apy: DataPool["apy"];
}

export const Deposit = ({ apy }: DepositProps) => {
  return (
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
        <Box display="flex" justifyContent="space-between">
          <Box>
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
          </Box>
          <Box alignSelf="end">
            <Text fontSize="md" fontWeight="medium" color="gray.400">
              {apy}% APY
            </Text>
          </Box>
        </Box>
        <Button colorScheme="purple" width="100%">
          Deposit
        </Button>
      </form>
    </TabPanel>
  );
};
