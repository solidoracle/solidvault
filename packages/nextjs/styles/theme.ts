import { tabsTheme } from '../components/Tabs';
import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  initialColorMode: 'system',
  useSystemColorMode: true,
  components: {
    Tabs: tabsTheme,
  },
});

export default theme;
