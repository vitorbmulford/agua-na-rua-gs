import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Link, useFocusEffect } from 'expo-router';
import { LoadingState, Notice, PointCard, Screen, styles, Topbar } from '@/components/ui';
import { theme } from '@/constants/theme';
import { fetchPoints } from '@/services/points';
import type { PointWithObservation } from '@/types/domain';

export default function HomeScreen() {
  const [points, setPoints] = useState<PointWithObservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setPoints(await fetchPoints()); } catch (e) { setError(e instanceof Error ? e.message : 'Ocorreu um erro ao carregar os pontos.'); }
    finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  return <Screen><Topbar /><View><Text style={styles.title}>Consulte o caminho com informação.</Text><Text style={styles.subtitle}>Acompanhe observações sobre trechos sujeitos a acúmulo de água no Jardim Peri.</Text></View>
    <Link href="/observations" asChild><Pressable style={styles.secondaryButton} accessibilityRole="button"><MaterialCommunityIcons name="history" size={20} color={theme.colors.brand} /><Text style={styles.secondaryText}>Ver todas as observações e relatos</Text><MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.brand} /></Pressable></Link>
    <View style={[styles.card, { backgroundColor: theme.colors.brandDeep, borderColor: theme.colors.brandDeep }]}><View style={styles.row}><MaterialCommunityIcons name="information-outline" size={21} color="white" /><Text style={[styles.pointName, { color: 'white', fontSize: 16, flex: 1 }]}>Este protótipo usa dados fictícios</Text></View><Text style={[styles.body, { color: '#E0F2F8' }]}>Não indicamos se uma rua está segura. A falta de informação não significa ausência de alagamento. Consulte orientações oficiais.</Text></View>
    <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Pontos acompanhados</Text><Pressable onPress={() => void load()} accessibilityRole="button" accessibilityLabel="Atualizar pontos" style={styles.secondaryButton}><MaterialCommunityIcons name="refresh" size={18} color={theme.colors.brand} /><Text style={styles.secondaryText}>Atualizar</Text></Pressable></View>
    {loading ? <LoadingState /> : error ? <View style={styles.card}><Notice title="Não foi possível carregar" message={error} type="error" /><Pressable onPress={() => void load()} style={styles.button}><Text style={styles.buttonText}>Tentar novamente</Text></Pressable></View> : points.length === 0 ? <Notice title="Nenhum ponto disponível" message="No momento não há pontos para mostrar. Tente novamente mais tarde." /> : points.map((point) => <PointCard key={point.id} point={point} />)}
    <Text style={styles.small}>Os locais deste protótipo são ilustrativos e aguardam validação comunitária.</Text>
  </Screen>;
}
