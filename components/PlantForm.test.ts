import { plantValuesToSubmit, type PlantFormValues } from './PlantForm';

describe('plantValuesToSubmit', () => {
  const base: PlantFormValues = {
    name: 'Test Plant',
    roomId: 'room-1',
    species: 'Ficus',
    pot: '10cm',
    potHeight: '10cm',
    potMaterial: 'Ceramic',
    light: 'Bright',
    indoor: 'Indoor',
    drainage: 'ok',
    soil: 'Potting mix',
    humidity: 'Medium',
    waterEvery: '7',
    waterAmount: '500',
    fertEvery: '30',
    fertFormula: '10-10-10',
    lastWatered: '',
    lastFertilized: '',
  };

  it('sets createTasks flag', () => {
    const result = plantValuesToSubmit(base);
    expect(result.createTasks).toBe(true);
  });

  it('builds a default plan', () => {
    const result = plantValuesToSubmit(base);
    expect(result.plan).toEqual([
      { type: 'water', intervalDays: 7, amountMl: 500 },
      { type: 'fertilize', intervalDays: 30, formula: '10-10-10' },
    ]);
  });

  it('parses valid coordinates', () => {
    const result = plantValuesToSubmit({ ...base, lat: '45', lon: '-120' });
    expect(result.lat).toBe(45);
    expect(result.lon).toBe(-120);
  });

  it('ignores invalid coordinates', () => {
    const result = plantValuesToSubmit({ ...base, lat: '95', lon: '200' });
    expect(result.lat).toBeUndefined();
    expect(result.lon).toBeUndefined();
  });
});
