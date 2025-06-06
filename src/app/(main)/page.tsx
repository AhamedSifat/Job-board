import { JobFilters } from '@/components/general/JobFilters';
import { JobListings } from '@/components/general/JobListings';
import JobListingsLoading from '@/components/skeleton/JobListingsLoading';
import { Suspense } from 'react';

type SearchParams = {
  SearchParams: Promise<{
    page?: string;
    jobType?: string;
    location?: string;
  }>;
};

export default async function Home({ SearchParams }: SearchParams) {
  const params = await SearchParams;
  const currentPage = Number(params.page) || 1;
  const jobTypes = params.jobType?.split(',') || [];
  const location = params.location || '';

  const filterKeys = `page=${currentPage}&jobType=${jobTypes.join(',')}&location=${location}`;

  return (
    <div className='grid grid-cols-3 gap-8'>
      <JobFilters />
      <div className='col-span-2 flex flex-col gap-6'>
        <Suspense fallback={<JobListingsLoading key={filterKeys} />}>
          <JobListings
            currentPage={currentPage}
            jobTypes={jobTypes}
            location={location}
          />
        </Suspense>
      </div>
    </div>
  );
}
