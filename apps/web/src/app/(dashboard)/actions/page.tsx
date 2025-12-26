"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { 
  CheckSquare, 
  Search, 
  Clock,
  MessageSquare,
  Calendar,
  Share2,
  Award,
  Check,
  X,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { fetchWithAuth } from "@/lib/api";

interface Action {
  id: string;
  title: string;
  description?: string;
  type: string;
  status: string;
  priority: number;
  suggestedMessage?: string;
  checklist?: { item: string; completed: boolean }[];
  dueDate?: string;
  createdAt: string;
  account?: {
    name: string;
  };
  decisor?: {
    firstName: string;
    lastName: string;
  };
  signal?: {
    title: string;
  };
}

const typeIcons: Record<string, typeof CheckSquare> = {
  OUTREACH: MessageSquare,
  FOLLOW_UP: MessageSquare,
  CONTENT_SHARE: Share2,
  MEETING_REQUEST: Calendar,
  PRESS_RELEASE: Award,
  AUTHORITY_LEVERAGE: Award,
};

const typeLabels: Record<string, string> = {
  OUTREACH: "Abordagem",
  FOLLOW_UP: "Follow-up",
  CONTENT_SHARE: "Compartilhar Conteúdo",
  MEETING_REQUEST: "Agendar Reunião",
  PRESS_RELEASE: "Press Release",
  AUTHORITY_LEVERAGE: "Usar Autoridade",
};

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  IN_PROGRESS: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  COMPLETED: "bg-green-500/20 text-green-400 border-green-500/30",
  SKIPPED: "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

const statusLabels: Record<string, string> = {
  PENDING: "Pendente",
  IN_PROGRESS: "Em Progresso",
  COMPLETED: "Concluida",
  SKIPPED: "Ignorada",
};

function formatDueDate(dateString?: string): string {
  if (!dateString) return "Sem prazo";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return "Atrasado";
  if (diffDays === 0) return "Hoje";
  if (diffDays === 1) return "Amanha";
  return `Em ${diffDays} dias`;
}

