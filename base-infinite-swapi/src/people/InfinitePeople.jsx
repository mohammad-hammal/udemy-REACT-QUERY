import { useInfiniteQuery } from '@tanstack/react-query';
import InfiniteScroll from 'react-infinite-scroller';
import { Person } from './Person';

const initialUrl = 'https://swapi.dev/api/people/';
const fetchUrl = async (url) => {
  const response = await fetch(url);
  return response.json();
};

export function InfinitePeople() {
  const { data, isLoading, isError, isFetching, fetchNextPage, hasNextPage } =
    useInfiniteQuery(
      ['sw-people'],
      ({ pageParam = initialUrl }) => fetchUrl(pageParam),
      {
        getNextPageParam: (lastPage) => lastPage.next || undefined,
      }
    );

  if (isError) return <h1>Something wrong happened</h1>;

  if (isLoading) return <h1>Loading ....</h1>;

  // TODO: get data for InfiniteScroll via React Query
  return (
    <>
      <InfiniteScroll loadMore={fetchNextPage} hasMore={hasNextPage}>
        {data.pages.map((pageData) => {
          return pageData.results.map((result) => (
            <Person
              key={result.name}
              name={result.name}
              hairColor={result.hair_color}
              eyeColor={result.eye_color}
            />
          ));
        })}
      </InfiniteScroll>
      {isFetching && <div className="loading">Loading....</div>}
    </>
  );
}
