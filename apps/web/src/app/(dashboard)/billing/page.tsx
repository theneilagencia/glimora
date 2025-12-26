"use client";

import { motion } from "framer-motion";
import { 
  Check,
  Zap,
  Building2,
  Crown,
  Mail,
  MessageCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: 49,
    description: "Para equipes pequenas comecando com inteligencia comercial",
    features: [
      "Ate 10 contas monitoradas",
      "Sinais basicos de LinkedIn",
      "Score de oportunidade",
      "Suporte por email",
      "1 usuario",
    ],
    icon: Zap,
    popular: false,
  },
  {
    id: "professional",
    name: "Professional",
    price: 149,
    description: "Para equipes em crescimento que precisam de mais recursos",
    features: [
      "Ate 50 contas monitoradas",
      "Sinais avancados de LinkedIn e midia",
      "Score de oportunidade avancado",
      "Sugestoes de acao com IA",
      "Press releases (3 templates)",
      "Suporte prioritario",
      "Ate 5 usuarios",
    ],
    icon: Building2,
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 399,
    description: "Para grandes equipes com necessidades avancadas",
    features: [
      "Contas ilimitadas",
      "Todos os tipos de sinais",
      "Authority Engine completo",
      "Press releases ilimitados",
      "Integracoes customizadas",
      "API access",
      "Suporte dedicado",
      "Usuarios ilimitados",
    ],
    icon: Crown,
    popular: false,
  },
];

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Planos e Precos</h1>
        <p className="text-slate-400 text-sm mt-1">Conheca nossos planos e entre em contato para contratar</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-white/20 text-white border-0">
                    Contratacao Manual
                  </Badge>
                </div>
                <h2 className="text-xl font-bold text-white mt-2">
                  Entre em contato para contratar
                </h2>
                <p className="text-blue-100 text-sm mt-1">
                  Nossa equipe ira ajuda-lo a escolher o melhor plano para sua empresa
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  className="bg-white text-blue-600 hover:bg-slate-100"
                  onClick={() => window.open("mailto:contato@glimora.com.br", "_blank")}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar Email
                </Button>
                <Button 
                  className="bg-white/20 text-white hover:bg-white/30 border-0"
                  onClick={() => window.open("https://wa.me/5511999999999", "_blank")}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Nossos Planos</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card 
                className={`bg-slate-800/50 border-slate-700 h-full ${
                  plan.popular ? "ring-2 ring-blue-500" : ""
                }`}
              >
                <CardHeader className="pb-4">
                  {plan.popular && (
                    <Badge className="w-fit bg-blue-600 text-white mb-2">
                      Mais Popular
                    </Badge>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
                      <plan.icon className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-white">{plan.name}</CardTitle>
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-3xl font-bold text-white">R$ {plan.price}</span>
                    <span className="text-slate-400">/mes</span>
                  </div>
                  <p className="text-sm text-slate-400 mt-2">{plan.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg text-white">Como Contratar?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-slate-300">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-medium text-white">Escolha seu plano</h4>
                  <p className="text-sm text-slate-400">Analise as opcoes acima e escolha o plano ideal para sua empresa</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-medium text-white">Entre em contato</h4>
                  <p className="text-sm text-slate-400">Envie um email ou mensagem no WhatsApp informando o plano desejado</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-medium text-white">Ativacao</h4>
                  <p className="text-sm text-slate-400">Nossa equipe ira ativar seu plano em ate 24 horas uteis</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="text-center text-sm text-slate-500">
        <p>Duvidas? Entre em contato: contato@glimora.com.br</p>
      </div>
    </div>
  );
}
