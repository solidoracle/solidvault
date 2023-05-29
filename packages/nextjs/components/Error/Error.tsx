import { Alert, AlertDescription, AlertIcon, AlertTitle, Box } from '@chakra-ui/react';

export const Error = ({ errorTitle, errorDescription }: { errorTitle: string; errorDescription: string }) => {
  return (
    <Box my="6">
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>{errorTitle}</AlertTitle>
        <AlertDescription>{errorDescription}</AlertDescription>
      </Alert>
    </Box>
  );
};
