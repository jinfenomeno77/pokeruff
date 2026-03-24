// Fake data for the POKERUFF poker tournament system

export type TournamentStatus = "pre-inscription" | "confirming" | "in-progress" | "finished";
export type PlayerStatus = "inscrito" | "confirmado" | "eliminado" | "reentrada";
export type InscriptionStatus = "aguardando" | "confirmado";

export interface Tournament {
  id: string;
  name: string;
  date: string;
  time: string;
  location?: string;
  buyIn: number;
  reentryFee: number;
  initialStack: number;
  reentryStack: number;
  status: TournamentStatus;
  maxPlayers: number;
  players: Player[];
  blindStructure: BlindLevel[];
  currentBlindIndex?: number;
  tables?: Table[];
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  stack: number;
  status: PlayerStatus;
  inscriptionStatus: InscriptionStatus;
  tableId?: string;
  position?: number;
}

export interface BlindLevel {
  level: number;
  smallBlind: number;
  bigBlind: number;
  ante: number;
  duration: number; // minutes
  isBreak?: boolean;
}

export interface Table {
  id: string;
  name: string;
  seats: number;
  playerIds: string[];
}

export const blindStructure: BlindLevel[] = [
  { level: 1, smallBlind: 5, bigBlind: 10, ante: 0, duration: 20 },
  { level: 2, smallBlind: 10, bigBlind: 20, ante: 0, duration: 20 },
  { level: 3, smallBlind: 15, bigBlind: 30, ante: 0, duration: 20 },
  { level: 4, smallBlind: 25, bigBlind: 50, ante: 0, duration: 20 },
  { level: 5, smallBlind: 50, bigBlind: 100, ante: 0, duration: 20 },
  { level: 6, smallBlind: 75, bigBlind: 150, ante: 0, duration: 20 },
  { level: 0, smallBlind: 0, bigBlind: 0, ante: 0, duration: 10, isBreak: true },
  { level: 7, smallBlind: 100, bigBlind: 200, ante: 0, duration: 15 },
  { level: 8, smallBlind: 150, bigBlind: 300, ante: 0, duration: 15 },
  { level: 9, smallBlind: 200, bigBlind: 400, ante: 0, duration: 15 },
  { level: 10, smallBlind: 250, bigBlind: 500, ante: 0, duration: 15 },
  { level: 0, smallBlind: 0, bigBlind: 0, ante: 0, duration: 10, isBreak: true },
  { level: 11, smallBlind: 300, bigBlind: 600, ante: 0, duration: 12 },
  { level: 12, smallBlind: 400, bigBlind: 800, ante: 0, duration: 12 },
  { level: 13, smallBlind: 500, bigBlind: 1000, ante: 0, duration: 12 },
  { level: 14, smallBlind: 600, bigBlind: 1200, ante: 0, duration: 12 },
  { level: 0, smallBlind: 0, bigBlind: 0, ante: 0, duration: 10, isBreak: true },
  { level: 15, smallBlind: 800, bigBlind: 1600, ante: 0, duration: 10 },
  { level: 16, smallBlind: 1000, bigBlind: 2000, ante: 0, duration: 10 },
  { level: 17, smallBlind: 1500, bigBlind: 3000, ante: 0, duration: 10 },
  { level: 18, smallBlind: 2000, bigBlind: 4000, ante: 0, duration: 10 },
  { level: 0, smallBlind: 0, bigBlind: 0, ante: 0, duration: 10, isBreak: true },
  { level: 19, smallBlind: 2500, bigBlind: 5000, ante: 0, duration: 10 },
  { level: 20, smallBlind: 3000, bigBlind: 6000, ante: 0, duration: 10 },
  { level: 21, smallBlind: 4000, bigBlind: 8000, ante: 0, duration: 10 },
  { level: 22, smallBlind: 5000, bigBlind: 10000, ante: 0, duration: 10 },
];

export const fakePlayers: Player[] = [
  { id: "1", name: "Lucas Silva", avatar: "LS", stack: 15200, status: "confirmado", inscriptionStatus: "confirmado" },
  { id: "2", name: "Rafael Costa", avatar: "RC", stack: 12800, status: "confirmado", inscriptionStatus: "confirmado" },
  { id: "3", name: "Bruno Oliveira", avatar: "BO", stack: 18500, status: "confirmado", inscriptionStatus: "confirmado" },
  { id: "4", name: "Pedro Santos", avatar: "PS", stack: 9400, status: "confirmado", inscriptionStatus: "confirmado" },
  { id: "5", name: "Thiago Lima", avatar: "TL", stack: 22100, status: "confirmado", inscriptionStatus: "confirmado" },
  { id: "6", name: "André Rocha", avatar: "AR", stack: 7600, status: "confirmado", inscriptionStatus: "confirmado" },
  { id: "7", name: "Felipe Dias", avatar: "FD", stack: 11300, status: "confirmado", inscriptionStatus: "confirmado" },
  { id: "8", name: "Matheus Alves", avatar: "MA", stack: 0, status: "eliminado", inscriptionStatus: "confirmado" },
  { id: "9", name: "Gabriel Souza", avatar: "GS", stack: 14700, status: "confirmado", inscriptionStatus: "confirmado" },
  { id: "10", name: "Diego Martins", avatar: "DM", stack: 8200, status: "reentrada", inscriptionStatus: "confirmado" },
  { id: "11", name: "Vinícius Pereira", avatar: "VP", stack: 0, status: "inscrito", inscriptionStatus: "aguardando" },
  { id: "12", name: "Caio Ferreira", avatar: "CF", stack: 0, status: "inscrito", inscriptionStatus: "aguardando" },
];

