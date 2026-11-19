import type { MonitoredPoint, Observation } from '@/types/domain';

// Locais e observações são fictícios; os nomes não representam endereços validados.
export const demoPoints: MonitoredPoint[] = [
  { id: 'perI-01', name: 'Ponto A · acesso à avenida', locationDescription: 'Trecho ilustrativo próximo a uma via de circulação', neighborhood: 'Jardim Peri', city: 'São Paulo' },
  { id: 'perI-02', name: 'Ponto B · passagem baixa', locationDescription: 'Passagem ilustrativa em área de declive', neighborhood: 'Jardim Peri', city: 'São Paulo' },
  { id: 'perI-03', name: 'Ponto C · entorno residencial', locationDescription: 'Trecho ilustrativo entre ruas residenciais', neighborhood: 'Jardim Peri', city: 'São Paulo' },
];

const now = Date.now();
export const demoObservations: Observation[] = [
  { id: 'demo-1', pointId: 'perI-01', condition: 'agua_na_calcada', description: 'Exemplo de água acumulada junto à calçada.', observedAt: new Date(now - 25 * 60 * 1000).toISOString(), source: 'Demonstração', isDemo: true },
  { id: 'demo-2', pointId: 'perI-02', condition: 'agua_na_rua', description: 'Relato fictício para demonstrar uma informação antiga.', observedAt: new Date(now - 4 * 24 * 60 * 60 * 1000).toISOString(), source: 'Demonstração', isDemo: true },
];
