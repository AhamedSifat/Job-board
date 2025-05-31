import { stripe } from '@/app/utils/stripe';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const body = await req.text();

  const headersList = await headers();

  const signature = headersList.get('Stripe-Signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch {
    return new Response('Webhook error', { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === 'checkout.session.completed') {
    // Handle successful checkout session
    const customerId = session.customer as string;
    const jobId = session.metadata?.jobId;

    if (!jobId) {
      return new Response('Job ID not found in session metadata', {
        status: 400,
      });
    }
    // Find the company associated with the customer
    const company = await prisma.user.findUnique({
      where: {
        stripeCustomerId: customerId as string,
      },
      select: {
        Company: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!company) {
      return new Response('Company not found for the customer', {
        status: 404,
      });
    }
    // Update the job post status to ACTIVE

    await prisma.jobPost.update({
      where: {
        id: jobId,
        companyId: company?.Company?.id as string,
      },
      data: {
        status: 'ACTIVE',
      },
    });
  }

  return new Response(null, { status: 200 });
}
