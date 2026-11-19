import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Notice, Screen, StatusBadge, styles, Topbar } from '@/components/ui';
import { theme } from '@/constants/theme';
import { isFavorite, toggleFavorite } from '@/database/database';
import { demoPoints } from '@/mocks/points';
import type { Observation } from '@/types/domain';
import { fetchObservationsForPoint } from '@/services/points';
import { conditionLabels, formatDate, getFreshness } from '@/utils/observations';

export default function PointDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const point = demoPoints.find((item) => item.id === id);
  const [favorite, setFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setError('');
      const [isPointFavorite, pointObservations] = await Promise.all([
        isFavorite(id),
        fetchObservationsForPoint(id),
      ]);
      setFavorite(isPointFavorite);
      setObservations(pointObservations);
    } catch {
      setError('Não foi possível carregar os dados salvos neste aparelho.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(useCallback(() => { void refresh(); }, [refresh]));

  if (!point) {
    return (
      <Screen>
        <Topbar />
        <Notice title="Ponto não encontrado" message="Este ponto não está disponível na demonstração." />
        <Pressable onPress={() => router.back()} style={styles.secondaryButton} accessibilityRole="button">
          <Text style={styles.secondaryText}>Voltar</Text>
        </Pressable>
      </Screen>
    );
  }

  const latestObservation = observations[0];
  const freshness = getFreshness(latestObservation);

  return (
    <Screen>
      <Topbar />
      <Pressable onPress={() => router.back()} style={styles.secondaryButton} accessibilityRole="button">
        <MaterialCommunityIcons name="arrow-left" size={19} color={theme.colors.brand} />
        <Text style={styles.secondaryText}>Voltar aos pontos</Text>
      </Pressable>

      <View>
        <Text style={styles.eyebrow}>Ponto de demonstração</Text>
        <Text style={[styles.title, { marginTop: 6 }]}>{point.name}</Text>
        <Text style={styles.subtitle}>
          {point.locationDescription} · {point.neighborhood}, {point.city}
        </Text>
      </View>

      {error ? <Notice title="Dados indisponíveis" message={error} type="error" /> : null}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Observação mais recente</Text>
        {loading ? (
          <View style={[styles.row, { paddingVertical: 12 }]}>
            <ActivityIndicator color={theme.colors.brand} />
            <Text style={styles.body}>Carregando informações…</Text>
          </View>
        ) : latestObservation ? (
          <>
            <StatusBadge freshness={freshness} />
            <Text style={styles.pointName}>{conditionLabels[latestObservation.condition]}</Text>
            {latestObservation.description ? <Text style={styles.body}>{latestObservation.description}</Text> : null}
            <Text style={styles.small}>Observado em {formatDate(latestObservation.observedAt)}</Text>
            <Text style={styles.small}>Origem: {latestObservation.source}{latestObservation.isDemo ? ' · demonstração' : ''}</Text>
            {freshness === 'old' ? (
              <Notice title="Informação antiga" message="Esta observação pode não refletir a condição atual do trecho." />
            ) : null}
          </>
        ) : (
          <>
            <StatusBadge freshness="missing" />
            <Text style={styles.body}>Não há observações disponíveis para este ponto.</Text>
            <Text style={styles.small}>A ausência de registros não indica que a passagem esteja livre.</Text>
          </>
        )}
      </View>

      <View style={{ gap: 12 }}>
        <View>
          <Text style={styles.sectionTitle}>Todas as observações</Text>
          <Text style={styles.small}>
            {loading ? 'Carregando histórico…' : `${observations.length} ${observations.length === 1 ? 'observação' : 'observações'} neste ponto`}
          </Text>
        </View>
        {!loading && observations.length === 0 ? (
          <Notice title="Histórico vazio" message="Quando houver observações ou relatos, eles aparecerão aqui." />
        ) : null}
        {!loading ? observations.map((item) => (
          <ObservationCard key={item.id} observation={item} />
        )) : null}
      </View>

      <Pressable
        onPress={async () => { await toggleFavorite(point.id); await refresh(); }}
        style={styles.secondaryButton}
        accessibilityRole="button">
        <MaterialCommunityIcons name={favorite ? 'heart' : 'heart-outline'} size={20} color={theme.colors.brand} />
        <Text style={styles.secondaryText}>{favorite ? 'Remover dos favoritos' : 'Salvar nos favoritos'}</Text>
      </Pressable>

      <Link href={{ pathname: '/observations/new', params: { pointId: point.id } }} asChild>
        <Pressable style={styles.button} accessibilityRole="button">
          <MaterialCommunityIcons name="plus" size={20} color="white" />
          <Text style={styles.buttonText}>Registrar ocorrência</Text>
        </Pressable>
      </Link>

      <Notice title="Orientação" message="Este aplicativo é demonstrativo. Não substitui orientações oficiais nem recomenda atravessar áreas alagadas." />
    </Screen>
  );
}

function ObservationCard({ observation }: { observation: Observation }) {
  const freshness = getFreshness(observation);
  const isReported = observation.source.toLowerCase().includes('relato');
  return (
    <View style={styles.card}>
      <View style={[styles.row, { justifyContent: 'space-between', flexWrap: 'wrap' }]}>
        <StatusBadge freshness={freshness} />
        <View style={[styles.badge, styles.demo]}>
          <MaterialCommunityIcons
            name={isReported ? 'account-voice' : 'flask-outline'}
            size={14}
            color={theme.colors.brand}
          />
          <Text style={[styles.badgeText, { color: theme.colors.brand }]}>
            {isReported ? 'Relato registrado' : 'Demonstração'}
          </Text>
        </View>
      </View>
      <Text style={styles.pointName}>{conditionLabels[observation.condition]}</Text>
      {observation.description ? <Text style={styles.body}>{observation.description}</Text> : null}
      <Text style={styles.small}>{formatDate(observation.observedAt)}</Text>
      <Text style={styles.small}>Origem: {observation.source}</Text>
    </View>
  );
}
