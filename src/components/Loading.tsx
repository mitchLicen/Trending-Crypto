import { Skeleton } from '@/components/ui/skeleton';

export default function loading() {
  return (
    <main className='rounded-lg'>
      {Array.from({ length: 7 }, (_, i) => i + 1).map((id) => (
        <div className='p-1 flex' key={id}>
          <Skeleton className='h-10 mr-2 w-11 rounded-full'></Skeleton>
          <Skeleton className='h-10 w-full rounded-lg'></Skeleton>
        </div>
      ))}
    </main>
  );
}
