import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { fetchFixtures } from '../store/slices/fixtureSlice';
import { FixtureFilter } from '../interfaces/Fixture';

interface UseGetFixturesOptions {
  initialPage?: number;
  initialPageSize?: number;
  initialFilter?: FixtureFilter;
  initialSort?: string;
  initialDirection?: 'asc' | 'desc';
}

export const useGetFixtures = ({
  initialPage = 1,
  initialPageSize = 10,
  initialFilter = {},
  initialSort = 'date',
  initialDirection = 'asc'
}: UseGetFixturesOptions = {}) => {
  const dispatch = useDispatch();
  const { fixtures, loading, error, totalCount } = useSelector((state: RootState) => state.fixtures);
  
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [filter, setFilter] = useState<FixtureFilter>(initialFilter);
  const [sort, setSort] = useState(initialSort);
  const [direction, setDirection] = useState<'asc' | 'desc'>(initialDirection);

  useEffect(() => {
    dispatch(fetchFixtures({
      page,
      pageSize,
      filter,
      sort,
      direction
    }));
  }, [dispatch, page, pageSize, filter, sort, direction]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page when changing page size
  };

  const handleFilterChange = (newFilter: FixtureFilter) => {
    setFilter(newFilter);
    setPage(1); // Reset to first page when changing filters
  };

  const handleSortChange = (newSort: string, newDirection: 'asc' | 'desc') => {
    setSort(newSort);
    setDirection(newDirection);
    setPage(1); // Reset to first page when changing sort
  };

  return {
    fixtures,
    loading,
    error,
    totalCount,
    page,
    pageSize,
    filter,
    sort,
    direction,
    handlePageChange,
    handlePageSizeChange,
    handleFilterChange,
    handleSortChange
  };
}; 