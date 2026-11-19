import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';
import { Notice, PointCard, Screen, styles, Topbar } from '@/components/ui';
import { listFavorites } from '@/database/database';
import { fetchPoints } from '@/services/points';
import type { PointWithObservation } from '@/types/domain';

export default function FavoritesScreen() {
  const [points, setPoints] = useState<PointWithObservation[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    try { setError(false); const favorites = await listFavorites(); const data = await fetchPoints(); setPoints(favorites.map((fav) => data.find((point) => point.id === fav.pointId)).filter((point): point is PointWithObservation => Boolean(point))); }
    catch { setError(true); }
    finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));
  return <Screen><Topbar /><View><Text style={styles.title}>Seus favoritos</Text><Text style={styles.subtitle}>Acesse rapidamente os pontos que você acompanha.</Text></View>{loading ? <View style={[styles.card, styles.row]}><ActivityIndicator color="#075985" /><Text style={styles.body}>Carregando favoritos…</Text></View> : error ? <Notice title="Não foi possível abrir os favoritos" message="Tente fechar e abrir esta tela novamente." type="error" /> : points.length ? points.map((point) => <PointCard key={point.id} point={point} />) : <Notice title="Ainda sem favoritos" message="Abra um ponto acompanhado e toque em “Salvar nos favoritos” para encontrá-lo aqui." />}</Screen>;
}
