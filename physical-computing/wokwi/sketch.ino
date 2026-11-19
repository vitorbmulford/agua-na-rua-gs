#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// Demonstração acadêmica: altura estimada a partir da distância até a água.
// A calibração e os limites abaixo são apenas didáticos, não são de segurança.
constexpr uint8_t TRIG_PIN = 5;
constexpr uint8_t ECHO_PIN = 18;
constexpr uint8_t GREEN_LED = 26;
constexpr uint8_t YELLOW_LED = 27;
constexpr uint8_t RED_LED = 14;
constexpr uint8_t BUZZER_PIN = 25;
constexpr float SENSOR_HEIGHT_CM = 150.0f;
constexpr float ATTENTION_LEVEL_CM = 15.0f;
constexpr float HIGH_LEVEL_CM = 40.0f;

LiquidCrystal_I2C lcd(0x27, 16, 2);

enum WaterState { NORMAL, ATTENTION, HIGH };

float readDistanceCm() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(3);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  const unsigned long duration = pulseIn(ECHO_PIN, HIGH, 30000UL);
  if (duration == 0) return -1.0f;
  return duration * 0.0343f / 2.0f;
}

void setSignal(WaterState state, unsigned long now) {
  digitalWrite(GREEN_LED, state == NORMAL ? HIGH : LOW);
  digitalWrite(YELLOW_LED, state == ATTENTION ? HIGH : LOW);
  digitalWrite(RED_LED, state == HIGH ? HIGH : LOW);
  if (state == HIGH && (now / 350UL) % 2UL == 0UL) tone(BUZZER_PIN, 1500);
  else noTone(BUZZER_PIN);
}

void setup() {
  Serial.begin(115200);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(GREEN_LED, OUTPUT);
  pinMode(YELLOW_LED, OUTPUT);
  pinMode(RED_LED, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Agua na Rua");
  lcd.setCursor(0, 1);
  lcd.print("Demonstracao");
  delay(1200);
}

void loop() {
  const unsigned long now = millis();
  const float distance = readDistanceCm();

  if (distance < 0.0f || distance > SENSOR_HEIGHT_CM) {
    digitalWrite(GREEN_LED, LOW);
    digitalWrite(YELLOW_LED, LOW);
    digitalWrite(RED_LED, LOW);
    noTone(BUZZER_PIN);
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Sem leitura");
    lcd.setCursor(0, 1);
    lcd.print("Verifique sensor");
    Serial.println("Sem leitura valida do sensor");
    delay(700);
    return;
  }

  const float estimatedWaterHeight = SENSOR_HEIGHT_CM - distance;
  WaterState state = NORMAL;
  if (estimatedWaterHeight >= HIGH_LEVEL_CM) state = HIGH;
  else if (estimatedWaterHeight >= ATTENTION_LEVEL_CM) state = ATTENTION;

  setSignal(state, now);
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Nivel aprox. ");
  lcd.print((int)estimatedWaterHeight);
  lcd.print("cm");
  lcd.setCursor(0, 1);
  if (state == HIGH) lcd.print("NIVEL ALTO");
  else if (state == ATTENTION) lcd.print("ATENCAO");
  else lcd.print("NIVEL BAIXO");

  Serial.printf("Distancia: %.1f cm | Nivel estimado: %.1f cm | Estado: %s\n",
    distance, estimatedWaterHeight,
    state == HIGH ? "alto (demonstracao)" : state == ATTENTION ? "atencao (demonstracao)" : "baixo (demonstracao)");
  delay(700);
}
