'use server';
import { prisma } from '@/lib/prisma';
import { requireUser } from './utils/requireUser';
import { z } from 'zod';
import { companySchema } from './utils/zodSchemas';
import { redirect } from 'next/navigation';
import { UTApi } from 'uploadthing/server';

export const createCompany = async (data: z.infer<typeof companySchema>) => {
  const session = await requireUser();

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

export async function deleteLogoFile(key: string) {
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
