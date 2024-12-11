import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Button, Alert } from 'react-native';
import MapView, { Heatmap } from 'react-native-maps';
import * as Location from 'expo-location';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AddPointScreen from './AddPointScreen';

const Stack = createStackNavigator();

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Os meses começam em 0, então adicionamos 1
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function HomeScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [heatmapData, setHeatmapData] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchHeatmapData = async () => {
    const today = new Date();
    const todayFormatted = formatDate(today);

    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthFormatted = formatDate(lastMonth);

    try {
      const response = await fetch(
        `http://177.44.248.13:8080/WaterManager?op=SELECT&PRODUCTID=000001&DATEINI=${lastMonthFormatted}&DATAFIN=${todayFormatted}&LIMIT=500&FORMAT=JSON`
      );
      const data = await response.json();

      // Processa e filtra os pontos
      const rawHeatmapPoints = data
        .map((item) => {
          const lat = parseFloat(item.latitude);
          const lon = parseFloat(item.longitude);
          const value = parseFloat(item.value);

          if (
            !isNaN(lat) &&
            !isNaN(lon) &&
            lat !== 0 &&
            lon !== 0 &&
            lat >= -90 &&
            lat <= 90 &&
            lon >= -180 &&
            lon <= 180 &&
            !isNaN(value) &&
            value > 0 // Remove pontos com peso zero
          ) {
            return {
              latitude: lat,
              longitude: lon,
              weight: value,
            };
          }
          return null;
        })
        .filter((point) => point !== null);

      // Combina pontos duplicados somando os pesos
      const combinedHeatmapPoints = Object.values(
        rawHeatmapPoints.reduce((acc, point) => {
          const key = `${point.latitude}-${point.longitude}`;
          if (!acc[key]) {
            acc[key] = { ...point };
          } else {
            acc[key].weight += point.weight; // Soma os pesos de pontos duplicados
          }
          return acc;
        }, {})
      );

      if (combinedHeatmapPoints.length > 0) {
        console.log('Pontos normalizados:', combinedHeatmapPoints);
        setHeatmapData(combinedHeatmapPoints); // Atualiza o estado com os pontos normalizados
      } else {
        console.log('Nenhum ponto de calor válido encontrado.');
        Alert.alert('Nenhum ponto de calor válido encontrado.');
      }
    } catch (error) {
      console.error('Erro ao chamar a API:', error);
      setErrorMsg('Erro ao chamar a API');
    }
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permissão de acesso à localização foi negada');
        return;
      }

      let userLocation = await Location.getCurrentPositionAsync({});
      setLocation(userLocation.coords);

      await fetchHeatmapData();
    })();
  }, []);

  const refreshHeatmap = async () => {
    setHeatmapData([]);
    await fetchHeatmapData();
  };

  const calculateRegion = (points) => {
    if (points.length === 0) return null;
  
    const latitudes = points.map((p) => p.latitude);
    const longitudes = points.map((p) => p.longitude);
  
    const minLatitude = Math.min(...latitudes);
    const maxLatitude = Math.max(...latitudes);
    const minLongitude = Math.min(...longitudes);
    const maxLongitude = Math.max(...longitudes);
  
    const latitudeDelta = Math.abs(maxLatitude - minLatitude) + 0.1;
    const longitudeDelta = Math.abs(maxLongitude - minLongitude) + 0.1;
  
    return {
      latitude: (minLatitude + maxLatitude) / 2,
      longitude: (minLongitude + maxLongitude) / 2,
      latitudeDelta,
      longitudeDelta,
    };
  };
  
  const region = calculateRegion(heatmapData);

  return (
    <View style={styles.container}>
      {errorMsg ? (
        <Text>{errorMsg}</Text>
      ) : (
        <MapView
          key={heatmapData.length}
          style={styles.map}
          initialRegion={region || {
            latitude: location ? location.latitude : -29.4685,
            longitude: location ? location.longitude : -51.9653,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {heatmapData.length > 0 && <Heatmap points={heatmapData} opacity={0.7} />}
        </MapView>
      )}
      <View style={styles.buttonContainer}>
        <Button
          title="Adicionar Novo Ponto"
          onPress={() => navigation.navigate('AddPoint', { refreshHeatmap })}
        />
        <Button
          title="Atualizar Mapa"
          onPress={refreshHeatmap} // Atualiza o Heatmap
          color="green"
        />
      </View>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="WaterManager">
        <Stack.Screen name="WaterManager" component={HomeScreen} />
        <Stack.Screen name="AddPoint" component={AddPointScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 1,
  },
});
