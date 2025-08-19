var mTask: { findFirst: jest.Mock };
jest.mock('@prisma/client', () => {
  mTask = { findFirst: jest.fn() };
  return { PrismaClient: jest.fn(() => ({ task: mTask })) };
});

import { getComputedWaterInfo } from './plants';

describe('getComputedWaterInfo', () => {
  beforeEach(() => {
    mTask.findFirst.mockReset();
  });

  it('returns next due and last done from task', async () => {
    mTask.findFirst.mockResolvedValue({
      dueDate: new Date('2024-05-10T00:00:00Z'),
      lastDoneAt: new Date('2024-05-01T00:00:00Z'),
    });
    const res = await getComputedWaterInfo({ id: 'p1' } as any);
    expect(res).toEqual({
      lastDoneAt: '2024-05-01T00:00:00.000Z',
      nextDue: '2024-05-10T00:00:00.000Z',
    });
    expect(mTask.findFirst).toHaveBeenCalledWith({
      where: { plantId: 'p1', type: 'water' },
      orderBy: { dueDate: 'asc' },
    });
  });

  it('falls back to plant lastWateredAt when no task', async () => {
    mTask.findFirst.mockResolvedValue(null);
    const plant = { id: 'p1', lastWateredAt: new Date('2024-04-01T00:00:00Z') } as any;
    const res = await getComputedWaterInfo(plant);
    expect(res).toEqual({
      lastDoneAt: '2024-04-01T00:00:00.000Z',
      nextDue: null,
    });
  });
});
