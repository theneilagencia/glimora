"use client";

import { motion } from "framer-motion";
import { 
  Building2, 
  Users, 
  Zap, 
  CheckSquare, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const stats = [
  { 
    name: "Contas Monitoradas", 
    value: "24", 
    change: "+12%", 
    trend: "up",
    icon: Building2,
    href: "/accounts"
  },
  { 
    name: "Decisores Ativos", 
    value: "89", 
    change: "+8%", 
    trend: "up",
    icon: Users,
    href: "/decisors"
  },
  { 
    name: "Sinais Esta Semana", 
    value: "156", 
    change: "+23%", 
    trend: "up",
    icon: Zap,
    href: "/signals"
  },
  { 
    name: "Ações Pendentes", 
    value: "12", 
    change: "-5%", 
    trend: "down",
    icon: CheckSquare,
    href: "/actions"
  },
];

const recentSignals = [
  {
    id: "1",
    title: "Post no LinkedIn sobre IA",
    account: "TechCorp Brasil",
    type: "LINKEDIN_POST",
    strength: "HIGH",
    score: 85,
    time: "2h atrás"
  },
  {
    id: "2",
    title: "Menção em artigo da Forbes",
    account: "Inovação SA",
    type: "MEDIA_MENTION",
    strength: "CRITICAL",
    score: 95,
    time: "4h atrás"
  },
  {
    id: "3",
    title: "Atualização de perfil",
    account: "Global Tech",
    type: "LINKEDIN_PROFILE_UPDATE",
    strength: "MEDIUM",
    score: 65,
    time: "6h atrás"
  },
];

const pendingActions = [
  {
    id: "1",
    title: "Enviar mensagem de follow-up",
    account: "TechCorp Brasil",
    decisor: "João Silva",
    priority: 1,
    dueDate: "Hoje"
  },
  {
    id: "2",
    title: "Agendar reunião",
    account: "Inovação SA",
    decisor: "Maria Santos",
    priority: 2,
    dueDate: "Amanhã"
  },
  {
    id: "3",
    title: "Compartilhar conteúdo de autoridade",
    account: "Global Tech",
    decisor: "Pedro Costa",
    priority: 3,
    dueDate: "Em 2 dias"
  },
];

const strengthColors: Record<string, string> = {
  LOW: "bg-slate-500",
  MEDIUM: "bg-yellow-500",
  HIGH: "bg-orange-500",
  CRITICAL: "bg-red-500",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Visão geral da sua inteligência comercial</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Zap className="h-4 w-4 mr-2" />
          Coletar Sinais
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Link href={stat.href}>
              <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <stat.icon className="h-5 w-5 text-slate-400" />
                    <div className={`flex items-center text-xs ${stat.trend === "up" ? "text-green-400" : "text-red-400"}`}>
                      {stat.trend === "up" ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      {stat.change}
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-slate-400 mt-1">{stat.name}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-white">Sinais Recentes</CardTitle>
                <Link href="/signals">
                  <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                    Ver todos
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentSignals.map((signal) => (
                <div
                  key={signal.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors"
                >
                  <div className={`w-2 h-2 rounded-full mt-2 ${strengthColors[signal.strength]}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{signal.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{signal.account}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs bg-slate-600">
                        Score: {signal.score}
                      </Badge>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {signal.time}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-white">Ações Pendentes</CardTitle>
                <Link href="/actions">
                  <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                    Ver todas
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingActions.map((action) => (
                <div
                  key={action.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">
                    {action.priority}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{action.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {action.decisor} • {action.account}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
                        {action.dueDate}
                      </Badge>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300">
                    Executar
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.6 }}
      >
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-400" />
              Performance Semanal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-slate-700/30">
                <p className="text-2xl font-bold text-green-400">+45%</p>
                <p className="text-xs text-slate-400 mt-1">Taxa de Resposta</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-slate-700/30">
                <p className="text-2xl font-bold text-blue-400">23</p>
                <p className="text-xs text-slate-400 mt-1">Reuniões Agendadas</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-slate-700/30">
                <p className="text-2xl font-bold text-purple-400">8</p>
                <p className="text-xs text-slate-400 mt-1">Press Releases</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-slate-700/30">
                <p className="text-2xl font-bold text-orange-400">156</p>
                <p className="text-xs text-slate-400 mt-1">Sinais Processados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
