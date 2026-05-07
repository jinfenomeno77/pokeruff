import { motion } from "framer-motion";
import { useState } from "react";
import { Pencil } from "lucide-react";
import { faqItems } from "@/data/staticData";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAuth } from "@/hooks/useAuth";
import { useBlindStructure } from "@/hooks/useBlindStructure";
import BlindStructureEditor from "@/components/BlindStructureEditor";

export default function Structure() {
  const { isAdmin } = useAuth();
  const { id: configId, structure: blindStructure, lateRegistrationEndIndex } = useBlindStructure();
  const [editorOpen, setEditorOpen] = useState(false);

  return (
    <div className="min-h-screen pb-20 md:pb-10">
      <div className="container py-6 md:py-10 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
            Estrutura & Regras
          </h1>
          <p className="text-muted-foreground text-sm mb-8">
            Confira a estrutura de blinds, intervalos e perguntas frequentes.
          </p>
        </motion.div>

        {/* Blind Structure Table */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card overflow-hidden mb-8"
        >
          <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-2">
            <h2 className="font-display text-lg font-semibold text-foreground">Estrutura de Blinds</h2>
            {isAdmin && (
              <button
                onClick={() => setEditorOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Pencil className="h-3.5 w-3.5" />
                Editar estrutura
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="px-4 py-2.5 text-left font-medium">Nível</th>
                  <th className="px-4 py-2.5 text-right font-medium">SB</th>
                  <th className="px-4 py-2.5 text-right font-medium">BB</th>
                  <th className="px-4 py-2.5 text-right font-medium">Tempo</th>
                </tr>
              </thead>
              <tbody>
                {blindStructure.map((level, i) => (
                  <>
                    {/* Late registration end banner */}
                    {i === lateRegistrationEndIndex && (
                      <tr key="late-reg-end">
                        <td colSpan={4} className="bg-destructive/20 border-y-2 border-destructive px-4 py-2 text-center">
                          <span className="text-xs font-bold uppercase tracking-widest text-destructive">
                            ⛔ Fim do Registro Tardio / Reentrada
                          </span>
                        </td>
                      </tr>
                    )}
                    <tr
                      key={i}
                      className={`border-b border-border last:border-0 ${
                        level.isBreak
                          ? "bg-warning/10 text-warning"
                          : "text-foreground"
                      }`}
                    >
                      <td className="px-4 py-2.5 font-medium">
                        {level.isBreak ? "☕ Intervalo" : `Nível ${level.level}`}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {level.isBreak ? "—" : level.smallBlind.toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {level.isBreak ? "—" : level.bigBlind.toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5 text-right">{level.duration} min</td>
                    </tr>
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* General info */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl border border-border bg-card p-4 mb-8"
        >
          <h2 className="font-display text-lg font-semibold text-foreground mb-3">Informações Gerais</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            {[
              { label: "Buy-in", value: "R$ 35" },
              { label: "Stack Inicial", value: "5.000 fichas" },
              { label: "Reentrada", value: "R$ 25 (3.500 fichas)" },
              { label: "Registro Tardio", value: "Até nível 5" },
              { label: "Add-on", value: "Não disponível" },
              { label: "Formato", value: "NL Hold'em" },
            ].map((item) => (
              <div key={item.label} className="rounded-lg bg-secondary p-3">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="font-semibold text-foreground mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="font-display text-lg font-semibold text-foreground mb-3">Perguntas Frequentes</h2>
          <Accordion type="single" collapsible className="rounded-xl border border-border bg-card overflow-hidden">
            {faqItems.map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border-border">
                <AccordionTrigger className="px-4 py-3 text-sm font-medium text-foreground hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-3 text-sm text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>

      <BlindStructureEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        configId={configId}
        initialStructure={blindStructure}
        initialLateRegistrationEndIndex={lateRegistrationEndIndex}
      />
    </div>
  );
}
