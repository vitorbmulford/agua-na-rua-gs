import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, usePathname, useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';
import type { MonitoredPoint, ObservationFreshness } from '@/types/domain';
import { conditionLabels, formatDate, freshnessLabel } from '@/utils/observations';

export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.canvas },
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 116, gap: 20, width: '100%', maxWidth: 640, alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', columnGap: 10, rowGap: 8 },
  headerBrand: { flexShrink: 1, minWidth: 0 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', rowGap: 10, columnGap: 12 },
  brand: { color: theme.colors.brandDeep, fontSize: 20, fontWeight: '800', letterSpacing: -0.4 },
  headerSub: { color: theme.colors.muted, fontSize: 12, marginTop: 3 },
  title: { color: theme.colors.ink, fontSize: 30, lineHeight: 36, fontWeight: '800', letterSpacing: -0.7 },
  subtitle: { color: theme.colors.muted, fontSize: 15, lineHeight: 22, marginTop: 7 },
  card: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.md, borderColor: theme.colors.line, borderWidth: 1, padding: 18, gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  grow: { flex: 1 },
  eyebrow: { color: theme.colors.muted, fontSize: 12, fontWeight: '700', letterSpacing: 0.7, textTransform: 'uppercase' },
  pointName: { color: theme.colors.ink, fontSize: 18, lineHeight: 24, fontWeight: '700' },
  body: { color: theme.colors.muted, fontSize: 14, lineHeight: 21 },
  small: { color: theme.colors.mutedSoft, fontSize: 12, lineHeight: 18 },
  button: { minHeight: 50, paddingHorizontal: 18, borderRadius: theme.radius.sm, backgroundColor: theme.colors.brand, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  buttonText: { color: 'white', fontSize: 15, fontWeight: '700' },
  secondaryButton: { minHeight: 48, borderRadius: theme.radius.sm, borderWidth: 1, borderColor: theme.colors.line, backgroundColor: theme.colors.surface, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  secondaryText: { color: theme.colors.brand, fontSize: 14, fontWeight: '700', flexShrink: 1, textAlign: 'center' },
  badge: { alignSelf: 'flex-start', maxWidth: '100%', borderRadius: theme.radius.pill, paddingHorizontal: 11, paddingVertical: 7, flexDirection: 'row', gap: 6, alignItems: 'center' },
  warning: { backgroundColor: theme.colors.warningBg }, success: { backgroundColor: theme.colors.successBg }, missing: { backgroundColor: '#EAF0F4' }, demo: { backgroundColor: theme.colors.water },
  badgeText: { fontSize: 12, fontWeight: '700' },
  sectionTitle: { color: theme.colors.ink, fontSize: 19, fontWeight: '700', flexShrink: 1, minWidth: 0 },
  divider: { height: 1, backgroundColor: theme.colors.line },
  fieldLabel: { color: theme.colors.ink, fontSize: 14, fontWeight: '700' },
  input: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.line, borderRadius: theme.radius.sm, paddingHorizontal: 14, paddingVertical: 13, minHeight: 50, color: theme.colors.ink, fontSize: 15, textAlignVertical: 'top' },
  option: { padding: 13, borderRadius: theme.radius.sm, borderWidth: 1, borderColor: theme.colors.line, backgroundColor: theme.colors.surface, flexDirection: 'row', alignItems: 'center', gap: 10 },
  optionSelected: { borderColor: theme.colors.brand, backgroundColor: theme.colors.water },
  nav: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: theme.colors.surface, borderTopWidth: 1, borderTopColor: theme.colors.line, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 24 },
  navItem: { flex: 1, alignItems: 'center', gap: 3, minHeight: 48 },
  navLabel: { fontSize: 11, color: theme.colors.muted, fontWeight: '600' },
  navActive: { color: theme.colors.brand },
});

