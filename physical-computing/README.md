# Circuito ESP32 — Physical Computing

Projeto independente para abrir no [Wokwi](https://wokwi.com/). O sensor ultrassônico HC-SR04 mede a distância até a superfície simulada. O programa estima uma altura de água com uma altura de referência didática de 150 cm. O LCD mostra distância convertida em nível aproximado; LEDs verde, amarelo e vermelho e o buzzer representam faixas de demonstração.

## Abrir e testar

1. Acesse [Wokwi ESP32](https://wokwi.com/projects/new/esp32).
2. Crie um projeto ESP32 e copie `sketch.ino` e `diagram.json` desta pasta. Adicione `LiquidCrystal I2C` à aba Library Manager (1.1.2). O arquivo `libraries.txt` registra essa dependência para importação local. Para execução no VS Code/Wokwi, o `platformio.ini` e `src/main.cpp` já estão prontos; faça build com PlatformIO antes de iniciar o Wokwi local.
3. Inicie a simulação e ajuste a distância no HC-SR04. Distância menor representa a superfície mais próxima do sensor e, portanto, maior nível estimado.
4. Observe LCD, LEDs, sinal sonoro e mensagens no Serial Monitor. Aumente a distância para reduzir o nível, diminua para mostrar atenção e nível alto.
5. Use **Share** no Wokwi para gerar o link público do projeto e o insira abaixo após publicar.

## Ligações

| Módulo | ESP32 |
|---|---|
| HC-SR04 TRIG / ECHO | GPIO 5 / GPIO 18 |
| LCD I2C SDA / SCL | GPIO 21 / GPIO 22 |
| LED verde / amarelo / vermelho | GPIO 26 / GPIO 27 / GPIO 14 (com resistores de 220 Ω) |
| Buzzer | GPIO 25 (positivo no pino 2 do buzzer) |
| Alimentação | VIN (5 V) e GND conforme o diagrama |

Os limiares são apenas didáticos: até 14 cm estimados (verde), de 15 a 39 cm (amarelo), e a partir de 40 cm (vermelho e buzzer). Não são níveis oficiais, não foram calibrados para instalação real e não orientam circulação. Sem eco válido, todas as saídas de alerta são desligadas e o LCD informa falha de leitura.

**Link público Wokwi:** pendente de publicação na conta da equipe.

## Relação com Água na Rua

O app organiza observações de pessoas em pontos acompanhados. Este circuito demonstra localmente como um sensor pode indicar mudança de nível em um ponto. Ele não se conecta ao app, não transmite leituras e não representa uma instalação real; os dois componentes funcionam separadamente, conforme a Ficha CitizenTech.
