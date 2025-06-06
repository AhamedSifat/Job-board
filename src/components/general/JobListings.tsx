import { prisma } from '@/lib/prisma';
import { EmptyState } from './EmptyState';
import { JobCard } from './JobCard';
import { MainPagination } from './Pagination';

const getData = async (page: number = 1, pageSize: number = 2) => {
  const skip = (page - 1) * pageSize;

  const [data, totalCount] = await Promise.all([
    prisma.jobPost.findMany({
      where: {
        status: 'ACTIVE',
      },
      take: pageSize,
      skip: skip,

      select: {
        jobTitle: true,
        id: true,
        salaryFrom: true,
        salaryTo: true,
        employmentType: true,
        location: true,
        createdAt: true,

        Company: {
          select: {
            name: true,
            logo: true,
            location: true,
            about: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),

    prisma.jobPost.count({
      where: {
        status: 'ACTIVE',
      },
    }),
  ]);

  return {
    jobs: data,
    totalPages: Math.ceil(totalCount / pageSize),
  };
};

const JobListings = async ({ currentPage }: { currentPage: number }) => {
  const { jobs, totalPages } = await getData();

  return (
    <>
      {jobs.length > 0 ? (
        <div className='flex flex-col gap-6'>
          {jobs.map((job, index) => (
            <JobCard
              job={{
                ...job,
                company: job.Company ?? {
                  logo: null,
                  name: '',
                  about: '',
                  location: '',
                },
              }}
              key={index}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title='No jobs found'
          description='Try searching for a different job title or location.'
          buttonText='Clear all filters'
          href='/'
        />
      )}

      <div className='flex justify-center mt-6'>
        <MainPagination totalPages={totalPages} currentPage={currentPage} />
      </div>
    </>
  );
};

export { JobListings };
