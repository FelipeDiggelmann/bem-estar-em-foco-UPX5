import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, ActivityIndicator, ScrollView } from 'react-native';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from './src/firebaseConfig';

export default function App() {
  // Estados de Autenticação
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(true);

  // Estados do Check-in
  const [sono, setSono] = useState('');
  const [humor, setHumor] = useState('');
  const [alimentacao, setAlimentacao] = useState('');
  const [loading, setLoading] = useState(false);
  const [conselho, setConselho] = useState('');

  // Monitora se o usuário está logado ou não
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  // Funções de Autenticação
  const handleRegistro = async () => {
    if (!email || !password) {
      alert('Preencha e-mail e senha para criar a conta!');
      return;
    }
    try {
      console.log('Tentando criar conta no Firebase...');
      await createUserWithEmailAndPassword(auth, email, password);
      alert('Conta criada com sucesso! O Firebase já te logou automaticamente.');
    } catch (error: any) {
      console.error('Erro no Registro:', error.message);
      alert('Erro ao criar conta: ' + error.message);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Preencha e-mail e senha para entrar!');
      return;
    }
    try {
      console.log('Tentando fazer login...');
      await signInWithEmailAndPassword(auth, email, password);
      // Se der certo, o onAuthStateChanged detecta sozinho e muda a tela
    } catch (error: any) {
      console.error('Erro no Login:', error.message);
      alert('Login recusado. Verifique se o e-mail existe e a senha está correta.');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  // Função de Enviar Check-in
  const fazerCheckin = async () => {
    if (!sono || !humor || !alimentacao) {
      alert('Por favor, preencha todos os campos!');
      return;
    }
    setLoading(true);
    setConselho('');

    try {
      const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3000';
      const resposta = await fetch(`${backendUrl}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.uid, // Envia o ID real do usuário logado
          sono,
          humor,
          alimentacao,
        }),
      });
      const dados = await resposta.json();
      setConselho(dados.conselhoIA);
      setSono(''); setHumor(''); setAlimentacao('');
    } catch (error) {
      console.error(error);
      alert('Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  // TELA DE CARREGAMENTO INICIAL
  if (authLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  // TELA DE LOGIN (Mostrada se não houver usuário logado)
  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Bem-Estar em Foco 🌿</Text>
        <Text style={styles.subtitle}>Faça login para continuar</Text>
        
        <View style={styles.form}>
          <Text style={styles.label}>E-mail:</Text>
          <TextInput 
            style={styles.input} 
            placeholder="exemplo@email.com" 
            value={email} 
            onChangeText={setEmail} 
            autoCapitalize="none" 
            keyboardType="email-address"
          />
          
          <Text style={styles.label}>Senha:</Text>
          <TextInput 
            style={styles.input} 
            placeholder="******" 
            value={password} 
            onChangeText={setPassword} 
            secureTextEntry 
          />
          
          <View style={styles.buttonGroup}>
            <Button title="Entrar" color="#2e7d32" onPress={handleLogin} />
            <View style={{ height: 10 }} />
            <Button title="Criar Conta" color="#555" onPress={handleRegistro} />
          </View>
        </View>
      </View>
    );
  }

  // TELA PRINCIPAL (LOGADO - Formulário de Check-in)
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bem-Estar em Foco 🌿</Text>
        <Button title="Sair" color="#d32f2f" onPress={handleLogout} />
      </View>
      <Text style={styles.subtitle}>Como foi o seu dia hoje?</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Qualidade do Sono:</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ex: Dormi 8 horas..." 
          value={sono} 
          onChangeText={setSono} 
        />

        <Text style={styles.label}>Humor:</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ex: Feliz, mas cansado..." 
          value={humor} 
          onChangeText={setHumor} 
        />

        <Text style={styles.label}>Alimentação:</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ex: Comi salada..." 
          value={alimentacao} 
          onChangeText={setAlimentacao} 
        />

        {loading ? (
          <ActivityIndicator size="large" color="#2e7d32" style={{ marginTop: 20 }} />
        ) : (
          <View style={{ marginTop: 20 }}>
            <Button title="Receber Conselho" color="#2e7d32" onPress={fazerCheckin} />
          </View>
        )}
      </View>

      {conselho ? (
        <View style={styles.conselhoCard}>
          <Text style={styles.conselhoTitle}>✨ Conselho da IA:</Text>
          <Text style={styles.conselhoText}>{conselho}</Text>
        </View>
      ) : null}

      <StatusBar style="auto" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    backgroundColor: '#f5f5f5', 
    alignItems: 'center', 
    paddingTop: 50, 
    paddingBottom: 40, 
    paddingHorizontal: 20 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    width: '100%', 
    maxWidth: 400, 
    marginBottom: 10 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#2e7d32', 
    textAlign: 'center' 
  },
  subtitle: { 
    fontSize: 16, 
    color: '#555', 
    marginBottom: 30 
  },
  form: { 
    width: '100%', 
    maxWidth: 400, 
    backgroundColor: '#fff', 
    padding: 20, 
    borderRadius: 10, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 3 
  },
  label: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#333', 
    marginBottom: 5, 
    marginTop: 10 
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#ccc', 
    borderRadius: 5, 
    padding: 10, 
    fontSize: 14, 
    backgroundColor: '#fafafa' 
  },
  buttonGroup: { 
    marginTop: 20 
  },
  conselhoCard: { 
    marginTop: 30, 
    width: '100%', 
    maxWidth: 400, 
    backgroundColor: '#e8f5e9', 
    padding: 20, 
    borderRadius: 10, 
    borderLeftWidth: 5, 
    borderLeftColor: '#2e7d32' 
  },
  conselhoTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#2e7d32', 
    marginBottom: 10 
  },
  conselhoText: { 
    fontSize: 15, 
    color: '#333', 
    lineHeight: 22 
  },
});