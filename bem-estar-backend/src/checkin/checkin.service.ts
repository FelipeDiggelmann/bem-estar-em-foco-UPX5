// src/checkin/checkin.service.ts (BACKEND)
import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import * as admin from 'firebase-admin';

@Injectable()
export class CheckinService {
  private openai: OpenAI;
  private db: admin.firestore.Firestore;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    }
    
    this.db = admin.firestore();
  }

  // Atualizado para receber atividadeFisica e foco
  async criarCheckin(userId: string, sono: string, humor: string, alimentacao: string, atividadeFisica?: string, foco?: string) {
    
    let conselhoIA = "Continue cuidando de você! O importante é manter a constância, um passo de cada vez.";

    // Construindo um prompt dinâmico para a IA
    let resumoDados = `- Qualidade do sono e info básica: ${sono}\n`;
    
    if (foco === 'Saúde física') {
      resumoDados += `- Alimentação: ${alimentacao}\n`;
      resumoDados += `- Atividade Física: ${atividadeFisica || 'Não informada'}\n`;
    } else {
      // Para Mental ou Social, o foco é o relato do humor/interações
      resumoDados += `- Relato do dia (Humor/Interações): ${humor}\n`;
    }

    const prompt = `Atue como um mentor de saúde e bem-estar positivo e acolhedor.
    O usuário escolheu focar hoje em: **${foco || 'Bem-estar geral'}**.
    Ele relatou o seguinte sobre o seu dia:
    ${resumoDados}
    
    Com base no foco escolhido (${foco}), crie uma mensagem curta (máximo 3 frases) de incentivo personalizado e dê uma única dica prática para ajudá-lo amanhã. Se o foco for físico, foque em hábitos corporais; se for mental, foque em equilíbrio emocional. Não dê diagnósticos médicos.`;

    try {
      const aiResponse = await this.openai.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'gpt-3.5-turbo',
      });
      
      if (aiResponse.choices[0].message.content) {
        conselhoIA = aiResponse.choices[0].message.content;
      }
    } catch (error) {
      console.log('Aviso: Falha na OpenAI. Usando mensagem padrão.');
    }

    // Salvando no Firestore (incluindo os novos campos)
    const checkinData = {
      userId,
      sono,
      humor,
      alimentacao,
      atividadeFisica: atividadeFisica || null, // Salva null se não existir
      foco: foco || 'Geral',
      conselhoIA,
      dataCriacao: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await this.db.collection('checkins').add(checkinData);

    return {
      id: docRef.id,
      ...checkinData
    };
  }

  // Adicione esta função dentro da classe CheckinService
  async buscarHistorico(userId: string) {
    try {
      // Vai na coleção 'checkins', filtra pelo ID do usuário e ordena do mais recente pro mais antigo
      const snapshot = await this.db.collection('checkins')
        .where('userId', '==', userId)
        .orderBy('dataCriacao', 'desc')
        .get();

      const historico: any[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        historico.push({
          id: doc.id,
          ...data,
          // Converte o timestamp do Firebase para uma data legível no frontend
          dataCriacao: data.dataCriacao ? data.dataCriacao.toDate() : new Date(),
        });
      });

      return historico;
    } catch (error) {
      console.error('Erro ao buscar histórico no Firebase:', error);
      throw new Error('Falha ao buscar histórico');
    }
  }
}