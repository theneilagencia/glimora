"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  CreditCard, 
  Check,
  Zap,
  Building2,
  Crown,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: 49,
    priceId: "price_starter_monthly",
    description: "Para equipes pequenas começando com inteligência comercial",
    features: [
      "Até 10 contas monitoradas",
      "Sinais básicos de LinkedIn",
      "Score de oportunidade",
      "Suporte por email",
      "1 usuário",
    ],
    icon: Zap,
    popular: false,
  },
  {
    id: "professional",
    name: "Professional",
    price: 149,
    priceId: "price_professional_monthly",
    description: "Para equipes em crescimento que precisam de mais recursos",
    features: [
      "Até 50 contas monitoradas",
      "Sinais avançados de LinkedIn e mídia",
      "Score de oportunidade avançado",
      "Sugestões de ação com IA",
      "Press releases (3 templates)",
      "Suporte prioritário",
      "Até 5 usuários",
    ],
    icon: Building2,
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 399,
    priceId: "price_enterprise_monthly",
    description: "Para grandes equipes com necessidades avançadas",
    features: [
      "Contas ilimitadas",
      "Todos os tipos de sinais",
      "Authority Engine completo",
      "Press releases ilimitados",
      "Integrações customizadas",
      "API access",
      "Suporte dedicado",
      "Usuários ilimitados",
    ],
    icon: Crown,
    popular: false,
  },
];

const currentSubscription = {
  plan: "professional",
  status: "TRIAL",
  trialEndsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
};

export default function BillingPage() {
  const [, setSelectedPlan] = useState<string | null>(null);

  const daysRemaining = Math.ceil(
    (currentSubscription.trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Billing</h1>
        <p className="text-slate-400 text-sm mt-1">Gerencie sua assinatura e pagamentos</p>
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
                    Trial Ativo
                  </Badge>
                  <span className="text-blue-100 text-sm">
                    {daysRemaining} dias restantes
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white mt-2">
                  Plano Professional
                </h2>
                <p className="text-blue-100 text-sm mt-1">
                  Seu trial termina em {currentSubscription.trialEndsAt.toLocaleDateString("pt-BR")}
                </p>
              </div>
              <Button className="bg-white text-blue-600 hover:bg-slate-100">
                <CreditCard className="h-4 w-4 mr-2" />
                Adicionar Método de Pagamento
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Escolha seu Plano</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card 
                className={`bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-all cursor-pointer h-full ${
                  plan.popular ? "ring-2 ring-blue-500" : ""
                } ${currentSubscription.plan === plan.id ? "border-green-500" : ""}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                <CardHeader className="pb-4">
                  {plan.popular && (
                    <Badge className="w-fit bg-blue-600 text-white mb-2">
                      Mais Popular
                    </Badge>
                  )}
                  {currentSubscription.plan === plan.id && (
                    <Badge className="w-fit bg-green-600 text-white mb-2">
                      Plano Atual
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
                    <span className="text-slate-400">/mês</span>
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
                  <Button 
                    className={`w-full mt-6 ${
                      currentSubscription.plan === plan.id 
                        ? "bg-green-600 hover:bg-green-700" 
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {currentSubscription.plan === plan.id ? (
                      "Plano Atual"
                    ) : (
                      <>
                        Selecionar Plano
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
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
            <CardTitle className="text-lg text-white">Histórico de Pagamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-slate-400">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum pagamento realizado ainda</p>
              <p className="text-sm mt-1">Seu histórico de pagamentos aparecerá aqui</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg text-white">Método de Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-slate-400">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum método de pagamento cadastrado</p>
              <p className="text-sm mt-1">Adicione um cartão para continuar após o trial</p>
              <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                Adicionar Cartão
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="text-center text-sm text-slate-500">
        <p>Pagamentos processados de forma segura pelo Stripe</p>
        <p className="mt-1">Cancele a qualquer momento sem compromisso</p>
      </div>
    </div>
  );
}
