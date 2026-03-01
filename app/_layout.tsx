import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, Text, View } from 'react-native';

const { width } = Dimensions.get('window');

function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [progresso, setProgresso] = useState(0);
  const [texto, setTexto] = useState('Iniciando...');
  const barWidth = useState(new Animated.Value(0))[0];
  const opacity = useState(new Animated.Value(0))[0];

  const textos = [
    'Iniciando Monitor de Hardware XP...',
    'Carregando drivers de sensores...',
    'Conectando ao Supabase...',
    'Lendo tensões do sistema...',
    'Carregando temperaturas...',
    'Pronto!',
  ];

  useEffect(() => {
    // Fade in
    Animated.timing(opacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Progresso
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setProgresso(step);
      setTexto(textos[Math.min(step - 1, textos.length - 1)]);

      Animated.timing(barWidth, {
        toValue: step / 6,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();

      if (step >= 6) {
        clearInterval(interval);
        setTimeout(() => {
          Animated.timing(opacity, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }).start(() => onFinish());
        }, 500);
      }
    }, 600);

    return () => clearInterval(interval);
  }, []);

  return (
    <Animated.View style={[styles.splash, { opacity }]}>
      {/* Fundo azul XP */}
      <View style={styles.splashBg}>

        {/* Logo */}
        <Text style={styles.splashIcon}>💻</Text>
        <Text style={styles.splashTitulo}>Monitor de Hardware</Text>
        <Text style={styles.splashSubtitulo}>XP Edition</Text>

        {/* Barra de progresso estilo XP */}
        <View style={styles.barWrapper}>
          <View style={styles.barOuter}>
            {[...Array(20)].map((_, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.barBlock,
                  {
                    opacity: barWidth.interpolate({
                      inputRange: [i / 20, (i + 1) / 20],
                      outputRange: [0.2, 1],
                      extrapolate: 'clamp',
                    }),
                  },
                ]}
              />
            ))}
          </View>
        </View>

        <Text style={styles.splashTexto}>{texto}</Text>

        {/* Copyright XP style */}
        <Text style={styles.splashCopy}>© 2026 Brksdaniel. Todos os direitos reservados.</Text>
      </View>
    </Animated.View>
  );
}

export default function RootLayout() {
  const [splashDone, setSplashDone] = useState(false);

  if (!splashDone) {
    return <SplashScreen onFinish={() => setSplashDone(true)} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
  },
  splashBg: {
    flex: 1,
    backgroundColor: '#003399',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  splashIcon: {
    fontSize: 80,
    marginBottom: 8,
  },
  splashTitulo: {
    color: 'white',
    fontSize: 26,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  splashSubtitulo: {
    color: '#aaccff',
    fontSize: 16,
    marginBottom: 40,
  },
  barWrapper: {
    width: width * 0.6,
  },
  barOuter: {
    flexDirection: 'row',
    height: 24,
    backgroundColor: '#001a66',
    borderWidth: 2,
    borderColor: '#aaaaaa',
    borderRadius: 2,
    overflow: 'hidden',
    gap: 2,
    padding: 2,
  },
  barBlock: {
    flex: 1,
    backgroundColor: '#3399ff',
    borderRadius: 1,
  },
  splashTexto: {
    color: '#aaccff',
    fontSize: 12,
    marginTop: 12,
  },
  splashCopy: {
    color: '#6688aa',
    fontSize: 10,
    position: 'absolute',
    bottom: 40,
  },
});