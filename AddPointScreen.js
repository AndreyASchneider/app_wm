import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

async function getCoordinates(address) {
  const apiKey = '0c9c76a244ab4b808d2a06225cb49085'; // Insira sua chave de API aqui
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    if (response.data.results.length > 0) {
      const location = response.data.results[0].geometry;
      console.log('Latitude:', location.lat, 'Longitude:', location.lng);
      return location;
    } else {
      console.error('Nenhum resultado encontrado para este endereço.');
    }
  } catch (error) {
    console.error('Erro ao buscar coordenadas:', error);
  }
}

function AddPointScreen({ navigation }) {
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const value = 1000; // Valor padrão

  const handleSavePoint = async () => {
    if (!street || !number || !neighborhood || !city || !state || !country) {
      Alert.alert('Por favor, preencha todos os campos do endereço');
      return;
    }

    const address = `${street}, ${number}, ${neighborhood}, ${city}, ${state}, ${country}`;

    try {
      const location = await getCoordinates(address);
      if (location) {
        const lat = location.lat;
        const lon = location.lng;

        // Construa a URL para a API com os parâmetros fornecidos
        const url = `http://177.44.248.13:8080/WaterManager?op=INSERT&VENDORID=505885&PRODUCTID=000001&LATITUDE=${lat}&LONGITUDE=${lon}&VALUE=${value}`;

        // Envie a requisição para a API
        const response = await fetch(url);

        // Verifica se a resposta foi bem-sucedida
        if (response.ok) {
          Alert.alert('Ponto salvo com sucesso!');
          // Voltar para a tela principal após salvar o ponto
          navigation.goBack();
        } else {
          Alert.alert('Erro ao salvar o ponto. Tente novamente.');
        }
      } else {
        Alert.alert('Erro ao obter coordenadas. Verifique o endereço informado.');
      }
    } catch (error) {
      console.error('Erro ao enviar ponto para a API:', error);
      Alert.alert('Erro ao salvar o ponto. Tente novamente.');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Rua"
        value={street}
        onChangeText={setStreet}
      />
      <TextInput
        style={styles.input}
        placeholder="Número"
        value={number}
        onChangeText={setNumber}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Bairro"
        value={neighborhood}
        onChangeText={setNeighborhood}
      />
      <TextInput
        style={styles.input}
        placeholder="Cidade"
        value={city}
        onChangeText={setCity}
      />
      <TextInput
        style={styles.input}
        placeholder="Estado"
        value={state}
        onChangeText={setState}
      />
      <TextInput
        style={styles.input}
        placeholder="País"
        value={country}
        onChangeText={setCountry}
      />
      <Button title="Salvar Ponto" onPress={handleSavePoint} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
  },
});

export default AddPointScreen;
