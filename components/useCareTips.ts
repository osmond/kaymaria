'use client';

import { useMemo } from 'react';
import { PlantFormValues } from './PlantForm';

export type CareTipMap = {
  potMaterial?: string;
  light?: string;
};

export function useCareTips(values: PlantFormValues | null): CareTipMap {
  return useMemo(() => {
    if (!values) return {};
    const tips: CareTipMap = {};

    switch (values.potMaterial) {
      case 'Terracotta':
        tips.potMaterial = 'Terracotta dries faster—water sooner.';
        break;
      case 'Plastic':
        tips.potMaterial = 'Plastic retains moisture—avoid overwatering.';
        break;
      case 'Ceramic':
        tips.potMaterial = 'Ceramic balances moisture.';
        break;
    }

    switch (values.light) {
      case 'Low':
        tips.light = 'Low light slows growth—water less often.';
        break;
      case 'Bright':
        tips.light = 'Bright light increases water needs.';
        break;
    }

    return tips;
  }, [values?.potMaterial, values?.light]);
}

export default useCareTips;
