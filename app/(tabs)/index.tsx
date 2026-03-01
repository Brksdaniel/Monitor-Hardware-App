import { useEffect, useState } from 'react';
import { Dimensions, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { supabase } from '../../supabase';

export default function HomeScreen() {
  const [dados, setDados] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState('tensoes');
  const [historico, setHistorico] = useState<{[key: string]: number[]}>({});

  async function buscarDados() {
    const { data } = await supabase
      .from('hardware_data')
      .select('*')
      .order('criado_em', { ascending: false })
      .limit(100);
    if (data) {
  const tempsImportantes = ['GPU Hot Spot', 'GPU Core', 'Core (Tctl/Tdie)'];
  const novoHistorico = { ...historico };
  
  data.filter((d: any) => d.grupo === 'Temperatures' && tempsImportantes.includes(d.nome))
    .forEach((d: any) => {
      if (!novoHistorico[d.nome]) novoHistorico[d.nome] = [];
      novoHistorico[d.nome].push(parseFloat(d.valor));
      if (novoHistorico[d.nome].length > 20) novoHistorico[d.nome].shift();
    });
  
  setHistorico(novoHistorico);
  setDados(data);
  }
}

  async function onRefresh() {
    setRefreshing(true);
    await buscarDados();
    setRefreshing(false);
  }

  useEffect(() => {
    buscarDados();
    const interval = setInterval(buscarDados, 3000);
    return () => clearInterval(interval);
  }, []);

  const tensoes = dados.filter(d => d.grupo === 'Voltages');
  const temps = dados.filter(d => d.grupo === 'Temperatures');
  const fans = dados.filter(d => d.grupo === 'Fans');

  function getCorValor(valor: string, tipo: string) {
    const val = parseFloat(valor);
    if (tipo === 'Temperatures') {
      if (val > 80) return '#cc0000';
      if (val > 60) return '#cc6600';
      return '#006600';
    }
    return '#006600';
  }

  function getBarWidth(valor: string, tipo: string) {
    const val = parseFloat(valor);
    if (tipo === 'Voltages') return Math.min(val / 3 * 100, 100);
    if (tipo === 'Temperatures') return Math.min(val, 100);
    if (tipo === 'Fans') return Math.min(val / 3000 * 100, 100);
    return 50;
  }

  function getBarColor(valor: string, tipo: string) {
    const val = parseFloat(valor);
    if (tipo === 'Temperatures') {
      if (val > 80) return '#cc0000';
      if (val > 60) return '#ee9900';
    }
    return '#00b800';
  }

  function renderCard(item: any, index: number) {
    const barWidth = getBarWidth(item.valor, item.grupo);
    const barColor = getBarColor(item.valor, item.grupo);
    const valorColor = getCorValor(item.valor, item.grupo);

    return (
      <View key={index} style={styles.dataRow}>
        <View style={styles.rowInfo}>
          <Text style={styles.rowLabel}>[{item.componente}] {item.nome}</Text>
          <View style={styles.barContainer}>
            <View style={[styles.barFill, { width: `${barWidth}%`, backgroundColor: barColor }]} />
          </View>
        </View>
        <Text style={[styles.rowValue, { color: valorColor }]}>{item.valor}</Text>
      </View>
    );
  }

  function renderFan(item: any, index: number) {
    const rpm = parseFloat(item.valor);
    return (
      <View key={index} style={styles.fanRow}>
        <Text style={styles.fanIcon}>{rpm === 0 ? '🔴' : rpm < 1000 ? '🟡' : '🟢'}</Text>
        <View style={styles.fanInfo}>
          <Text style={styles.fanName}>{item.nome}</Text>
          <Text style={styles.fanRpm}>{item.valor}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerIcon}>💻</Text>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Monitor de Hardware XP</Text>
          <Text style={styles.headerSub}>AMD Ryzen 7 2700 • RTX 2060</Text>
        </View>
        <View style={styles.led} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {[
          { key: 'tensoes', label: '⚡ Tensões' },
          { key: 'temps', label: '🌡️ Temp.' },
          { key: 'fans', label: '💨 Fans' },
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, abaAtiva === tab.key && styles.tabAtiva]}
            onPress={() => setAbaAtiva(tab.key)}
          >
            <Text style={[styles.tabText, abaAtiva === tab.key && styles.tabTextAtiva]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {abaAtiva === 'tensoes' && (
          <View style={styles.groupbox}>
            <View style={styles.groupHeader}>
              <Text style={styles.groupHeaderText}>⚡ Tensões</Text>
            </View>
            {tensoes.map((item, i) => renderCard(item, i))}
          </View>
        )}

        {abaAtiva === 'temps' && (
  <>
    {Object.keys(historico).length > 0 && (
      <View style={styles.groupbox}>
        <View style={styles.groupHeader}>
          <Text style={styles.groupHeaderText}>📊 Histórico de Temperaturas</Text>
        </View>
        <LineChart
          data={{
            labels: [],
            datasets: Object.keys(historico).map((nome, i) => ({
              data: historico[nome].length > 0 ? historico[nome] : [0],
              color: () => ['#00ff00', '#00ccff', '#ffcc00'][i % 3],
              strokeWidth: 2,
            })),
            legend: Object.keys(historico),
          }}
          width={Dimensions.get('window').width - 32}
          height={180}
          chartConfig={{
            backgroundColor: '#000',
            backgroundGradientFrom: '#000',
            backgroundGradientTo: '#111',
            decimalPlaces: 1,
            color: () => '#ffffff',
            labelColor: () => '#aaaaaa',
            propsForDots: { r: '2' },
          }}
          bezier
          style={{ borderRadius: 0 }}
          withDots={false}
          withInnerLines={true}
          withOuterLines={false}
        />
      </View>
    )}
    <View style={styles.groupbox}>
      <View style={styles.groupHeader}>
        <Text style={styles.groupHeaderText}>🌡️ Temperaturas</Text>
      </View>
      {temps.map((item, i) => renderCard(item, i))}
    </View>
  </>
)}
    

        {abaAtiva === 'fans' && (
          <View style={styles.groupbox}>
            <View style={styles.groupHeader}>
              <Text style={styles.groupHeaderText}>💨 Ventoinhas</Text>
            </View>
            {fans.map((item, i) => renderFan(item, i))}
          </View>
        )}
        <View style={{ height: 20 }} />
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#d4d0c8' },

  header: {
    backgroundColor: '#0044cc',
    padding: 12,
    paddingTop: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIcon: { fontSize: 22 },
  headerInfo: { flex: 1 },
  headerTitle: { color: 'white', fontSize: 14, fontWeight: 'bold' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 10 },
  led: {
    width: 10, height: 10,
    borderRadius: 5,
    backgroundColor: '#00ff44',
  },

  tabs: {
    backgroundColor: '#ece9d8',
    borderBottomWidth: 2,
    borderBottomColor: '#aca899',
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    padding: 8,
    alignItems: 'center',
  },
  tabAtiva: {
    borderBottomWidth: 2,
    borderBottomColor: '#316ac5',
    backgroundColor: 'white',
  },
  tabText: { fontSize: 11, color: '#444' },
  tabTextAtiva: { color: '#316ac5', fontWeight: 'bold' },

  content: { flex: 1, padding: 8 },

  groupbox: {
    backgroundColor: 'white',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  groupHeader: {
    backgroundColor: '#f0ede4',
    borderBottomWidth: 1,
    borderBottomColor: '#aca899',
    padding: 8,
  },
  groupHeaderText: { fontSize: 12, fontWeight: 'bold', color: '#003399' },

  dataRow: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0ede4',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowInfo: { flex: 1 },
  rowLabel: { fontSize: 10, color: '#888' },
  barContainer: {
    height: 6,
    backgroundColor: '#e0ddd4',
    borderRadius: 1,
    marginTop: 3,
    overflow: 'hidden',
  },
  barFill: { height: '100%' },
  rowValue: { fontSize: 13, fontWeight: 'bold', minWidth: 60, textAlign: 'right' },

  fanRow: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0ede4',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  fanIcon: { fontSize: 20 },
  fanInfo: { flex: 1 },
  fanName: { fontSize: 11, color: '#666' },
  fanRpm: { fontSize: 14, fontWeight: 'bold', color: '#003399' },
});