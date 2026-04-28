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
    // 1. Criamos o prompt para a IA baseado nas respostas do formulário
    const prompt = `Atue como um mentor de saúde e bem-estar positivo e acolhedor. 
    Um usuário relatou o seguinte sobre o seu dia hoje:
    - Qualidade do sono: ${sono}
    - Humor: ${humor}
    - Alimentação: ${alimentacao}
    
    Crie uma mensagem curta (máximo 2 ou 3 frases) de incentivo e dê uma única dica prática para ajudá-lo a melhorar ou manter o bem-estar amanhã. Não dê diagnósticos médicos.`;

    // 2. Chamamos a OpenAI
    const aiResponse = await this.openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-3.5-turbo',
    });

    const conselhoIA = aiResponse.choices[0].message.content;

    // 3. Salvamos no banco de dados SQLite
    const checkinSalvo = await this.prisma.checkin.create({
      data: {
        userId,
        sono,
        humor,
        alimentacao,
        conselhoIA,
      },
    });

    // 4. Retornamos o resultado final
    return checkinSalvo;
  }
}