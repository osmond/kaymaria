'use client';

import Link from 'next/link';
import { Button } from './ui/button';
import { Camera, Share2, Bell } from 'lucide-react';

export default function PlantCreated({ plantId }: { plantId: string }) {
  return (
    <div className="p-6 text-center space-y-6">
      <h1 className="text-xl font-display font-semibold">Plant Added!</h1>
      <div className="flex flex-col gap-3">
        <Button className="w-full">
          <Camera className="mr-2 h-4 w-4" /> Add a photo
        </Button>
        <Button className="w-full">
          <Share2 className="mr-2 h-4 w-4" /> Share with friends
        </Button>
        <Button className="w-full">
          <Bell className="mr-2 h-4 w-4" /> Set reminder
        </Button>
      </div>
      <Link href={`/app/plants/${plantId}`} className="text-primary underline block">
        View plant
      </Link>
    </div>
  );
}
