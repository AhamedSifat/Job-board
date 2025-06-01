import { prisma } from '@/lib/prisma';
import { inngest } from './client';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const handleJobExpiration = inngest.createFunction(
  { id: 'job-expiration' },
  { event: 'job/created' },
  async ({ event, step }) => {
    const { jobId, expirationDays } = event.data;
    // Wait for the specified duration
    await step.sleep('wait-for-expiration', `${expirationDays}d`);

    // Update job status to expired
    await step.run('update-job-status', async () => {
      await prisma.jobPost.update({
        where: { id: jobId },
        data: { status: 'EXPIRED' },
      });
    });
    return { jobId, message: 'Job marked as expired' };
  }
);

export const sendPeriodicJobListings = inngest.createFunction(
  {
    id: 'send-job-listings',
  },
  { event: 'jobseeker/created' },

  async ({ event, step }) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { userId, email } = event.data;

    const totalDays = 30; // Example: send listings every 30 days
    const intervalDays = 2;
    let currentDay = 0;
    while (currentDay < totalDays) {
      await step.sleep(`wait-interval`, `${intervalDays}d`);
      currentDay += intervalDays;

      const recentJobs = await step.run('fetch-recent-jobs', async () => {
        return await prisma.jobPost.findMany({
          where: {
            status: 'ACTIVE',
          },

          orderBy: {
            createdAt: 'desc',
          },

          take: 5, // Fetch the latest 5 jobs
          include: {
            Company: {
              select: {
                name: true,
              },
            },
          },
        });
      });

      // Here you would send the email with the recentJobs data
      if (recentJobs.length > 0) {
        await step.run('send-email', async () => {
          const jobListingsHtml = recentJobs
            .map(
              (job) => `
      <div style="border:1px solid #e0e0e0; padding:16px; border-radius:8px; margin-bottom:20px; background-color:#ffffff;">
        <h2 style="margin:0 0 8px 0; font-size:18px; color:#333;">${job.jobTitle}</h2>
        <p style="margin:4px 0; font-size:14px; color:#555;">
          <strong>Company:</strong> ${job.Company?.name || 'N/A'}
        </p>
        <p style="margin:4px 0; font-size:14px; color:#777;">
          <strong>Posted on:</strong> ${new Date(
            job.createdAt
          ).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
        <a href="https://your-job-site.com/jobs/${job.id}"
           style="display:inline-block; margin-top:10px; padding:10px 16px; background-color:#007bff; color:#ffffff; text-decoration:none; border-radius:4px; font-size:14px;">
          View Job
        </a>
      </div>
    `
            )
            .join('');

          const emailHtml = `
    <div style="font-family:Arial, sans-serif; background-color:#f4f4f4; padding:24px;">
      <div style="max-width:600px; margin:0 auto; background-color:#ffffff; padding:24px; border-radius:10px;">
        <h1 style="font-size:24px; color:#222; margin-bottom:20px;">🧑‍💻 New Job Listings Just for You!</h1>
        ${jobListingsHtml}
        <p style="font-size:12px; color:#999; text-align:center; margin-top:30px;">
          You're receiving this email because you signed up for job alerts.
        </p>
      </div>
    </div>
  `;

          await resend.emails.send({
            from: 'Acme <onboarding@resend.dev>',
            to: ['ahahmedsifat111@gmail.com'], //use email instead of hardcoded email
            subject: 'Latest Job Opportniues for You',
            html: emailHtml,
          });
        });
      }
    }

    return { userId, message: 'Completed 30 days job listing notifications' };
  }
);
