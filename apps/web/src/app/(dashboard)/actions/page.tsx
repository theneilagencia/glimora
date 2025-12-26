"use client";

import { useState } from "react";
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
  X
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

const actions = [
  {
    id: "1",
    title: "Enviar mensagem de follow-up",
    description: "Aproveitar o post recente sobre IA para iniciar conversa",
    type: "OUTREACH",
    status: "PENDING",
    priority: 1,
    account: "TechCorp Brasil",
    decisor: "João Silva",
    signal: "Post sobre transformação digital",
    suggestedMessage: "Olá João, vi seu post sobre transformação digital e achei muito interessante. Na [Empresa], temos trabalhado em soluções similares...",
    checklist: [
      { item: "Personalizar mensagem", completed: false },
      { item: "Verificar perfil do decisor", completed: true },
      { item: "Preparar material de apoio", completed: false },
    ],
    dueDate: "Hoje",
    createdAt: "2h atrás"
  },
  {
    id: "2",
    title: "Agendar reunião de apresentação",
    description: "Decisor demonstrou interesse em conhecer mais sobre a solução",
    type: "MEETING_REQUEST",
    status: "IN_PROGRESS",
    priority: 1,
    account: "Inovação SA",
    decisor: "Maria Santos",
    signal: "Engajamento com conteúdo",
    suggestedMessage: "Maria, seria ótimo agendar uma conversa rápida para apresentar como podemos ajudar...",
    checklist: [
      { item: "Enviar convite", completed: true },
      { item: "Preparar apresentação", completed: false },
      { item: "Confirmar participantes", completed: false },
    ],
    dueDate: "Amanhã",
    createdAt: "4h atrás"
  },
  {
    id: "3",
    title: "Compartilhar conteúdo de autoridade",
    description: "Usar artigo do CEO para gerar valor e engajamento",
    type: "CONTENT_SHARE",
    status: "PENDING",
    priority: 2,
    account: "Global Tech",
    decisor: "Pedro Costa",
    signal: "Interesse em tendências de mercado",
    suggestedMessage: "Pedro, achei que você poderia se interessar por este artigo do nosso CEO sobre...",
    checklist: [
      { item: "Selecionar conteúdo relevante", completed: true },
      { item: "Personalizar introdução", completed: false },
    ],
    dueDate: "Em 2 dias",
    createdAt: "1d atrás"
  },
  {
    id: "4",
    title: "Usar autoridade para abordagem",
    description: "Mencionar participação em evento do setor para credibilidade",
    type: "AUTHORITY_LEVERAGE",
    status: "PENDING",
    priority: 2,
    account: "Startup Hub",
    decisor: "Ana Oliveira",
    signal: "Oportunidade de networking",
    suggestedMessage: "Ana, após nossa participação no evento X, gostaria de compartilhar alguns insights...",
    checklist: [
      { item: "Preparar case de sucesso", completed: false },
      { item: "Identificar conexões em comum", completed: true },
    ],
    dueDate: "Em 3 dias",
    createdAt: "2d atrás"
  },
  {
    id: "5",
    title: "Criar press release",
    description: "Aproveitar oportunidade editorial identificada",
    type: "PRESS_RELEASE",
    status: "COMPLETED",
    priority: 3,
    account: null,
    decisor: null,
    signal: "Oportunidade de press release",
    suggestedMessage: null,
    checklist: [
      { item: "Definir tema", completed: true },
      { item: "Redigir conteúdo", completed: true },
      { item: "Revisar com marketing", completed: true },
    ],
    dueDate: "Concluído",
    createdAt: "3d atrás"
  },
];

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
  COMPLETED: "Concluída",
  SKIPPED: "Ignorada",
};

export default function ActionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedAction, setSelectedAction] = useState<typeof actions[0] | null>(null);

  const filteredActions = actions.filter(action => {
    const matchesSearch = action.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      action.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (action.account?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesStatus = statusFilter === "all" || action.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = actions.filter(a => a.status === "PENDING").length;
  const inProgressCount = actions.filter(a => a.status === "IN_PROGRESS").length;
  const completedCount = actions.filter(a => a.status === "COMPLETED").length;

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
                              {typeLabels[action.type]}
                            </Badge>
                            <Badge variant="outline" className={statusColors[action.status]}>
                              {statusLabels[action.status]}
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-white mt-2">{action.title}</h3>
                          <p className="text-sm text-slate-400 mt-1">{action.description}</p>
                          <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                            {action.account && (
                              <span className="text-blue-400">{action.account}</span>
                            )}
                            {action.decisor && (
                              <span>• {action.decisor}</span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {action.dueDate}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {action.status === "PENDING" && (
                            <>
                              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                Executar
                              </Button>
                              <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white">
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {action.status === "IN_PROGRESS" && (
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
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

      <Dialog open={!!selectedAction} onOpenChange={() => setSelectedAction(null)}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">{selectedAction?.title}</DialogTitle>
          </DialogHeader>
          {selectedAction && (
            <div className="space-y-4 mt-4">
              <div>
                <p className="text-sm text-slate-400">{selectedAction.description}</p>
                {selectedAction.signal && (
                  <p className="text-xs text-blue-400 mt-2">
                    Baseado no sinal: {selectedAction.signal}
                  </p>
                )}
              </div>

              {selectedAction.suggestedMessage && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-white">Mensagem Sugerida</h4>
                  <div className="p-3 rounded-lg bg-slate-700/50 text-sm text-slate-300">
                    {selectedAction.suggestedMessage}
                  </div>
                  <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
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
                    <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                      Iniciar Ação
                    </Button>
                    <Button variant="outline" className="border-slate-600 text-slate-300">
                      Ignorar
                    </Button>
                  </>
                )}
                {selectedAction.status === "IN_PROGRESS" && (
                  <Button className="flex-1 bg-green-600 hover:bg-green-700">
                    Marcar como Concluída
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
