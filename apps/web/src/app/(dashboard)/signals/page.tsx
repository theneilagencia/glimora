"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { 
  Zap, 
  Search, 
  Clock,
  TrendingUp,
  Linkedin,
  Newspaper,
  RefreshCw,
  Loader2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchWithAuth } from "@/lib/api";

interface Signal {
  id: string;
  title: string;
  content?: string;
  type: string;
  strength: string;
  score: number;
  sourceUrl?: string;
  createdAt: string;
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

const strengthLabels: Record<string, string> = {
  LOW: "Baixa",
  MEDIUM: "Média",
  HIGH: "Alta",
  CRITICAL: "Crítica",
};

const typeIcons: Record<string, typeof Zap> = {
  LINKEDIN_POST: Linkedin,
  LINKEDIN_ENGAGEMENT: Linkedin,
  LINKEDIN_PROFILE_UPDATE: Linkedin,
  MEDIA_MENTION: Newspaper,
  PRESS_OPPORTUNITY: Newspaper,
  INDUSTRY_NEWS: Newspaper,
};

const typeLabels: Record<string, string> = {
  LINKEDIN_POST: "Post LinkedIn",
  LINKEDIN_ENGAGEMENT: "Engajamento",
  LINKEDIN_PROFILE_UPDATE: "Atualização Perfil",
  MEDIA_MENTION: "Menção na Mídia",
  PRESS_OPPORTUNITY: "Oportunidade Press",
  INDUSTRY_NEWS: "Notícia do Setor",
};

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-400";
  if (score >= 60) return "text-yellow-400";
  if (score >= 40) return "text-orange-400";
  return "text-red-400";
}

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

export default function SignalsPage() {
  const { getToken } = useAuth();
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [strengthFilter, setStrengthFilter] = useState<string>("all");

  const fetchSignals = async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const data = await fetchWithAuth<Signal[]>("/signals", token);
      setSignals(data);
    } catch (error) {
      console.error("Error fetching signals:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSignals();
  }, []);

    const handleRefresh = async () => {
      setRefreshing(true);
      try {
        const token = await getToken();
        if (!token) return;
        // First, trigger signal collection
        await fetchWithAuth<{ totalCreated: number; message: string }>("/signals/sync", token, {
          method: "POST",
        });
        // Then fetch the updated signals
        await fetchSignals();
      } catch (error) {
        console.error("Error syncing signals:", error);
        setRefreshing(false);
      }
    };

  const filteredSignals = signals.filter(signal => {
    const matchesSearch = signal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (signal.content?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (signal.account?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesType = typeFilter === "all" || signal.type === typeFilter;
    const matchesStrength = strengthFilter === "all" || signal.strength === strengthFilter;
    return matchesSearch && matchesType && matchesStrength;
  });

  const criticalCount = signals.filter(s => s.strength === "CRITICAL").length;
  const highCount = signals.filter(s => s.strength === "HIGH").length;
  const avgScore = signals.length > 0 ? Math.round(signals.reduce((acc, s) => acc + s.score, 0) / signals.length) : 0;

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
          <h1 className="text-2xl font-bold text-white">Sales Signal Score</h1>
          <p className="text-slate-400 text-sm mt-1">Sinais sociais e de mídia processados</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleRefresh} disabled={refreshing}>
          {refreshing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Atualizar Sinais
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
            placeholder="Buscar sinais..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-slate-800 border-slate-700 text-white">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="all" className="text-white">Todos os tipos</SelectItem>
            <SelectItem value="LINKEDIN_POST" className="text-white">Post LinkedIn</SelectItem>
            <SelectItem value="LINKEDIN_ENGAGEMENT" className="text-white">Engajamento</SelectItem>
            <SelectItem value="MEDIA_MENTION" className="text-white">Menção na Mídia</SelectItem>
            <SelectItem value="PRESS_OPPORTUNITY" className="text-white">Oportunidade Press</SelectItem>
            <SelectItem value="INDUSTRY_NEWS" className="text-white">Notícia do Setor</SelectItem>
          </SelectContent>
        </Select>
        <Select value={strengthFilter} onValueChange={setStrengthFilter}>
          <SelectTrigger className="w-full sm:w-40 bg-slate-800 border-slate-700 text-white">
            <SelectValue placeholder="Força" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="all" className="text-white">Todas</SelectItem>
            <SelectItem value="CRITICAL" className="text-white">Crítica</SelectItem>
            <SelectItem value="HIGH" className="text-white">Alta</SelectItem>
            <SelectItem value="MEDIUM" className="text-white">Média</SelectItem>
            <SelectItem value="LOW" className="text-white">Baixa</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-white">{signals.length}</p>
            <p className="text-xs text-slate-400 mt-1">Total de Sinais</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-400">{criticalCount}</p>
            <p className="text-xs text-slate-400 mt-1">Criticos</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-orange-400">{highCount}</p>
            <p className="text-xs text-slate-400 mt-1">Alta Prioridade</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{avgScore}</p>
            <p className="text-xs text-slate-400 mt-1">Score Medio</p>
          </CardContent>
        </Card>
      </div>

      {filteredSignals.length === 0 ? (
        <div className="text-center py-12">
          <Zap className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Nenhum sinal encontrado</h3>
          <p className="text-slate-400 text-sm">
            {searchQuery || typeFilter !== "all" || strengthFilter !== "all" 
              ? "Tente ajustar os filtros" 
              : "Os sinais aparecerao aqui quando forem coletados"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSignals.map((signal, index) => {
            const TypeIcon = typeIcons[signal.type] || Zap;
            return (
              <motion.div
                key={signal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-2 h-full min-h-16 rounded-full ${strengthColors[signal.strength] || "bg-slate-500"}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <TypeIcon className="h-4 w-4 text-slate-400" />
                              <Badge variant="secondary" className="bg-slate-700 text-xs">
                                {typeLabels[signal.type] || signal.type}
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  signal.strength === "CRITICAL" ? "border-red-500 text-red-400" :
                                  signal.strength === "HIGH" ? "border-orange-500 text-orange-400" :
                                  signal.strength === "MEDIUM" ? "border-yellow-500 text-yellow-400" :
                                  "border-slate-500 text-slate-400"
                                }`}
                              >
                                {strengthLabels[signal.strength] || signal.strength}
                              </Badge>
                            </div>
                            <h3 className="font-semibold text-white mt-2">{signal.title}</h3>
                            {signal.content && (
                              <p className="text-sm text-slate-400 mt-1 line-clamp-2">{signal.content}</p>
                            )}
                            <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                              {signal.account?.name && (
                                <span className="text-blue-400">{signal.account.name}</span>
                              )}
                              {signal.decisor && (
                                <span>- {signal.decisor.firstName} {signal.decisor.lastName}</span>
                              )}
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatTimeAgo(signal.createdAt)}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${getScoreColor(signal.score)}`}>
                              {signal.score}
                            </div>
                            <p className="text-xs text-slate-500">score</p>
                          </div>
                        </div>
                        {signal.sourceUrl && (
                          <div className="mt-3 pt-3 border-t border-slate-700">
                            <a
                              href={signal.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                            >
                              <TrendingUp className="h-3 w-3" />
                              Ver fonte original
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
