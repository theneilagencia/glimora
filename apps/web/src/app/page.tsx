"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Users, Zap, FileText } from "lucide-react";

export default function Home() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-slate-700">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg" />
            <span className="text-xl font-bold text-white">Glimora</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-slate-300 hover:text-white" onClick={() => router.push("/sign-in")}>
              Entrar
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => router.push("/sign-up")}>
              Começar Grátis
            </Button>
          </div>
        </div>
      </header>

      <main className="pt-16">
        <section className="container mx-auto px-4 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              A nova camada das{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                vendas B2B
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
              Chega de automação cega, comece a vender com inteligência. Decida com base em sinais reais, posicione sua marca como referência no setor e transforme autoridade executiva em receita, com precisão estratégica e timing editorial.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8" onClick={() => router.push("/sign-up")}>
                Começar Trial Grátis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 text-lg px-8">
                Ver Demo
              </Button>
            </div>
          </motion.div>
        </section>

        <section className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: BarChart3,
                title: "Account Radar",
                description: "Monitore contas por sinais sociais e identifique oportunidades em tempo real.",
              },
              {
                icon: Users,
                title: "Deal Intelligence",
                description: "Lista priorizada de decisores com score de engajamento e influência.",
              },
              {
                icon: Zap,
                title: "Action Layer",
                description: "Sugestões de ação com mensagens prontas e checklists de follow-up.",
              },
              {
                icon: FileText,
                title: "Press Generator",
                description: "Gere press releases baseados em sinais e autoridade do CEO.",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-blue-500/50 transition-colors"
              >
                <feature.icon className="h-10 w-10 text-blue-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 py-16">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Pronto para transformar sua estratégia comercial?
            </h2>
            <p className="text-blue-100 mb-6 max-w-xl mx-auto">
              Comece seu trial gratuito de 7 dias e descubra como a inteligência de autoridade pode impulsionar suas vendas.
            </p>
            <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100 text-lg px-8" onClick={() => router.push("/sign-up")}>
              Começar Agora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-700 py-8">
        <div className="container mx-auto px-4 text-center text-slate-400">
          <p>&copy; 2024 Glimora. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
