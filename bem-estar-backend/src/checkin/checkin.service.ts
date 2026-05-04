// src/checkin/checkin.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import OpenAI from 'openai';
import * as admin from 'firebase-admin';

@Injectable()
export class CheckinService {
  private openai: OpenAI;
  private db: admin.firestore.Firestore;

  constructor(private prisma: PrismaService) {
    // Configuração da OpenAI
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Inicialização do Firebase Admin (Verifica se já não foi inicializado antes)
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // O replace garante que as quebras de linha da chave privada sejam lidas corretamente
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    }
    
    this.db = admin.firestore();
  }

  async criarCheckin(userId: string, sono: string, humor: string, alimentacao: string) {
    let conselhoIA = "Continue cuidando de você! O importante é dar um passo de cada vez e manter a constância.";

    const prompt = `Atue como um mentor de saúde e bem-estar positivo e acolhedor. 
    Um usuário relatou o seguinte sobre o seu dia hoje:
    - Qualidade do sono: ${sono}
    - Humor: ${humor}
    - Alimentação: ${alimentacao}
    
    Crie uma mensagem curta (máximo 2 ou 3 frases) de incentivo e dê uma única dica prática para ajudá-lo a melhorar ou manter o bem-estar amanhã. Não dê diagnósticos médicos.`;

    try {
      const aiResponse = await this.openai.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'gpt-3.5-turbo',
      });
      
      if (aiResponse.choices[0].message.content) {
        conselhoIA = aiResponse.choices[0].message.content;
      }
    } catch (error) {
      console.log('Aviso: Falha ao gerar conselho com a OpenAI. Usando mensagem padrão.');
    }

    // NOVA LÓGICA: Salvando no Firebase Firestore em vez do Prisma/SQLite
    const checkinData = {
      userId,
      sono,
      humor,
      alimentacao,
      conselhoIA,
      dataCriacao: admin.firestore.FieldValue.serverTimestamp(), // Salva a hora exata do servidor
    };

    // Cria a coleção "checkins" automaticamente e adiciona o documento
    const docRef = await this.db.collection('checkins').add(checkinData);

    return {
      id: docRef.id,
      ...checkinData
    };
  }
}