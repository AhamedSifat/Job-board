import { Badge } from '@/components/ui/badge';

const JobIdPage = () => {
  return (
    <div className='grid lg:grid-cols-[1fr,400px] gap-8'>
      <div className='space-y-8'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>Job Details</h1>
            <div className='flex items-center gap-2 mt-2'>
              <p className='font-medium'>Sifat LLC</p>

              <Badge>Full-Time</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobIdPage;
