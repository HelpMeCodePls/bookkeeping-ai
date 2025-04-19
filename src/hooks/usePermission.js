import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export default function usePermission(ledgerId) {
  return useQuery({
    queryKey: ['permission', ledgerId],
    queryFn: () => 
      ledgerId 
        ? axios.get(`/ledgers/${ledgerId}/permission`).then(r => r.data) 
        : Promise.resolve({}),
    enabled: !!ledgerId
  });
}