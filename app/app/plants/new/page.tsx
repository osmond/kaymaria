import type { Metadata } from 'next';
import NewPlantClient from './NewPlantClient';

export const metadata: Metadata = {
  title: 'Add Plant',
};

export default function NewPlantPage() {
  return <NewPlantClient />;
}

