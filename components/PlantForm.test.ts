import { plantValuesToSubmit, type PlantFormValues } from './PlantForm';

describe('plantValuesToSubmit', () => {
  it('sets createTasks flag', () => {
    const values: PlantFormValues = {
      name: 'Test Plant',
      roomId: 'room-1',
      species: 'Ficus',
      pot: '10cm',
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
    const result = plantValuesToSubmit(values);
    expect(result.createTasks).toBe(true);
  });
});
