import type { Observation, ObservationCondition, ObservationFreshness } from '@/types/domain';

export const conditionLabels: Record<ObservationCondition, string> = {
  agua_na_rua: 'Água acumulada na rua', agua_na_calcada: 'Água acumulada na calçada', sem_acumulo: 'Sem acúmulo observado', outro: 'Outra condição',
};

export function getFreshness(observation?: Observation): ObservationFreshness {
  if (!observation) return 'missing';
  return Date.now() - new Date(observation.observedAt).getTime() <= 24 * 60 * 60 * 1000 ? 'recent' : 'old';
}

export function formatDate(value?: string) {
  if (!value) return 'Sem horário disponível';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}

export const freshnessLabel = { recent: 'Observação recente', old: 'Observação antiga', missing: 'Sem observação' } as const;
