"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { 
  Building2, 
  Users, 
  Zap, 
  CheckSquare, 
  TrendingUp,
  Clock,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { fetchWithAuth } from "@/lib/api";

interface Signal {
  id: string;
  title: string;
  type: string;
  strength: string;
  score: number;
  createdAt: string;
  account?: {
    name: string;
  };
}

interface Action {
  id: string;
  title: string;
  priority: number;
  dueDate?: string;
  account?: {
    name: string;
  };
  decisor?: {
    firstName: string;
    lastName: string;
  };
}

const strengthColors: Record<string, string> = {
  LOW: "bg-slate-500",
  MEDIUM: "bg-yellow-500",
  HIGH: "bg-orange-500",
  CRITICAL: "bg-red-500",
};

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffHours < 1) return "Agora";
  if (diffHours < 24) return `${diffHours}h atras`;
  if (diffDays === 1) return "1d atras";
  return `${diffDays}d atras`;
}

export default function DashboardPage() {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [accountsCount, setAccountsCount] = useState(0);
  const [decisorsCount, setDecisorsCount] = useState(0);
  const [signalsCount, setSignalsCount] = useState(0);
  const [actionsCount, setActionsCount] = useState(0);
  const [recentSignals, setRecentSignals] = useState<Signal[]>([]);
  const [pendingActions, setPendingActions] = useState<Action[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = await getToken();
        if (!token) return;

        const [accountsData, decisorsData, signalsData, actionsData] = await Promise.all([
          fetchWithAuth<unknown[]>("/accounts", token).catch(() => []),
          fetchWithAuth<unknown[]>("/decisors", token).catch(() => []),
          fetchWithAuth<Signal[]>("/signals?limit=5", token).catch(() => []),
          fetchWithAuth<Action[]>("/actions?status=PENDING&limit=5", token).catch(() => []),
        ]);

        setAccountsCount(Array.isArray(accountsData) ? accountsData.length : 0);
        setDecisorsCount(Array.isArray(decisorsData) ? decisorsData.length : 0);
        setSignalsCount(Array.isArray(signalsData) ? signalsData.length : 0);
        setActionsCount(Array.isArray(actionsData) ? actionsData.length : 0);
        setRecentSignals(Array.isArray(signalsData) ? signalsData : []);
        setPendingActions(Array.isArray(actionsData) ? actionsData : []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [getToken]);

  const statCards = [
    { name: "Contas Monitoradas", value: accountsCount, icon: Building2, href: "/accounts" },
    { name: "Decisores Ativos", value: decisorsCount, icon: Users, href: "/decisors" },
    { name: "Sinais", value: signalsCount, icon: Zap, href: "/signals" },
    { name: "Acoes Pendentes", value: actionsCount, icon: CheckSquare, href: "/actions" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

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
        {statCards.map((stat, index) => (
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
              {recentSignals.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhum sinal recente</p>
                </div>
              ) : (
                recentSignals.map((signal) => (
                  <div
                    key={signal.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors"
                  >
                    <div className={`w-2 h-2 rounded-full mt-2 ${strengthColors[signal.strength] || "bg-slate-500"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{signal.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{signal.account?.name || "Sem conta"}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs bg-slate-600">
                          Score: {signal.score}
                        </Badge>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimeAgo(signal.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
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
              {pendingActions.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <CheckSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhuma acao pendente</p>
                </div>
              ) : (
                pendingActions.map((action) => (
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
                        {action.decisor ? `${action.decisor.firstName} ${action.decisor.lastName}` : ""}
                        {action.decisor && action.account ? " - " : ""}
                        {action.account?.name || ""}
                      </p>
                      {action.dueDate && (
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
                            {new Date(action.dueDate).toLocaleDateString("pt-BR")}
                          </Badge>
                        </div>
                      )}
                    </div>
                    <Link href="/actions">
                      <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300">
                        Executar
                      </Button>
                    </Link>
                  </div>
                ))
              )}
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
                <p className="text-2xl font-bold text-blue-400">{accountsCount}</p>
                <p className="text-xs text-slate-400 mt-1">Contas</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-slate-700/30">
                <p className="text-2xl font-bold text-green-400">{decisorsCount}</p>
                <p className="text-xs text-slate-400 mt-1">Decisores</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-slate-700/30">
                <p className="text-2xl font-bold text-purple-400">{signalsCount}</p>
                <p className="text-xs text-slate-400 mt-1">Sinais</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-slate-700/30">
                <p className="text-2xl font-bold text-orange-400">{actionsCount}</p>
                <p className="text-xs text-slate-400 mt-1">Acoes Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
