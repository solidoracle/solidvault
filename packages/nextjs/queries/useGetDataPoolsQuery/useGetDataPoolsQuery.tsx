import { useQuery } from "react-query";
import { getDataPools } from "~~/services/aave/getDataPools";
import { DataPool } from "~~/services/aave/getDataPools";

export const useGetDataPoolsQuery = () => {
  return useQuery<DataPool[]>(["getDataPools"], () => getDataPools());
};
