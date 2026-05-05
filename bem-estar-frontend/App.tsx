import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, LayoutAnimation, UIManager
} from 'react-native';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from './src/firebaseConfig';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const COLORS = {
  primary: '#5235E8',
  background: '#F9F9FB',
  textDark: '#1E1E2D',
  textLight: '#7A7A8A',
  inputBg: '#FFFFFF',
  inputBorder: '#E0E0E6',
};

const obterDataFormatada = () => {
  const data = new Date();
  const diaSemana = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(data);
  const dia = data.getDate();
  const mes = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(data);
  const ano = data.getFullYear();
  
  return {
    diaSemana: diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1),
    dataCompleta: `${dia} de ${mes} de ${ano}`
  };
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isLoginScreen, setIsLoginScreen] = useState(true);
  
  // Controle de Navegação Interna
  const [etapaAtual, setEtapaAtual] = useState<'HOME' | 'FORM'>('HOME');
  const [passoFormulario, setPassoFormulario] = useState(1);

  // Campos de Auth
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Campos do Formulário em Etapas
  const [idade, setIdade] = useState('');
  const [horasSono, setHorasSono] = useState('');
  const [qualidadeSono, setQualidadeSono] = useState('');
  const [humor, setHumor] = useState('');
  const [alimentacao, setAlimentacao] = useState('');
  
  // Estados de submissão
  const [loading, setLoading] = useState(false);
  const [conselho, setConselho] = useState('');

  const { diaSemana, dataCompleta } = obterDataFormatada();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (currentUser) {
        setEtapaAtual('HOME');
        resetarFormulario();
      }
    });
    return unsubscribe;
  }, []);

  const resetarFormulario = () => {
    setPassoFormulario(1);
    setIdade(''); setHorasSono(''); setQualidadeSono('');
    setHumor(''); setAlimentacao(''); setConselho('');
  };

  const toggleScreen = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsLoginScreen(!isLoginScreen);
  };

  const handleAuth = async () => {
    if (!email || !password) return alert('Preencha os campos obrigatórios!');
    try {
      if (isLoginScreen) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (error: any) {
      alert(isLoginScreen ? 'Login recusado. Verifique os dados.' : 'Erro: ' + error.message);
    }
  };

  const handleLogout = async () => await signOut(auth);

  // Lógica de avançar e recuar no formulário
  const proximoPasso = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPassoFormulario(passoFormulario + 1);
  };

  const passoAnterior = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (passoFormulario === 1) {
      setEtapaAtual('HOME'); // Volta pra home se tiver no primeiro passo
    } else {
      setPassoFormulario(passoFormulario - 1);
    }
  };

  const fazerCheckin = async () => {
    setLoading(true);
    setConselho('');
    proximoPasso(); // Vai para o Passo 4 (Tela de Carregamento/Resultado)

    try {
      const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3000';
      
      // Juntando as informações do sono para o nosso backend
      const sonoFormatado = `Dorme ${horasSono} horas. Qualidade: ${qualidadeSono}. Idade: ${idade}`;

      const resposta = await fetch(`${backendUrl}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.uid,
          sono: sonoFormatado,
          humor,
          alimentacao,
        }),
      });
      const dados = await resposta.json();
      setConselho(dados.conselhoIA);
    } catch (error) {
      console.error(error);
      alert('Erro ao conectar com o servidor.');
      setPassoFormulario(3); // Volta caso dê erro
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  // ==========================================
  // TELA DE AUTENTICAÇÃO
  // ==========================================
  if (!user) {
    // ... CÓDIGO DA TELA DE LOGIN MANTIDO (Igualzinho ao anterior)
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.contentWrapper}>
            <View style={styles.logoContainer}>
              <FontAwesome5 name="hand-holding-heart" size={60} color={COLORS.primary} />
            </View>
            <Text style={styles.title}>{isLoginScreen ? 'Entrar' : 'Registro'}</Text>
            <Text style={styles.subtitle}>{isLoginScreen ? 'Bem vindo de volta! Por favor, insira suas credenciais.' : 'Por favor, preencha seus dados para criar sua conta.'}</Text>
            <View style={styles.form}>
              {!isLoginScreen && (
                <>
                  <Text style={styles.label}>Nome*</Text>
                  <TextInput style={styles.input} placeholder="Insira seu nome" value={nome} onChangeText={setNome} />
                </>
              )}
              <Text style={styles.label}>Email{isLoginScreen ? '' : '*'}</Text>
              <TextInput style={styles.input} placeholder={isLoginScreen ? "exemplo@seuemail.com" : "Insira seu email"} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
              <Text style={styles.label}>Senha{isLoginScreen ? '' : '*'}</Text>
              <TextInput style={styles.input} placeholder={isLoginScreen ? "••••••••" : "Crie uma senha"} value={password} onChangeText={setPassword} secureTextEntry />
              <View style={styles.optionsRow}>
                {isLoginScreen ? (
                  <>
                    <Text style={styles.hintText}>Lembrar-me</Text>
                    <TouchableOpacity><Text style={styles.linkTextBold}>Esqueceu a senha?</Text></TouchableOpacity>
                  </>
                ) : <Text style={styles.hintText}>Deve ter ao menos 6 caracteres.</Text>}
              </View>
              <TouchableOpacity style={styles.primaryButton} onPress={handleAuth}><Text style={styles.primaryButtonText}>{isLoginScreen ? 'Entrar' : 'Criar conta'}</Text></TouchableOpacity>
              <TouchableOpacity style={styles.googleButton} onPress={() => alert('Login com Google em breve!')}>
                <Ionicons name="logo-google" size={20} color="#DB4437" style={{ marginRight: 10 }} />
                <Text style={styles.googleButtonText}>{isLoginScreen ? 'Entre com Google' : 'Registre com Google'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.switchButton} onPress={toggleScreen}>
                <Text style={styles.switchText}>{isLoginScreen ? 'Não possui cadastro? ' : 'Já possui uma conta? '}<Text style={styles.linkTextBold}>{isLoginScreen ? 'Registre' : 'Entrar'}</Text></Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
        <StatusBar style="dark" />
      </KeyboardAvoidingView>
    );
  }

  // ==========================================
  // TELA PRINCIPAL (HOME)
  // ==========================================
  if (user && etapaAtual === 'HOME') {
    // ... CÓDIGO DA TELA HOME MANTIDO (Igualzinho ao anterior)
    return (
      <View style={styles.container}>
        <View style={styles.blobTopLeft} />
        <View style={styles.blobBottomRight} />
        <ScrollView contentContainerStyle={styles.homeScrollContainer}>
          <View style={styles.contentWrapper}>
            <View style={styles.homeHeader}>
              <View>
                <Text style={styles.homeDayText}>{diaSemana}</Text>
                <Text style={styles.homeDateText}>{dataCompleta}</Text>
              </View>
              <FontAwesome5 name="hand-holding-heart" size={45} color={COLORS.primary} />
            </View>
            <Text style={styles.homeTitle}>Qual o seu bem-estar em foco hoje?</Text>
            <View style={styles.focusButtonsContainer}>
              {['Saúde física', 'Saúde mental', 'Saúde social'].map((foco, index) => (
                <TouchableOpacity key={index} activeOpacity={0.8} onPress={() => { resetarFormulario(); setEtapaAtual('FORM'); }}>
                  <LinearGradient colors={['#A928C4', '#5235E8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradientButton}>
                    <Text style={styles.gradientButtonText}>{foco}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.logoutWrapper} onPress={handleLogout}><Text style={styles.linkTextBold}>Sair da conta</Text></TouchableOpacity>
          </View>
        </ScrollView>
        <StatusBar style="dark" />
      </View>
    );
  }

  // ==========================================
  // TELA DO FORMULÁRIO (ETAPAS)
  // ==========================================
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.formScrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.contentWrapper}>
          
          {/* Header do Formulário */}
          <View style={styles.formHeader}>
            <Text style={styles.formHeaderTitle}>Bem-Estar em Foco</Text>
            <Text style={styles.formStepText}>Etapa {passoFormulario} de 4</Text>
          </View>
          
          {/* Barra de Progresso */}
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarFill, { width: `${(passoFormulario / 4) * 100}%` }]} />
          </View>

          {/* CAIXA DE CONTEÚDO DA ETAPA */}
          <View style={styles.stepContainer}>
            
            {passoFormulario === 1 && (
              <>
                <Text style={styles.stepTitle}>Informações básicas</Text>
                <Text style={styles.stepSubtitle}>Conte-nos um pouco sobre você</Text>

                <Text style={styles.label}>Idade</Text>
                <TextInput style={styles.input} placeholder="Ex. 25" value={idade} onChangeText={setIdade} keyboardType="numeric" />

                <Text style={styles.label}>Quantas horas dorme por noite?</Text>
                <TextInput style={styles.input} placeholder="Ex. 7" value={horasSono} onChangeText={setHorasSono} keyboardType="numeric" />

                <Text style={styles.label}>Como avalia a qualidade do sono?</Text>
                <TextInput style={styles.input} placeholder="Péssimo / Ruim / Bom / Ótimo" value={qualidadeSono} onChangeText={setQualidadeSono} />
              </>
            )}

            {passoFormulario === 2 && (
              <>
                <Text style={styles.stepTitle}>Saúde Mental</Text>
                <Text style={styles.stepSubtitle}>Como estão suas emoções hoje?</Text>

                <Text style={styles.label}>Descreva seu humor</Text>
                <TextInput 
                  style={[styles.input, {height: 100, textAlignVertical: 'top'}]} 
                  placeholder="Ex: Estou me sentindo bem, mas um pouco estressado com o trabalho..." 
                  value={humor} onChangeText={setHumor} multiline 
                />
              </>
            )}

            {passoFormulario === 3 && (
              <>
                <Text style={styles.stepTitle}>Hábitos e Alimentação</Text>
                <Text style={styles.stepSubtitle}>O combustível do seu corpo</Text>

                <Text style={styles.label}>Como foi sua alimentação hoje?</Text>
                <TextInput 
                  style={[styles.input, {height: 100, textAlignVertical: 'top'}]} 
                  placeholder="Ex: Comi bastante salada no almoço, mas exagerei no doce à tarde..." 
                  value={alimentacao} onChangeText={setAlimentacao} multiline 
                />
              </>
            )}

            {passoFormulario === 4 && (
              <View style={styles.centerContent}>
                {loading ? (
                  <>
                    <ActivityIndicator size="large" color={COLORS.primary} style={{marginBottom: 20}} />
                    <Text style={styles.stepTitle}>A Inteligência Artificial está analisando seu dia...</Text>
                  </>
                ) : (
                  <>
                    <FontAwesome5 name="magic" size={40} color={COLORS.primary} style={{marginBottom: 15}} />
                    <Text style={styles.stepTitle}>Seu Conselho Diário</Text>
                    <View style={styles.aiCard}>
                      <Text style={styles.aiCardText}>{conselho}</Text>
                    </View>
                  </>
                )}
              </View>
            )}

          </View>

          {/* BOTÕES DE NAVEGAÇÃO */}
          <View style={styles.navButtonsContainer}>
            {passoFormulario < 4 ? (
              <>
                <TouchableOpacity style={styles.outlineButton} onPress={passoAnterior}>
                  <Text style={styles.outlineButtonText}>Anterior</Text>
                </TouchableOpacity>

                {passoFormulario === 3 ? (
                  <TouchableOpacity style={[styles.primaryButton, {flex: 1}]} onPress={fazerCheckin}>
                    <Text style={styles.primaryButtonText}>Finalizar</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={[styles.primaryButton, {flex: 1}]} onPress={proximoPasso}>
                    <Text style={styles.primaryButtonText}>Próximo</Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              !loading && (
                <TouchableOpacity style={styles.primaryButton} onPress={() => setEtapaAtual('HOME')}>
                  <Text style={styles.primaryButtonText}>Voltar para o Início</Text>
                </TouchableOpacity>
              )
            )}
          </View>

        </View>
      </ScrollView>
      <StatusBar style="dark" />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  // ... ESTILOS GERAIS MANTIDOS
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContainer: { flexGrow: 1, paddingHorizontal: 30, paddingTop: 60, paddingBottom: 40, justifyContent: 'center' },
  contentWrapper: { width: '100%', maxWidth: 450, alignSelf: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  centerContent: { alignItems: 'center', marginVertical: 20 },
  
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.textDark, marginBottom: 10 },
  subtitle: { fontSize: 15, color: COLORS.textLight, marginBottom: 30, lineHeight: 22 },
  
  form: { width: '100%' },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.textDark, marginBottom: 8, marginTop: 15 },
  input: { backgroundColor: COLORS.inputBg, borderWidth: 1, borderColor: COLORS.inputBorder, borderRadius: 12, padding: 15, fontSize: 16, color: COLORS.textDark },
  optionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 20 },
  hintText: { fontSize: 13, color: COLORS.textLight },
  linkTextBold: { fontSize: 14, fontWeight: 'bold', color: COLORS.primary },
  
  primaryButton: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5, width: '100%' },
  primaryButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  googleButton: { flexDirection: 'row', backgroundColor: COLORS.inputBg, borderWidth: 1, borderColor: COLORS.inputBorder, borderRadius: 12, paddingVertical: 15, alignItems: 'center', justifyContent: 'center', marginTop: 15 },
  googleButtonText: { color: COLORS.textDark, fontSize: 15, fontWeight: '600' },
  switchButton: { marginTop: 30, alignItems: 'center' },
  switchText: { fontSize: 14, color: COLORS.textLight },

  homeScrollContainer: { flexGrow: 1, paddingHorizontal: 30, paddingTop: 60, paddingBottom: 40 },
  homeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 50 },
  homeDayText: { fontSize: 22, fontWeight: 'bold', color: COLORS.textDark },
  homeDateText: { fontSize: 16, color: COLORS.textLight, marginTop: 4 },
  homeTitle: { fontSize: 28, fontWeight: 'bold', color: COLORS.textDark, marginBottom: 40, lineHeight: 36 },
  focusButtonsContainer: { width: '100%', gap: 20 },
  gradientButton: { borderRadius: 12, paddingVertical: 20, alignItems: 'center', justifyContent: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 },
  gradientButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  logoutWrapper: { marginTop: 40, alignItems: 'center', padding: 10 },
  blobTopLeft: { position: 'absolute', top: -100, left: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: '#EADAF5', opacity: 0.5 },
  blobBottomRight: { position: 'absolute', bottom: -100, right: -100, width: 350, height: 350, borderRadius: 175, backgroundColor: '#EADAF5', opacity: 0.5 },

  // NOVOS ESTILOS DO FORMULÁRIO EM ETAPAS
  formScrollContainer: { flexGrow: 1, paddingHorizontal: 30, paddingTop: 50, paddingBottom: 40 },
  formHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 15 },
  formHeaderTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.textDark },
  formStepText: { fontSize: 14, color: COLORS.textLight, fontWeight: '600' },
  
  progressBarContainer: { height: 4, backgroundColor: COLORS.inputBorder, borderRadius: 2, width: '100%', overflow: 'hidden', marginBottom: 30 },
  progressBarFill: { height: '100%', backgroundColor: COLORS.primary },
  
  stepContainer: { backgroundColor: COLORS.inputBg, borderRadius: 15, padding: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2, marginBottom: 30 },
  stepTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.primary, marginBottom: 5 },
  stepSubtitle: { fontSize: 14, color: COLORS.textLight, marginBottom: 20 },
  
  navButtonsContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 15 },
  outlineButton: { flex: 1, backgroundColor: 'transparent', borderWidth: 1, borderColor: COLORS.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  outlineButtonText: { color: COLORS.primary, fontSize: 16, fontWeight: 'bold' },
  
  aiCard: { backgroundColor: '#F3EFFF', borderRadius: 12, padding: 20, borderWidth: 1, borderColor: '#EADAF5', marginTop: 10 },
  aiCardText: { fontSize: 16, color: COLORS.textDark, lineHeight: 24, textAlign: 'center' }
});