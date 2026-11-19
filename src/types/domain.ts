export type ObservationCondition = 'agua_na_rua' | 'agua_na_calcada' | 'sem_acumulo' | 'outro';
export type ObservationFreshness = 'recent' | 'old' | 'missing';

export type MonitoredPoint = {
  id: string;
  name: string;
  locationDescription: string;
  neighborhood: string;
  city: string;
};

export type Observation = {
  id: string;
  pointId: string;
  condition: ObservationCondition;
  description?: string;
  observedAt: string;
  source: string;
  isDemo: boolean;
};

export type Favorite = { pointId: string; createdAt: string };
export type PointWithObservation = MonitoredPoint & { observation?: Observation; freshness: ObservationFreshness };
