import { useState, useCallback, useEffect } from 'react';
import { api } from '../services/apiClient';

interface UserRankResponse {
  userId: number;
  nickname: string;
  titleName: string;
  level: number;
  score: number;
  rank: number;
}

interface RankingResponse {
  topRankers: UserRankResponse[];
  myRank: UserRankResponse;
}

export function useRankings(tab: 'total' | 'local' | 'health') {
  const [data, setData] = useState<RankingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRankings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 탭에 따라 백엔드 엔드포인트 매핑
      let endpoint = '';
      if (tab === 'total') endpoint = '/rankings/global';
      else if (tab === 'health') endpoint = '/rankings/health';
      else endpoint = '/rankings/region?regionName=서울';

      const res = await api.get(endpoint);
      setData(res);
    } catch (e: any) {
      console.error('[useRankings] Error:', e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    fetchRankings();
  }, [fetchRankings]);

  return { data, loading, error, refetch: fetchRankings };
}
