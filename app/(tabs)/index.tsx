import { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { supabase } from '../../supabase';

export default function HomeScreen() {
  const [dados, setDados] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  async function buscarDados() {
    const { data } = await supabase
      .from('hardware_data')
      .select('*')
      .order('criado_em', { ascending: false })
      .limit(100);
    if (data) setDados(data);
  }

  useEffect(() => {
    buscarDados();
    const interval = setInterval(buscarDados, 3000);
    return () => clearInterval(interval);
  }, []);

  const tensoes = dados.filter(d => d.grupo === 'Voltages');
  const temps = dados.filter(d => d.grupo === 'Temperatures');
  const fans = dados.filter(d => d.grupo === 'Fans');

  return (
    <ScrollView style={styles.container} refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={buscarDados} />
    }>
      <Text style={styles.titulo}>💻 Monitor de Hardware</Text>

      <Text style={styles.secao}>⚡ Tensões</Text>
      {tensoes.map((d, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.label}>[{d.componente}] {d.nome}</Text>
          <Text style={styles.valor}>{d.valor}</Text>
        </View>
      ))}

      <Text style={styles.secao}>🌡️ Temperaturas</Text>
      {temps.map((d, i) => {
        const val = parseFloat(d.valor);
        const cor = val > 80 ? '#ff4444' : val > 60 ? '#ff9900' : '#00cc44';
        return (
          <View key={i} style={styles.card}>
            <Text style={styles.label}>{d.nome}</Text>
            <Text style={[styles.valor, { color: cor }]}>{d.valor}</Text>
          </View>
        );
      })}

      <Text style={styles.secao}>💨 Fans</Text>
      {fans.map((d, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.label}>{d.nome}</Text>
          <Text style={styles.valor}>{d.valor}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e', padding: 16 },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#00ccff', marginBottom: 16, marginTop: 40, textAlign: 'center' },
  secao: { fontSize: 16, fontWeight: 'bold', color: '#ffffff', marginTop: 16, marginBottom: 8 },
  card: { backgroundColor: '#16213e', borderRadius: 8, padding: 12, marginBottom: 6, flexDirection: 'row', justifyContent: 'space-between' },
  label: { color: '#aaaaaa', fontSize: 12, flex: 1 },
  valor: { color: '#00cc44', fontWeight: 'bold', fontSize: 14 },
});