export default function ActionsPage() {
  const { getToken } = useAuth();
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);

  const fetchActions = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;
      const data = await fetchWithAuth<Action[]>("/actions", token);
      setActions(data);
    } catch (error) {
      console.error("Error fetching actions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const token = await getToken();
      if (!token) return;
      await fetchWithAuth(`/actions/${id}/status`, token, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      await fetchActions();
      setSelectedAction(null);
    } catch (error) {
      console.error("Error updating action status:", error);
    }
  };

  const filteredActions = actions.filter(action => {
    const matchesSearch = action.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (action.description?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (action.account?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesStatus = statusFilter === "all" || action.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = actions.filter(a => a.status === "PENDING").length;
  const inProgressCount = actions.filter(a => a.status === "IN_PROGRESS").length;
  const completedCount = actions.filter(a => a.status === "COMPLETED").length;

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
          <h1 className="text-2xl font-bold text-white">Action Layer</h1>
          <p className="text-slate-400 text-sm mt-1">Sugestões de ação baseadas em sinais</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
            placeholder="Buscar ações..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-slate-800 border-slate-700 text-white">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="all" className="text-white">Todos os status</SelectItem>
            <SelectItem value="PENDING" className="text-white">Pendente</SelectItem>
            <SelectItem value="IN_PROGRESS" className="text-white">Em Progresso</SelectItem>
            <SelectItem value="COMPLETED" className="text-white">Concluída</SelectItem>
            <SelectItem value="SKIPPED" className="text-white">Ignorada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-yellow-500/10 border-yellow-500/30">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-400">{pendingCount}</p>
            <p className="text-xs text-slate-400 mt-1">Pendentes</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-400">{inProgressCount}</p>
            <p className="text-xs text-slate-400 mt-1">Em Progresso</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{completedCount}</p>
            <p className="text-xs text-slate-400 mt-1">Concluídas</p>
          </CardContent>
        </Card>
      </div>

      {filteredActions.length === 0 ? (
        <div className="text-center py-12">
          <CheckSquare className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Nenhuma acao encontrada</h3>
          <p className="text-slate-400 text-sm">
            {searchQuery || statusFilter !== "all" 
              ? "Tente ajustar os filtros" 
              : "As acoes aparecerao aqui quando forem geradas a partir de sinais"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredActions.map((action, index) => {
            const TypeIcon = typeIcons[action.type] || CheckSquare;
            return (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card 
                  className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedAction(action)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm">
                        {action.priority}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <TypeIcon className="h-4 w-4 text-slate-400" />
                              <Badge variant="secondary" className="bg-slate-700 text-xs">
                                {typeLabels[action.type] || action.type}
                              </Badge>
                              <Badge variant="outline" className={statusColors[action.status] || "border-slate-500 text-slate-400"}>
                                {statusLabels[action.status] || action.status}
                              </Badge>
                            </div>
                            <h3 className="font-semibold text-white mt-2">{action.title}</h3>
                            {action.description && (
                              <p className="text-sm text-slate-400 mt-1">{action.description}</p>
                            )}
                            <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                              {action.account?.name && (
                                <span className="text-blue-400">{action.account.name}</span>
                              )}
                              {action.decisor && (
                                <span>- {action.decisor.firstName} {action.decisor.lastName}</span>
                              )}
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDueDate(action.dueDate)}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {action.status === "PENDING" && (
                              <>
                                <Button 
                                  size="sm" 
                                  className="bg-blue-600 hover:bg-blue-700"
                                  onClick={(e) => { e.stopPropagation(); handleUpdateStatus(action.id, "IN_PROGRESS"); }}
                                >
                                  Executar
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="text-slate-400 hover:text-white"
                                  onClick={(e) => { e.stopPropagation(); handleUpdateStatus(action.id, "SKIPPED"); }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            {action.status === "IN_PROGRESS" && (
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700"
                                onClick={(e) => { e.stopPropagation(); handleUpdateStatus(action.id, "COMPLETED"); }}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Concluir
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <Dialog open={!!selectedAction} onOpenChange={() => setSelectedAction(null)}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">{selectedAction?.title}</DialogTitle>
          </DialogHeader>
          {selectedAction && (
            <div className="space-y-4 mt-4">
              <div>
                {selectedAction.description && (
                  <p className="text-sm text-slate-400">{selectedAction.description}</p>
                )}
                {selectedAction.signal?.title && (
                  <p className="text-xs text-blue-400 mt-2">
                    Baseado no sinal: {selectedAction.signal.title}
                  </p>
                )}
              </div>

              {selectedAction.suggestedMessage && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-white">Mensagem Sugerida</h4>
                  <div className="p-3 rounded-lg bg-slate-700/50 text-sm text-slate-300">
                    {selectedAction.suggestedMessage}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-slate-600 text-slate-300"
                    onClick={() => navigator.clipboard.writeText(selectedAction.suggestedMessage || "")}
                  >
                    Copiar Mensagem
                  </Button>
                </div>
              )}

              {selectedAction.checklist && selectedAction.checklist.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-white">Checklist</h4>
                  <div className="space-y-2">
                    {selectedAction.checklist.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                          item.completed 
                            ? "bg-green-600 border-green-600" 
                            : "border-slate-600"
                        }`}>
                          {item.completed && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <span className={`text-sm ${item.completed ? "text-slate-500 line-through" : "text-slate-300"}`}>
                          {item.item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                {selectedAction.status === "PENDING" && (
                  <>
                    <Button 
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      onClick={() => handleUpdateStatus(selectedAction.id, "IN_PROGRESS")}
                    >
                      Iniciar Acao
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-slate-600 text-slate-300"
                      onClick={() => handleUpdateStatus(selectedAction.id, "SKIPPED")}
                    >
                      Ignorar
                    </Button>
                  </>
                )}
                {selectedAction.status === "IN_PROGRESS" && (
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleUpdateStatus(selectedAction.id, "COMPLETED")}
                  >
                    Marcar como Concluida
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
