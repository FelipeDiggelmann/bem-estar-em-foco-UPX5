import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, LayoutAnimation, UIManager
} from 'react-native';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from './src/firebaseConfig';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

// Habilita animações fluidas no Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Cores baseadas nas suas prints
const COLORS = {
  primary: '#5235E8',
  background: '#F9F9FB',
  textDark: '#1E1E2D',
  textLight: '#7A7A8A',
  inputBg: '#FFFFFF',
  inputBorder: '#E0E0E6',
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Controle de Tela (Login vs Registro)
  const [isLoginScreen, setIsLoginScreen] = useState(true);

  // Campos de Auth
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Estados do Check-in (Mantidos para a tela interna)
  const [sono, setSono] = useState('');
  const [humor, setHumor] = useState('');
  const [alimentacao, setAlimentacao] = useState('');
  const [loading, setLoading] = useState(false);
  const [conselho, setConselho] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  const toggleScreen = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsLoginScreen(!isLoginScreen);
  };

  const handleAuth = async () => {
    if (!email || !password) {
      alert('Preencha os campos obrigatórios!');
      return;
    }
    
    try {
      if (isLoginScreen) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        alert('Conta criada com sucesso!');
      }
    } catch (error: any) {
      console.error('Erro Auth:', error.message);
      alert(isLoginScreen ? 'Login recusado. Verifique os dados.' : 'Erro ao criar conta: ' + error.message);
    }
  };

  const handleLogout = async () => await signOut(auth);

  const fazerCheckin = async () => { /* Lógica mantida para quando formos refatorar a tela de check-in */ };

  if (authLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }

  // ==========================================
  // TELA DE AUTENTICAÇÃO (LOGIN / REGISTRO)
  // ==========================================
  if (!user) {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          {/* CAIXA CENTRALIZADORA PARA WEB/DESKTOP */}
          <View style={styles.contentWrapper}>
            
            {/* Logo Placeholder */}
            <View style={styles.logoContainer}>
              <FontAwesome5 name="hand-holding-heart" size={60} color={COLORS.primary} />
            </View>

            <Text style={styles.title}>{isLoginScreen ? 'Entrar' : 'Registro'}</Text>
            <Text style={styles.subtitle}>
              {isLoginScreen 
                ? 'Bem vindo de volta! Por favor, insira suas credenciais.' 
                : 'Por favor, preencha seus dados para criar sua conta.'}
            </Text>

            <View style={styles.form}>
              {!isLoginScreen && (
                <>
                  <Text style={styles.label}>Nome*</Text>
                  <TextInput style={styles.input} placeholder="Insira seu nome" value={nome} onChangeText={setNome} />
                </>
              )}

              <Text style={styles.label}>Email{isLoginScreen ? '' : '*'}</Text>
              <TextInput 
                style={styles.input} 
                placeholder={isLoginScreen ? "exemplo@seuemail.com" : "Insira seu email"}
                value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address"
              />

              <Text style={styles.label}>Senha{isLoginScreen ? '' : '*'}</Text>
              <TextInput 
                style={styles.input} 
                placeholder={isLoginScreen ? "••••••••" : "Crie uma senha"}
                value={password} onChangeText={setPassword} secureTextEntry
              />
              
              {/* Esqueceu a senha / Dica de senha */}
              <View style={styles.optionsRow}>
                {isLoginScreen ? (
                  <>
                    <Text style={styles.hintText}>Lembrar-me</Text>
                    <TouchableOpacity><Text style={styles.linkTextBold}>Esqueceu a senha?</Text></TouchableOpacity>
                  </>
                ) : (
                  <Text style={styles.hintText}>Deve ter ao menos 6 caracteres.</Text>
                )}
              </View>

              {/* Botão Principal */}
              <TouchableOpacity style={styles.primaryButton} onPress={handleAuth}>
                <Text style={styles.primaryButtonText}>{isLoginScreen ? 'Entrar' : 'Criar conta'}</Text>
              </TouchableOpacity>

              {/* Botão do Google (Visual) */}
              <TouchableOpacity style={styles.googleButton} onPress={() => alert('Login com Google em breve!')}>
                <Ionicons name="logo-google" size={20} color="#DB4437" style={{ marginRight: 10 }} />
                <Text style={styles.googleButtonText}>
                  {isLoginScreen ? 'Entre com Google' : 'Registre com Google'}
                </Text>
              </TouchableOpacity>

              {/* Alternar Telas */}
              <TouchableOpacity style={styles.switchButton} onPress={toggleScreen}>
                <Text style={styles.switchText}>
                  {isLoginScreen ? 'Não possui cadastro? ' : 'Já possui uma conta? '}
                  <Text style={styles.linkTextBold}>{isLoginScreen ? 'Registre' : 'Entrar'}</Text>
                </Text>
              </TouchableOpacity>
            </View>
            
          </View>
        </ScrollView>
        <StatusBar style="dark" />
      </KeyboardAvoidingView>
    );
  }

  // ==========================================
  // TELA PRINCIPAL LOGADA
  // ==========================================
  return (
    <View style={styles.center}>
      <Text style={styles.title}>Logado com Sucesso!</Text>
      <Text style={styles.subtitle}>A tela de Check-in (Etapas) será construída aqui.</Text>
      <TouchableOpacity style={[styles.primaryButton, {marginTop: 20, width: 200}]} onPress={handleLogout}>
        <Text style={styles.primaryButtonText}>Sair</Text>
      </TouchableOpacity>
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContainer: { flexGrow: 1, paddingHorizontal: 30, paddingTop: 60, paddingBottom: 40, justifyContent: 'center' },
  
  // NOVA CLASSE PARA CENTRALIZAR NA WEB
  contentWrapper: { 
    width: '100%', 
    maxWidth: 450, 
    alignSelf: 'center' 
  },
  
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.textDark, marginBottom: 10 },
  subtitle: { fontSize: 15, color: COLORS.textLight, marginBottom: 30, lineHeight: 22 },
  
  form: { width: '100%' }, // Removido o alignSelf e maxWidth daqui, pois o contentWrapper já faz isso
  label: { fontSize: 14, fontWeight: '600', color: COLORS.textDark, marginBottom: 8, marginTop: 15 },
  input: { 
    backgroundColor: COLORS.inputBg, 
    borderWidth: 1, 
    borderColor: COLORS.inputBorder, 
    borderRadius: 12, 
    padding: 15, 
    fontSize: 16,
    color: COLORS.textDark
  },
  
  optionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 20 },
  hintText: { fontSize: 13, color: COLORS.textLight },
  linkTextBold: { fontSize: 13, fontWeight: 'bold', color: COLORS.primary },
  
  primaryButton: { 
    backgroundColor: COLORS.primary, 
    borderRadius: 12, 
    paddingVertical: 16, 
    alignItems: 'center', 
    shadowColor: COLORS.primary, 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 5, 
    elevation: 5 
  },
  primaryButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  
  googleButton: { 
    flexDirection: 'row',
    backgroundColor: COLORS.inputBg, 
    borderWidth: 1, 
    borderColor: COLORS.inputBorder, 
    borderRadius: 12, 
    paddingVertical: 15, 
    alignItems: 'center', 
    justifyContent: 'center',
    marginTop: 15 
  },
  googleButtonText: { color: COLORS.textDark, fontSize: 15, fontWeight: '600' },
  
  switchButton: { marginTop: 30, alignItems: 'center' },
  switchText: { fontSize: 14, color: COLORS.textLight },
});