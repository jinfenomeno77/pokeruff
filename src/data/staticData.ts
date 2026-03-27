// Static data for POKERUFF - blind structure and FAQ

export interface BlindLevel {
  level: number;
  smallBlind: number;
  bigBlind: number;
  ante: number;
  duration: number; // minutes
  isBreak?: boolean;
}

export const blindStructure: BlindLevel[] = [
  { level: 1, smallBlind: 5, bigBlind: 10, ante: 0, duration: 20 },
  { level: 2, smallBlind: 10, bigBlind: 20, ante: 0, duration: 20 },
  { level: 3, smallBlind: 15, bigBlind: 30, ante: 0, duration: 20 },
  { level: 4, smallBlind: 25, bigBlind: 50, ante: 0, duration: 20 },
  { level: 5, smallBlind: 50, bigBlind: 100, ante: 0, duration: 20 },
  { level: 6, smallBlind: 75, bigBlind: 150, ante: 0, duration: 15 },
  { level: 0, smallBlind: 0, bigBlind: 0, ante: 0, duration: 10, isBreak: true },
  { level: 7, smallBlind: 100, bigBlind: 200, ante: 0, duration: 15 },
  { level: 8, smallBlind: 150, bigBlind: 300, ante: 0, duration: 15 },
  { level: 9, smallBlind: 200, bigBlind: 400, ante: 0, duration: 15 },
  { level: 10, smallBlind: 250, bigBlind: 500, ante: 0, duration: 15 },
  { level: 0, smallBlind: 0, bigBlind: 0, ante: 0, duration: 10, isBreak: true },
  { level: 11, smallBlind: 300, bigBlind: 600, ante: 0, duration: 15 },
  { level: 12, smallBlind: 400, bigBlind: 800, ante: 0, duration: 15 },
  { level: 13, smallBlind: 500, bigBlind: 1000, ante: 0, duration: 15 },
  { level: 14, smallBlind: 600, bigBlind: 1200, ante: 0, duration: 15 },
  { level: 0, smallBlind: 0, bigBlind: 0, ante: 0, duration: 10, isBreak: true },
  { level: 15, smallBlind: 800, bigBlind: 1600, ante: 0, duration: 15 },
  { level: 16, smallBlind: 1000, bigBlind: 2000, ante: 0, duration: 15 },
  { level: 17, smallBlind: 1500, bigBlind: 3000, ante: 0, duration: 15 },
  { level: 18, smallBlind: 2000, bigBlind: 4000, ante: 0, duration: 15 },
  { level: 0, smallBlind: 0, bigBlind: 0, ante: 0, duration: 10, isBreak: true },
  { level: 19, smallBlind: 2500, bigBlind: 5000, ante: 0, duration: 15 },
  { level: 20, smallBlind: 3000, bigBlind: 6000, ante: 0, duration: 15 },
  { level: 21, smallBlind: 4000, bigBlind: 8000, ante: 0, duration: 15 },
  { level: 22, smallBlind: 5000, bigBlind: 10000, ante: 0, duration: 15 },
];

// Index where late registration ends (after level 5, before level 6)
export const LATE_REGISTRATION_END_INDEX = 5; // index of level 6

export const faqItems = [
  {
    question: "Qual o stack inicial?",
    answer: "Cada jogador começa com 5.000 fichas (chips).",
  },
  {
    question: "Tem registro tardio?",
    answer: "Sim! O registro tardio é permitido até o final do nível 5 (antes do nível 6).",
  },
  {
    question: "Posso reentrar no torneio?",
    answer: "Sim, uma reentrada é permitida até o final do nível 5. O custo é R$ 25 e você recebe 3.500 fichas.",
  },
  {
    question: "Qual a premiação?",
    answer: "A premiação é dividida entre os 5 primeiros colocados, proporcionalmente ao prize pool total.",
  },
  {
    question: "Preciso levar fichas ou cartas?",
    answer: "Não! Todo o material é fornecido pelo organizador. Basta aparecer e jogar.",
  },
  {
    question: "Como funciona o pagamento?",
    answer: "O pagamento do buy-in deve ser feito via PIX após a inscrição. Após a confirmação, seu status será atualizado.",
  },
];
