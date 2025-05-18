'use client';

import Image from 'next/image';
import Logo from '../../../../public/logo.png';
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';
import UserTypeSelection from './UserTypeForm';
import { CompanyForm } from './CompanyForm';
type UserType = 'company' | 'jobSeeker' | null;

export const OnboardingForm = () => {
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<UserType>(null);

  const handleUserTypeSelection = (type: UserType) => {
    setUserType(type);
    setStep(2);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <UserTypeSelection onSelect={handleUserTypeSelection} />;
        break;

      case 2:
        return userType === 'company' ? (
          <CompanyForm />
        ) : (
          <p>User is a job seeker</p>
        );
        break;

      default:
        return null;
    }
  };

  return (
    <>
      <div className='flex items-center gap-3 mb-10'>
        <Image src={Logo} alt='JobMarshal Logo' width={50} height={50} />
        <span className='text-4xl font-bold'>
          Job<span className='text-primary'>Board</span>
        </span>
      </div>
      <Card className='w-full max-w-lg'>
        <CardContent className='p-6'>{renderStep()}</CardContent>
      </Card>
    </>
  );
};
