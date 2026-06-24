import { Text, View } from 'react-native';
import { registerRootComponent } from 'expo';

function App() {
  return (
    <View style={{ flex: 1, backgroundColor: '#121212', alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#FFB000', fontSize: 32, fontWeight: '900' }}>REPGRADE</Text>
    </View>
  );
}

export default registerRootComponent(App);
