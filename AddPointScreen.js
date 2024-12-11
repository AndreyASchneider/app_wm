// AddPointScreen.js

import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';

function AddPointScreen({ navigation }) {
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [value, setValue] = useState('');

  const handleSavePoint = async () => {
    if (!latitude || !longitude || !value) {
      Alert.alert('Por favor, preencha todos os campos');
      return;
    }

    // Valida as entradas para latitude, longitude e valor
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    const val = parseFloat(value);

    if (isNaN(lat) || isNaN(lon) || isNaN(val)) {
      Alert.alert('Por favor, insira valores válidos para latitude, longitude e valor.');
      return;
    }

    try {
      // Construa a URL para a API com os parâmetros fornecidos
      const url = `http://177.44.248.13:8080/WaterManager?op=INSERT&VENDORID=505885&PRODUCTID=000001&LATITUDE=${lat}&LONGITUDE=${lon}&VALUE=${val}`;
      
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
    } catch (error) {
      console.error('Erro ao enviar ponto para a API:', error);
      Alert.alert('Erro ao salvar o ponto. Tente novamente.');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Latitude"
        value={latitude}
        onChangeText={setLatitude}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Longitude"
        value={longitude}
        onChangeText={setLongitude}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Valor"
        value={value}
        onChangeText={setValue}
        keyboardType="numeric"
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
