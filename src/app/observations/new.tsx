import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { Notice, Screen, styles, Topbar } from '@/components/ui';
import { theme } from '@/constants/theme';
import { saveReport } from '@/database/database';
import { demoPoints } from '@/mocks/points';
import type { ObservationCondition } from '@/types/domain';
import { conditionLabels, formatDate } from '@/utils/observations';

const conditions: ObservationCondition[] = ['agua_na_rua', 'agua_na_calcada', 'sem_acumulo', 'outro'];

type SavedReport = {
  pointId: string;
  condition: ObservationCondition;
  observedAt: string;
};

export default function NewObservationScreen() {
  const params = useLocalSearchParams<{ pointId?: string }>();
  const router = useRouter();
  const [pointId, setPointId] = useState(params.pointId ?? '');
  const [condition, setCondition] = useState<ObservationCondition | ''>('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedReport, setSavedReport] = useState<SavedReport | null>(null);

  function startAnotherReport() {
    setPointId('');
    setCondition('');
    setDescription('');
    setError('');
    setSavedReport(null);
  }

  async function submit() {
    if (saving) return;
    if (!pointId || !condition) {
      setError('Escolha um ponto e a condição observada.');
      return;
    }

    const report: SavedReport = {
      pointId,
      condition,
      observedAt: new Date().toISOString(),
    };

    setSaving(true);
    setError('');
    try {
      await saveReport({
        id: `local-${Date.now()}`,
        ...report,
        description: description.trim() || undefined,
        source: 'Relato local de demonstração',
        isDemo: true,
      });

      // Limpa o formulário depois da confirmação do SQLite e troca para o recibo.
      setPointId('');
      setCondition('');
      setDescription('');
      setSavedReport(report);
    } catch {
      setError('Não foi possível salvar o relato. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  const savedPoint = savedReport ? demoPoints.find((item) => item.id === savedReport.pointId) : undefined;

  return (
    <Screen>
      <Topbar />
      {savedReport ? (
        <View style={{ gap: 18 }}>
          <View
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
            style={[
              styles.card,
              { backgroundColor: theme.colors.successBg, borderColor: 'transparent', padding: 22 },
            ]}>
            <View style={styles.row}>
              <MaterialCommunityIcons name="check-circle" size={28} color={theme.colors.success} />
              <Text style={[styles.sectionTitle, { color: theme.colors.success, flex: 1 }]}>
                Observação salva!
              </Text>
            </View>
            <Text style={styles.body}>
              Seu relato foi gravado neste aparelho e já pode ser consultado nos detalhes do ponto.
            </Text>
            <View style={styles.divider} />
            <Text style={styles.fieldLabel}>{savedPoint?.name ?? 'Ponto acompanhado'}</Text>
            <Text style={styles.body}>{conditionLabels[savedReport.condition]}</Text>
            <Text style={styles.small}>Registrado em {formatDate(savedReport.observedAt)}</Text>
          </View>

          <Pressable
            onPress={() =>
              router.replace({ pathname: '/points/[id]', params: { id: savedReport.pointId } })
            }
            style={styles.button}
            accessibilityRole="button">
            <MaterialCommunityIcons name="text-box-check-outline" size={20} color="white" />
            <Text style={styles.buttonText}>Ver observação salva</Text>
          </Pressable>

          <Pressable
            onPress={startAnotherReport}
            style={styles.secondaryButton}
            accessibilityRole="button">
            <MaterialCommunityIcons name="plus" size={20} color={theme.colors.brand} />
            <Text style={styles.secondaryText}>Registrar outra observação</Text>
          </Pressable>
        </View>
      ) : (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={{ gap: 18 }}>
            <View>
              <Text style={styles.title}>Registrar observação</Text>
              <Text style={styles.subtitle}>
                Compartilhe o que está vendo neste ponto. O relato ficará salvo apenas neste aparelho.
              </Text>
            </View>
            {error ? <Notice title="Confira os dados" message={error} type="error" /> : null}

            <View style={{ gap: 9 }}>
              <Text style={styles.fieldLabel}>Ponto acompanhado *</Text>
              {demoPoints.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => setPointId(item.id)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: pointId === item.id }}
                  style={[styles.option, pointId === item.id && styles.optionSelected]}>
                  <MaterialCommunityIcons
                    name={pointId === item.id ? 'radiobox-marked' : 'radiobox-blank'}
                    size={20}
                    color={theme.colors.brand}
                  />
                  <Text style={[styles.body, { color: theme.colors.ink, flex: 1 }]}>{item.name}</Text>
                </Pressable>
              ))}
            </View>

            <View style={{ gap: 9 }}>
              <Text style={styles.fieldLabel}>Condição observada *</Text>
              {conditions.map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setCondition(item)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: condition === item }}
                  style={[styles.option, condition === item && styles.optionSelected]}>
                  <MaterialCommunityIcons
                    name={condition === item ? 'radiobox-marked' : 'radiobox-blank'}
                    size={20}
                    color={theme.colors.brand}
                  />
                  <Text style={[styles.body, { color: theme.colors.ink }]}>{conditionLabels[item]}</Text>
                </Pressable>
              ))}
            </View>

            <View style={{ gap: 8 }}>
              <Text style={styles.fieldLabel}>Descrição (opcional)</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                multiline
                maxLength={240}
                placeholder="Acrescente um detalhe útil, sem incluir dados pessoais."
                placeholderTextColor={theme.colors.mutedSoft}
                style={[styles.input, { minHeight: 100 }]}
                accessibilityLabel="Descrição opcional"
              />
              <Text style={styles.small}>{description.length}/240</Text>
            </View>

            <Pressable
              onPress={() => void submit()}
              disabled={saving}
              style={[styles.button, saving && { opacity: 0.7 }]}
              accessibilityRole="button"
              accessibilityState={{ busy: saving, disabled: saving }}>
              <MaterialCommunityIcons
                name={saving ? 'progress-clock' : 'content-save-outline'}
                size={19}
                color="white"
              />
              <Text style={styles.buttonText}>{saving ? 'Salvando…' : 'Salvar observação'}</Text>
            </Pressable>
            <Text style={styles.small}>
              Não informe nome, telefone, endereço residencial ou outros dados pessoais.
            </Text>
          </View>
        </KeyboardAvoidingView>
      )}
    </Screen>
  );
}
