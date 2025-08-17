import Link from 'next/link'; export default function Home(){return <main className='min-h-[100dvh] grid place-items-center p-8'><div className='text-center space-y-4'><h1 className='text-2xl font-semibold'>Plant MVP (Mock Data)</h1><p>Open the app shell:</p><Link href='/app' className='underline'>Go to App</Link></div></main>;}
import { use } from "react";
