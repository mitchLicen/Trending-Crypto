'use client';
import DarkMode from '@/components/DarkMode';
import CryptoList from '@/components/CryptoList';

const page = () => {
  return (
    <main className='flex align-middle items-center h-screen'>
      <CryptoList />

      <div className='absolute top-2 right-2'>
        <DarkMode />
      </div>
    </main>
  );
};
export default page;
