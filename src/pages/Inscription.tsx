import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { nextTournament } from "@/data/fakeData";

type Step = "info" | "payment" | "done";

export default function Inscription() {
  const [step, setStep] = useState<Step>("info");

  return (
    <div className="min-h-screen pb-20 md:pb-10">
      <div className="container py-6 max-w-md">
        <Link to="/tournaments" className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-6 hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>

        {step === "info" && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">Inscrição</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Confirme seus dados para se inscrever no torneio.
            </p>

            <div className="rounded-xl border border-border bg-card p-4 mb-6">
              <p className="font-display text-sm font-semibold text-accent mb-1">{nextTournament.name}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(nextTournament.date).toLocaleDateString("pt-BR")} às {nextTournament.time}
              </p>
              <p className="text-xs text-muted-foreground">Buy-in: R${nextTournament.buyIn}</p>
            </div>

            <div className="space-y-3 mb-6">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Nome completo</label>
                <input
                  type="text"
                  defaultValue="João da Silva"
                  className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">WhatsApp</label>
                <input
                  type="tel"
                  defaultValue="(11) 99999-9999"
                  className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <button
              onClick={() => setStep("payment")}
              className="w-full rounded-lg bg-accent px-4 py-3 font-display text-sm font-semibold text-accent-foreground transition-all hover:scale-[1.02]"
            >
              Continuar para pagamento
            </button>
          </motion.div>
        )}

        {step === "payment" && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">Pagamento</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Realize o pagamento via PIX para confirmar sua inscrição.
            </p>

            <div className="rounded-xl border border-border bg-card p-5 text-center mb-6">
              <p className="text-xs text-muted-foreground mb-2">Valor do Buy-in</p>
              <p className="font-display text-4xl font-bold text-gradient-gold mb-4">
                R${nextTournament.buyIn},00
              </p>
              <div className="rounded-lg bg-secondary p-4 mb-3">
                <p className="text-xs text-muted-foreground mb-1">Chave PIX</p>
                <p className="text-sm font-mono font-semibold text-foreground">pokeruff@email.com</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Após o pagamento, envie o comprovante pelo WhatsApp do organizador.
              </p>
            </div>

            <button
              onClick={() => setStep("done")}
              className="w-full rounded-lg bg-primary px-4 py-3 font-display text-sm font-semibold text-primary-foreground transition-all hover:scale-[1.02]"
            >
              Já realizei o pagamento
            </button>
          </motion.div>
        )}

        {step === "done" && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
            <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">Inscrição Realizada!</h1>
            <p className="text-sm text-muted-foreground mb-2">
              Seu status: <span className="font-semibold text-warning">Aguardando aprovação</span>
            </p>
            <p className="text-xs text-muted-foreground mb-8">
              Você será notificado assim que o organizador confirmar seu pagamento.
            </p>
            <Link
              to="/tournaments"
              className="inline-flex rounded-lg bg-secondary px-6 py-3 text-sm font-semibold text-foreground hover:bg-secondary/80 transition-colors"
            >
              Ver torneios
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
