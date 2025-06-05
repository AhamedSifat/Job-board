import { JsonToHtml } from '@/components/general/JsonToHtml';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { prisma } from '@/lib/prisma';
import { Heart } from 'lucide-react';
import { notFound } from 'next/navigation';
import { benefits } from '@/app/utils/listOfBenefits';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import {
  GeneralSubmitButton,
  SaveJobButton,
} from '@/components/general/SubmitButtons';
import arcjet, { detectBot, tokenBucket } from '@/app/utils/arcjet';
import { request } from '@arcjet/next';
import { auth } from '@/app/utils/auth';
import Link from 'next/link';
import { unsaveJobPost, saveJobPost } from '@/app/actions';

const aj = arcjet.withRule(
  detectBot({
    mode: 'LIVE',
    allow: [
      'CATEGORY:SEARCH_ENGINE',
      'CATEGORY:PREVIEW', // Google, Bing, etc
      // Uncomment to allow these other common bot categories
      // See the full list at https://arcjet.com/bot-list
      //"CATEGORY:MONITOR", // Uptime monitoring services
      //"CATEGORY:PREVIEW", // Link previews e.g. Slack, Discord
    ],
  })
);

const getClient = (session: boolean) => {
  if (session) {
    return aj.withRule(
      tokenBucket({
        mode: 'LIVE', // will block requests. Use "DRY_RUN" to log only
        refillRate: 30, // refill 10 tokens per interval
        interval: 60, // 60 second interval
        capacity: 100, // bucket maximum capacity of 100 tokens
      })
    );
  } else {
    return aj.withRule(
      tokenBucket({
        mode: 'LIVE', // will block requests. Use "DRY_RUN" to log only
        refillRate: 10, // refill 10 tokens per interval
        interval: 60, // 60 second interval
        capacity: 50, // bucket maximum capacity of 50 tokens
      })
    );
  }
};

const getJob = async (jobId: string, userId?: string) => {
  const [data, savedJob] = await Promise.all([
    await prisma.jobPost.findUnique({
      where: {
        status: 'ACTIVE',
        id: jobId,
      },
      select: {
        jobDescription: true,
        jobTitle: true,
        location: true,
        employmentType: true,
        benefits: true,
        createdAt: true,
        listingDuration: true,
        Company: {
          select: {
            logo: true,
            name: true,
            location: true,
            about: true,
          },
        },
      },
    }),

    userId
      ? prisma.savedJobPost.findUnique({
          where: {
            userId_jobId: {
              userId: userId,
              jobId: jobId,
            },
          },
          select: {
            id: true,
          },
        })
      : null,
  ]);

  if (!data) {
    return notFound();
  }

  return { data, savedJob };
};
type params = Promise<{ jobId: string }>;

const JobIdPage = async ({ params }: { params: params }) => {
  const { jobId } = await params;
  const req = await request();
  const session = await auth();

  const decision = await getClient(!!session).protect(req, { requested: 10 });

  if (decision.isDenied()) {
    throw new Error('forbidden');
  }
  const { data, savedJob } = await getJob(jobId, session?.user?.id);

  return (
    <div className='grid lg:grid-cols-3 gap-8'>
      <div className='space-y-8 col-span-2'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>Job Details</h1>
            <div className='flex items-center gap-2 mt-2'>
              <p className='font-medium'>{data.jobTitle}</p>
              <span className='hidden md:hidden text-muted-foreground'>*</span>
              <Badge className='rounded-full' variant='secondary'>
                {data.employmentType}
              </Badge>
              <span className='hidden md:hidden text-muted-foreground'>*</span>
              <Badge className='rounded-full'>{data.location}</Badge>
            </div>
          </div>

          {session?.user ? (
            <form
              action={
                savedJob
                  ? unsaveJobPost.bind(null, savedJob.id)
                  : saveJobPost.bind(null, jobId)
              }
            >
              <SaveJobButton savedJob={!!savedJob} />
            </form>
          ) : (
            <Button variant='outline' asChild>
              <Link href='/login'>
                <Heart className='size-4 mr-2' />
                Save Job
              </Link>
            </Button>
          )}
        </div>

        <section>
          <JsonToHtml json={JSON.parse(data.jobDescription)} />
        </section>
        <section>
          <h3 className='font-semibold mb-4'>
            Benefits{' '}
            <span className='text-sm text-muted-foreground font-normal'>
              (green is offered and red is not offered)
            </span>
          </h3>
          <div className='flex flex-wrap gap-3'>
            {benefits.map((benefit) => {
              const isOffered = data.benefits.includes(benefit.id);
              return (
                <Badge
                  key={benefit.id}
                  variant={isOffered ? 'default' : 'outline'}
                  className={`text-sm px-4 py-1.5 rounded-full ${
                    !isOffered && ' opacity-75 cursor-not-allowed'
                  }`}
                >
                  <span className='flex items-center gap-2'>
                    {benefit.icon}
                    {benefit.label}
                  </span>
                </Badge>
              );
            })}
          </div>
        </section>
      </div>

      {/* Sidebar */}
      <div className='space-y-6'>
        {/* Apply Now Card */}
        <Card className='p-6'>
          <div className='space-y-4'>
            <div>
              <div className='flex items-center justify-between'>
                <h3 className='font-semibold'>Apply now</h3>
              </div>
              <p className='text-sm text-muted-foreground mt-1'>
                Please let {data.Company?.name} know you found this job on
                JobMarshal. This helps us grow!
              </p>
            </div>
            <form>
              <input type='hidden' name='jobId' value={jobId} />
              <GeneralSubmitButton text='Apply now' />
            </form>
          </div>
        </Card>

        {/* Job Details Card */}
        <Card className='p-6'>
          <div className='space-y-4'>
            <h3 className='font-semibold'>About the job</h3>

            <div className='space-y-2'>
              <div className='flex justify-between'>
                <span className='text-sm text-muted-foreground'>
                  Apply before
                </span>
                <span className='text-sm'>
                  {new Date(
                    data.createdAt.getTime() +
                      data.listingDuration * 24 * 60 * 60 * 1000
                  ).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm text-muted-foreground'>Posted on</span>
                <span className='text-sm'>
                  {data.createdAt.toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm text-muted-foreground'>
                  Employment type
                </span>
                <span className='text-sm'>{data.employmentType}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm text-muted-foreground'>Location</span>
                <Badge variant='secondary'>{data.location}</Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Company Card */}
        <Card className='p-6'>
          <div className='space-y-4'>
            <div className='flex items-center gap-3'>
              <Image
                src={
                  data.Company?.logo ??
                  `https://avatar.vercel.sh/${data.Company?.name}`
                }
                alt={data.Company?.name || 'asdsd'}
                width={48}
                height={48}
                className='rounded-full size-12'
              />
              <div>
                <h3 className='font-semibold'>{data.Company?.name}</h3>
                <p className='text-sm text-muted-foreground line-clamp-3'>
                  {data.Company?.about}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default JobIdPage;
