// src/checkin/checkin.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import OpenAI from 'openai';

@Injectable()
export class CheckinService {
  private openai: OpenAI;

  constructor(private prisma: PrismaService) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async criarCheckin(userId: string, sono: string, humor: string, alimentacao: string) {
    let conselhoIA = "Continue cuidando de você! O importante é dar um passo de cada vez e manter a constância."; // Mensagem padrão (Plano B)

    const prompt = `Atue como um mentor de saúde e bem-estar positivo e acolhedor. 
    Um usuário relatou o seguinte sobre o seu dia hoje:
    - Qualidade do sono: ${sono}
    - Humor: ${humor}
    - Alimentação: ${alimentacao}
    
    Crie uma mensagem curta (máximo 2 ou 3 frases) de incentivo e dê uma única dica prática para ajudá-lo a melhorar ou manter o bem-estar amanhã. Não dê diagnósticos médicos.`;

    // Tentamos chamar a IA
    try {
      const aiResponse = await this.openai.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'gpt-3.5-turbo',
      });
      
      // Se der certo, substituímos a mensagem padrão pela gerada pela IA
      if (aiResponse.choices[0].message.content) {
        conselhoIA = aiResponse.choices[0].message.content;
      }
    } catch (error) {
      // Se a IA der erro (como falta de crédito), o sistema cai aqui silenciosamente e usa o Plano B
      console.log('Aviso: Falha ao gerar conselho com a OpenAI. Usando mensagem padrão.');
    }

    // Salvamos no banco de dados independentemente de a IA ter funcionado ou não
    const checkinSalvo = await this.prisma.checkin.create({
      data: {
        userId,
        sono,
        humor,
        alimentacao,
        conselhoIA,
      },
    });

    return checkinSalvo;
  }
}