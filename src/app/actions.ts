'use server';
import { prisma } from '@/lib/prisma';
import { requireUser } from './utils/requireUser';
import { z } from 'zod';
import { companySchema, jobSchema, jobSeekerSchema } from './utils/zodSchemas';
import { redirect } from 'next/navigation';
import { UTApi } from 'uploadthing/server';
import arcjet, { detectBot, shield } from './utils/arcjet';
import { request } from '@arcjet/next';
import { stripe } from './utils/stripe';
import { jobListingDurationPricing } from './utils/pricingTiers';

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

export async function createJob(data: z.infer<typeof jobSchema>) {
  const user = await requireUser();

  const req = await request();

  const decision = await aj.protect(req);

  if (decision.isDenied()) {
    throw new Error('Forbidden');
  }

  const validatedData = jobSchema.parse(data);

  const company = await prisma.company.findUnique({
    where: {
      userId: user.id,
    },
    select: {
      id: true,
      user: {
        select: {
          stripeCustomerId: true,
        },
      },
    },
  });

  if (!company?.id) {
    return redirect('/');
  }

  let stripeCustomerId = company.user.stripeCustomerId;
  if (!stripeCustomerId) {
    const stripeCustomer = await stripe.customers.create({
      email: user.email as string,
      name: user.name as string,
    });

    stripeCustomerId = stripeCustomer.id;

    //udpate user with stripe customer id
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        stripeCustomerId: stripeCustomerId,
      },
    });
  }

  const jobPost = await prisma.jobPost.create({
    data: {
      jobDescription: validatedData.jobDescription,
      jobTitle: validatedData.jobTitle,
      employmentType: validatedData.employmentType,
      location: validatedData.location,
      salaryFrom: validatedData.salaryFrom,
      salaryTo: validatedData.salaryTo,
      listingDuration: validatedData.listingDuration,
      benefits: validatedData.benefits,
      companyId: company.id,
    },
  });

  const priceTier = jobListingDurationPricing.find(
    (tier) => tier.days === validatedData.listingDuration
  );

  if (!priceTier) {
    throw new Error('Invalid listing duration');
  }

  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Job Posting - ${priceTier.days} days`,
            description: priceTier.description,
            images: [
              'https://sihaa05d3g.ufs.sh/f/7HPNobXHgM2tqju0NPDvrZVtf4k6FTL2JE7hadBAuOI8oGjH',
            ],
          },

          unit_amount: priceTier.price * 100, // Convert to cents
        },
        quantity: 1,
      },
    ],
    metadata: {
      jobPost: jobPost.id,
      listingDuration: priceTier.days,
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/paymen/cancel`,
  });

  return redirect(session.url as string);
}