export const nextTournament: Tournament = {
  id: "t1",
  name: "PokerUFF 3ª ed.",
  date: "2026-04-25",
  time: "19:00",
  location: "Edifício Splendore - Salão de Festas",
  buyIn: 35,
  reentryFee: 25,
  initialStack: 5000,
  reentryStack: 3500,
  status: "pre-inscription",
  maxPlayers: 18,
  players: fakePlayers,
  blindStructure,
};

export const liveTournament: Tournament = {
  id: "t-live",
  name: "PokerUFF 2ª ed.",
  date: "2025-10-17",
  time: "19:00",
  buyIn: 35,
  reentryFee: 25,
  initialStack: 5000,
  reentryStack: 3500,
  status: "in-progress",
  maxPlayers: 16,
  players: fakePlayers.filter(p => p.inscriptionStatus === "confirmado"),
  blindStructure,
  currentBlindIndex: 3,
  tables: [
    { id: "m1", name: "Mesa 1", seats: 6, playerIds: ["1", "2", "3", "4", "5"] },
    { id: "m2", name: "Mesa 2", seats: 6, playerIds: ["6", "7", "9", "10"] },
  ],
};

export const pastTournaments: Tournament[] = [
  {
    id: "t-p1",
    name: "PokerUFF 1ª ed.",
    date: "2025-09-19",
    time: "19:00",
    buyIn: 35,
    reentryFee: 25,
    initialStack: 5000,
    reentryStack: 3500,
    status: "finished",
    maxPlayers: 16,
    players: [
      { id: "r1-1", name: "Lucas", avatar: "LU", stack: 0, status: "confirmado", inscriptionStatus: "confirmado", position: 1 },
      { id: "r1-2", name: "Facioli", avatar: "FA", stack: 0, status: "confirmado", inscriptionStatus: "confirmado", position: 2 },
      { id: "r1-3", name: "Rafael", avatar: "RA", stack: 0, status: "confirmado", inscriptionStatus: "confirmado", position: 3 },
      { id: "r1-4", name: "Chico", avatar: "CH", stack: 0, status: "confirmado", inscriptionStatus: "confirmado", position: 4 },
      { id: "r1-5", name: "Baiano", avatar: "BA", stack: 0, status: "confirmado", inscriptionStatus: "confirmado", position: 5 },
    ],
    blindStructure,
  },
  {
    id: "t-p2",
    name: "PokerUFF 2ª ed.",
    date: "2025-10-17",
    time: "19:00",
    buyIn: 35,
    reentryFee: 25,
    initialStack: 5000,
    reentryStack: 3500,
    status: "finished",
    maxPlayers: 16,
    players: [
      { id: "r2-1", name: "Chico", avatar: "CH", stack: 0, status: "confirmado", inscriptionStatus: "confirmado", position: 1 },
      { id: "r2-2", name: "Lucas", avatar: "LU", stack: 0, status: "confirmado", inscriptionStatus: "confirmado", position: 2 },
      { id: "r2-3", name: "Hugo", avatar: "HU", stack: 0, status: "confirmado", inscriptionStatus: "confirmado", position: 3 },
      { id: "r2-4", name: "Rafael", avatar: "RA", stack: 0, status: "confirmado", inscriptionStatus: "confirmado", position: 4 },
      { id: "r2-5", name: "Marcus Jr", avatar: "MJ", stack: 0, status: "confirmado", inscriptionStatus: "confirmado", position: 5 },
    ],
    blindStructure,
  },
];

export const faqItems = [
  {
    question: "Qual o stack inicial?",
    answer: "Cada jogador começa com 5.000 fichas (chips).",
  },
  {
    question: "Tem registro tardio?",
    answer: "Sim! O registro tardio é permitido até o final do nível 6 (antes do primeiro intervalo).",
  },
  {
    question: "Posso reentrar no torneio?",
    answer: "Sim, uma reentrada é permitida até o final do nível 6. O custo é R$ 25 e você recebe 3.500 fichas.",
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
