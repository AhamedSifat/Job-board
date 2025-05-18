import { requireUser } from '@/app/utils/requireUser';
import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({
    image: {
      maxFileSize: '2MB',
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      const sesstion = await requireUser();

      if (!sesstion.id) throw new UploadThingError('Unauthorized');

      return { userId: sesstion.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('file url', file.ufsUrl);

      return { uploadedBy: metadata.userId };
    }),

  resumeUploader: f({
    'application/pdf': {
      maxFileSize: '4MB',
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      const sesstion = await requireUser();

      if (!sesstion.id) throw new UploadThingError('Unauthorized');

      return { userId: sesstion.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('file url', file.ufsUrl);

      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