export function Screen({ children, tabs = true }: { children: ReactNode; tabs?: boolean }) {
  return <SafeAreaView style={styles.root} edges={['top']}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>{children}</ScrollView>{tabs && <BottomNav />}</SafeAreaView>;
}

export function Topbar() {
  return <View style={styles.header}><View style={styles.headerBrand}><Text style={styles.brand}>Água na Rua</Text><Text style={styles.headerSub}>Informação local para se orientar</Text></View><View style={[styles.badge, styles.demo]}><MaterialCommunityIcons name="flask-outline" size={15} color={theme.colors.brand} /><Text style={[styles.badgeText, { color: theme.colors.brand }]}>Demonstração</Text></View></View>;
}

const navItems = [
  { href: '/', label: 'Início', icon: 'map-marker-radius-outline' },
  { href: '/favorites', label: 'Favoritos', icon: 'heart-outline' },
  { href: '/observations/new', label: 'Relatar', icon: 'plus-circle-outline' },
] as const;
function BottomNav() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const router = useRouter();
  return <View style={[styles.nav, { paddingBottom: Math.max(insets.bottom, 12) }]}>{navItems.map((item) => { const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href.split('/')[1] === 'favorites' ? '/favorites' : '/observations'); return <Pressable key={item.href} accessibilityRole="tab" accessibilityState={{ selected: active }} onPress={() => router.push(item.href)} style={styles.navItem}><MaterialCommunityIcons name={item.icon} size={22} color={active ? theme.colors.brand : theme.colors.muted} /><Text style={[styles.navLabel, active && styles.navActive]}>{item.label}</Text></Pressable>; })}</View>;
}

export function StatusBadge({ freshness }: { freshness: ObservationFreshness }) {
  const style = freshness === 'recent' ? styles.success : freshness === 'old' ? styles.warning : styles.missing;
  const color = freshness === 'recent' ? theme.colors.success : freshness === 'old' ? theme.colors.warning : theme.colors.muted;
  return <View style={[styles.badge, style]}><MaterialCommunityIcons name={freshness === 'recent' ? 'clock-check-outline' : freshness === 'old' ? 'clock-alert-outline' : 'information-outline'} size={15} color={color} /><Text style={[styles.badgeText, { color }]}>{freshnessLabel[freshness]}</Text></View>;
}

export function PointCard({ point }: { point: MonitoredPoint & { observation?: import('@/types/domain').Observation; freshness: ObservationFreshness } }) {
  return <Link href={{ pathname: '/points/[id]', params: { id: point.id } }} asChild><Pressable accessibilityRole="button" style={styles.card}><View style={styles.row}><View style={styles.grow}><Text style={styles.pointName}>{point.name}</Text><Text style={styles.small}>{point.locationDescription} · {point.neighborhood}</Text></View><MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.muted} /></View><View style={styles.divider} />{point.observation ? <><StatusBadge freshness={point.freshness} /><Text style={styles.body}>{conditionLabels[point.observation.condition]}</Text><Text style={styles.small}>{formatDate(point.observation.observedAt)} · {point.observation.source}</Text></> : <><StatusBadge freshness="missing" /><Text style={styles.body}>Não há observações disponíveis para este ponto.</Text></>}<Text style={styles.small}>Ponto fictício · dado de demonstração</Text></Pressable></Link>;
}

export function Notice({ title, message, type = 'info' }: { title: string; message: string; type?: 'info' | 'error' }) {
  return <View style={[styles.card, { backgroundColor: type === 'error' ? theme.colors.dangerBg : theme.colors.water, borderColor: 'transparent' }]}><Text style={[styles.pointName, { fontSize: 16 }]}>{title}</Text><Text style={styles.body}>{message}</Text></View>;
}

export function LoadingState() { return <View style={styles.card}><ActivityIndicator color={theme.colors.brand} /><Text style={[styles.body, { textAlign: 'center' }]}>Carregando pontos acompanhados…</Text></View>; }
