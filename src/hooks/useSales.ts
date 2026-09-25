import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cancelSale, createSale, getSales, SalesResponse } from "@/services/salesService";

export function useSales() {
  const queryClient = useQueryClient();

  const salesQuery = useQuery<SalesResponse>({
    queryKey: ["sales"],
    queryFn: getSales,
  });

  const createSaleMutation = useMutation({
    mutationFn: createSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
    },
  });

  const cancelSaleMutation = useMutation({
    mutationFn: cancelSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
    },
  });

  return { salesQuery, createSale: createSaleMutation, cancelSale: cancelSaleMutation };
}
