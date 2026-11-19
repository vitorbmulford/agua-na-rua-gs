import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Notice, Screen, StatusBadge, styles, Topbar } from '@/components/ui';
import { theme } from '@/constants/theme';
import type { ObservationWithPoint } from '@/services/points';
import { fetchAllObservations } from '@/services/points';
import { conditionLabels, formatDate, getFreshness } from '@/utils/observations';

export default function ObservationsScreen() {
  const [observations, setObservations] = useState<ObservationWithPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setObservations(await fetchAllObservations());
    } catch {
      setError('Não foi possível carregar as observações salvas neste aparelho.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  return (
    <Screen>
      <Topbar />
      <View>
        <Text style={styles.title}>Observações e relatos</Text>
        <Text style={styles.subtitle}>
          Veja todos os registros dos pontos, incluindo os relatos salvos neste aparelho.
        </Text>
      </View>

      <Notice
        title="Origem identificada em cada registro"
        message="Os itens marcados como relato foram registrados pelo formulário. Os demais são dados fictícios de demonstração."
      />

      {loading ? (
        <View style={[styles.card, styles.row]}>
          <ActivityIndicator color={theme.colors.brand} />
          <Text style={styles.body}>Carregando observações…</Text>
        </View>
      ) : error ? (
        <View style={styles.card}>
          <Notice title="Não foi possível carregar" message={error} type="error" />
          <Pressable onPress={() => void load()} style={styles.button} accessibilityRole="button">
            <Text style={styles.buttonText}>Tentar novamente</Text>
          </Pressable>
        </View>
      ) : observations.length === 0 ? (
        <Notice title="Nenhuma observação ainda" message="Os registros aparecerão aqui quando estiverem disponíveis." />
      ) : (
        <View style={{ gap: 12 }}>
          <Text style={styles.sectionTitle}>
            {observations.length} {observations.length === 1 ? 'registro' : 'registros'}
          </Text>
          {observations.map((observation) => {
            const isReported = observation.source.toLowerCase().includes('relato');
            return (
              <Link
                key={observation.id}
                href={{ pathname: '/points/[id]', params: { id: observation.pointId } }}
                asChild>
                <Pressable style={styles.card} accessibilityRole="button">
                  <View style={[styles.row, { justifyContent: 'space-between', flexWrap: 'wrap' }]}>
                    <StatusBadge freshness={getFreshness(observation)} />
                    <View style={[styles.badge, isReported ? styles.success : styles.demo]}>
                      <MaterialCommunityIcons
                        name={isReported ? 'account-voice' : 'flask-outline'}
                        size={14}
                        color={isReported ? theme.colors.success : theme.colors.brand}
                      />
                      <Text style={[styles.badgeText, { color: isReported ? theme.colors.success : theme.colors.brand }]}>
                        {isReported ? 'Relato registrado' : 'Demonstração'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.pointName}>{conditionLabels[observation.condition]}</Text>
                  <Text style={styles.body}>{observation.pointName}</Text>
                  {observation.description ? <Text style={styles.body}>{observation.description}</Text> : null}
                  <Text style={styles.small}>{formatDate(observation.observedAt)}</Text>
                  <Text style={styles.small}>Origem: {observation.source}</Text>
                </Pressable>
              </Link>
            );
          })}
        </View>
      )}
    </Screen>
  );
}
