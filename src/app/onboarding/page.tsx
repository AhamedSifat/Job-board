import { OnboardingForm } from '@/components/forms/onboarding/OnboardingForm';

const OnboardingPage = async () => {
  return (
    <div className='min-h-screen w-screen py-10 flex flex-col items-center justify-center'>
      <OnboardingForm />
    </div>
  );
};

export default OnboardingPage;
