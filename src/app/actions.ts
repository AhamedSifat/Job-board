'use server';
import { prisma } from '@/lib/prisma';
import { requireUser } from './utils/requireUser';
import { z } from 'zod';
import { companySchema, jobSeekerSchema } from './utils/zodSchemas';
import { redirect } from 'next/navigation';
import { UTApi } from 'uploadthing/server';
import arcjet, { detectBot, shield } from './utils/arcjet';
import { request } from '@arcjet/next';

const aj = arcjet
  .withRule(
    shield({
      mode: 'LIVE',
    })
  )
  .withRule(
    detectBot({
      mode: 'LIVE',
      allow: [
        'CATEGORY:SEARCH_ENGINE', // Google, Bing, etc
        // Uncomment to allow these other common bot categories
        // See the full list at https://arcjet.com/bot-list
        //"CATEGORY:MONITOR", // Uptime monitoring services
        //"CATEGORY:PREVIEW", // Link previews e.g. Slack, Discord
      ],
    })
  );

export const createCompany = async (data: z.infer<typeof companySchema>) => {
  const session = await requireUser();

  const req = await request();

  const decision = await aj.protect(req);

  if (decision.isDenied()) {
    throw new Error('Forbidden');
  }

  const validateData = companySchema.parse(data);

  await prisma.user.update({
    where: {
      id: session.id,
    },
    data: {
      onboardingCompleted: true,
      userType: 'COMPANY',
      Company: {
        create: {
          ...validateData,
        },
      },
    },
  });

  return redirect('/');
};

const utapi = new UTApi();

export async function deleteFile(key: string) {
  // perform the delete
  const raw = await utapi.deleteFiles(key);

  // raw might be a class instance or include methods; strip it down
  // to only the JSON data you care about. For example:
  return {
    success: true,
    deleted: Array.isArray(raw)
      ? raw.map((r) => ({
          fileKey: r.key,
          status: r.success, // or whatever fields are on it
        }))
      : undefined,
  };
}
export async function createJobSeeker(data: z.infer<typeof jobSeekerSchema>) {
  const user = await requireUser();

  const validatedData = jobSeekerSchema.parse(data);
  const req = await request();

  const decision = await aj.protect(req);

  if (decision.isDenied()) {
    throw new Error('Forbidden');
  }
  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      onboardingCompleted: true,
      userType: 'JOB_SEEKER',
      JobSeeker: {
        create: {
          ...validatedData,
        },
      },
    },
  });

  return redirect('/');
}
