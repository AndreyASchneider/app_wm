// App.js

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Button, Alert } from 'react-native';
import MapView, { Heatmap } from 'react-native-maps';
import * as Location from 'expo-location';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AddPointScreen from './AddPointScreen';

const Stack = createStackNavigator();

function HomeScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [heatmapData, setHeatmapData] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permissão de acesso à localização foi negada');
        return;
      }

      let userLocation = await Location.getCurrentPositionAsync({});
      setLocation(userLocation.coords);

      try {
        const response = await fetch('http://177.44.248.13:8080/WaterManager?op=SELECT&PRODUCTID=000001&LIMIT=100&FORMAT=JSON');
        const data = await response.json();

        const heatmapPoints = data.map(item => {
          const lat = parseFloat(item.latitude);
          const lon = parseFloat(item.longitude);

          // Verifica se a latitude e longitude são válidas (não 0) e dentro dos limites válidos
          if (
            !isNaN(lat) && !isNaN(lon) && lat !== 0 && lon !== 0 &&
            lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180
          ) {
            const value = parseFloat(item.value);

            if (!isNaN(value)) {
              return {
                latitude: lat,
                longitude: lon,
                weight: value,
              };
            }
          }
          return null;
        }).filter(point => point !== null);

        if (heatmapPoints.length > 0) {
          setHeatmapData(heatmapPoints);
        } else {
          setHeatmapData([]);
          Alert.alert('Nenhum ponto de calor válido encontrado.');
        }
      } catch (error) {
        setErrorMsg('Erro ao chamar a API');
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      {errorMsg ? (
        <Text>{errorMsg}</Text>
      ) : (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location ? location.latitude : 37.78825,
            longitude: location ? location.longitude : -122.4324,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {heatmapData.length > 0 && (
            <Heatmap points={heatmapData} opacity={0.7} />
          )}
        </MapView>
      )}
      <View style={styles.buttonContainer}>
        <Button
          title="Adicionar Novo Ponto"
          onPress={() => navigation.navigate('AddPoint')}
        />
      </View>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
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
