import { listReports } from '@/database/database';
import { demoObservations, demoPoints } from '@/mocks/points';
import { getFreshness } from '@/utils/observations';
import type { Observation, PointWithObservation } from '@/types/domain';

export type ObservationWithPoint = Observation & { pointName: string };

export async function fetchPoints(): Promise<PointWithObservation[]> {
  await new Promise((resolve) => setTimeout(resolve, 550));
  const demoState = process.env.EXPO_PUBLIC_DEMO_STATE;
  if (demoState === 'error') throw new Error('Não foi possível carregar os pontos agora.');
  if (demoState === 'empty') return [];
  const localReports = await listReports();
  return demoPoints.map((point) => {
    const observations = [
      ...demoObservations.filter((item) => item.pointId === point.id),
      ...localReports.filter((item) => item.pointId === point.id),
    ].sort((a, b) => new Date(b.observedAt).getTime() - new Date(a.observedAt).getTime());
    const observation: Observation | undefined = observations[0];
    return { ...point, observation, freshness: getFreshness(observation) };
  });
}

export async function fetchObservationsForPoint(pointId: string): Promise<Observation[]> {
  const localReports = await listReports(pointId);
  return [
    ...demoObservations.filter((item) => item.pointId === pointId),
    ...localReports,
  ].sort((a, b) => new Date(b.observedAt).getTime() - new Date(a.observedAt).getTime());
}

export async function fetchAllObservations(): Promise<ObservationWithPoint[]> {
  const localReports = await listReports();
  return [...demoObservations, ...localReports]
    .sort((a, b) => new Date(b.observedAt).getTime() - new Date(a.observedAt).getTime())
    .map((observation) => ({
      ...observation,
      pointName: demoPoints.find((point) => point.id === observation.pointId)?.name ?? 'Ponto acompanhado',
    }));
}
