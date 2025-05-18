'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { companySchema } from '@/app/utils/zodSchemas';
import { z } from 'zod';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { countryList } from '@/app/utils/countryList';
import { Textarea } from '@/components/ui/textarea';
import { UploadDropzone } from '@/app/utils/uploadthing';
import { createCompany, deleteFile } from '@/app/actions';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { XIcon } from 'lucide-react';
import Image from 'next/image';

const CompanyForm = () => {
  const form = useForm<z.infer<typeof companySchema>>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: '',
      about: '',
      location: '',
      logo: '',
      website: '',
      xAccount: '',
    },
  });

  const [pending, setPending] = useState(false);
  const [key, setkey] = useState<string>('');

  const onSubmit = async (data: z.infer<typeof companySchema>) => {
    try {
      setPending(true);
      await createCompany(data);
    } catch (error) {
      if (error instanceof Error && error.message !== 'NEXT_REDIRECT') {
        console.log('Something went wrong');
      }
    } finally {
      setPending(false);
    }
  };

  const handleDelete = async () => {
    if (!key) return;
    try {
      const res = await deleteFile(key);
      if (res.success) {
        setkey('');
      } else {
        console.error('Delete failed:', res);
      }
    } catch (err) {
      console.error('Error calling deleteFile:', err);
    }
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name</FormLabel>
                <FormControl>
                  <Input placeholder='Emter company Name' {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='location'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select Location' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>WordWide</SelectLabel>
                      <SelectItem value='WordWide'>
                        <span>🌍</span>
                        <span className='pl-2'>WorldWide / Remote</span>
                      </SelectItem>
                    </SelectGroup>

                    <SelectGroup>
                      <SelectLabel>Location</SelectLabel>
                      {countryList.map((country) => (
                        <SelectItem key={country.code} value={country.name}>
                          <span>{country.flagEmoji}</span>
                          <span className='pl-2'>{country.name}</span>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Two column layout for website and X account */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <FormField
            control={form.control}
            name='website'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <Input placeholder='https://your-company.com' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='xAccount'
            render={({ field }) => (
              <FormItem>
                <FormLabel>X (Twitter) Account</FormLabel>
                <FormControl>
                  <Input placeholder='@yourcompany' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Full width for about section */}
        <FormField
          control={form.control}
          name='about'
          render={({ field }) => (
            <FormItem>
              <FormLabel>About</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='Tell us about your company...'
                  className='resize-none'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='logo'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Logo</FormLabel>
              <FormControl>
                <div>
                  {field.value ? (
                    <div className='relative w-fit'>
                      <Image
                        src={field.value}
                        alt='Company Logo'
                        width={100}
                        height={100}
                        className='rounded-lg'
                      />
                      <Button
                        type='button'
                        variant='destructive'
                        size='icon'
                        className='absolute -top-2 -right-2 '
                        onClick={() => {
                          field.onChange('');

                          handleDelete();
                        }}
                      >
                        <XIcon className='h-4 w-4' />
                      </Button>
                    </div>
                  ) : (
                    <UploadDropzone
                      endpoint='imageUploader'
                      onClientUploadComplete={(res) => {
                        if (res && res[0]?.ufsUrl) {
                          setkey(res[0].key);
                          field.onChange(res[0].ufsUrl);
                        }
                      }}
                      onUploadError={(error: Error) => {
                        alert(`ERROR! ${error.message}`);
                      }}
                      className='ut-button:bg-primary ut-button:text-white ut-button:hover:bg-primary/90 ut-label:text-muted-foreground ut-allowed-content:text-muted-foreground border-primary ut-button:p-3'
                    />
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type='submit' className='w-full' disabled={pending}>
          {pending ? 'Submitting...' : 'Continue'}
        </Button>
      </form>
    </Form>
  );
};

export { CompanyForm };
