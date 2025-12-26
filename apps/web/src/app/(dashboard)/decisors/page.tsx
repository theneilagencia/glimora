"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { 
  Plus, 
  Search, 
  Filter,
  MoreVertical,
  Linkedin,
  Mail,
  Phone,
  Loader2,
  Users
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { fetchWithAuth } from "@/lib/api";

interface Decisor {
  id: string;
  firstName: string;
  lastName: string;
  title?: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  influence: number;
  engagementScore: number;
  lastActivityAt?: string;
  account?: {
    name: string;
  };
  _count?: {
    signals: number;
  };
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-400";
  if (score >= 60) return "text-yellow-400";
  if (score >= 40) return "text-orange-400";
  return "text-red-400";
}

function getScoreBgColor(score: number): string {
  if (score >= 80) return "bg-green-500/20";
  if (score >= 60) return "bg-yellow-500/20";
  if (score >= 40) return "bg-orange-500/20";
  return "bg-red-500/20";
}

function formatTimeAgo(dateString?: string): string {
  if (!dateString) return "Sem atividade";
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

export default function DecisorsPage() {
  const { getToken } = useAuth();
  const [decisors, setDecisors] = useState<Decisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    title: "",
    email: "",
    linkedinUrl: "",
  });

  const fetchDecisors = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      if (!token) {
        setError("Nao autenticado");
        return;
      }
      const data = await fetchWithAuth<Decisor[]>("/decisors", token);
      setDecisors(data);
    } catch (err) {
      setError("Erro ao carregar decisores");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDecisors();
  }, []);

  const handleSubmit = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError("Nome e sobrenome sao obrigatorios");
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      const token = await getToken();
      if (!token) {
        setError("Nao autenticado");
        return;
      }
      
      await fetchWithAuth<Decisor>("/decisors", token, {
        method: "POST",
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          title: formData.title || undefined,
          email: formData.email || undefined,
          linkedinUrl: formData.linkedinUrl || undefined,
        }),
      });
      
      setFormData({ firstName: "", lastName: "", title: "", email: "", linkedinUrl: "" });
      setIsDialogOpen(false);
      await fetchDecisors();
    } catch (err) {
      setError("Erro ao salvar decisor. Verifique se voce tem permissao.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = await getToken();
      if (!token) return;
      
      await fetchWithAuth(`/decisors/${id}`, token, {
        method: "DELETE",
      });
      
      await fetchDecisors();
    } catch (err) {
      setError("Erro ao remover decisor");
      console.error(err);
    }
  };

  const filteredDecisors = decisors.filter(decisor =>
    `${decisor.firstName} ${decisor.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (decisor.title?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (decisor.account?.name?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

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
          <h1 className="text-2xl font-bold text-white">Deal Intelligence</h1>
          <p className="text-slate-400 text-sm mt-1">Decisores priorizados por engajamento</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Novo Decisor
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Adicionar Novo Decisor</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Nome *</Label>
                  <Input 
                    className="bg-slate-700 border-slate-600 text-white" 
                    placeholder="Joao"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Sobrenome *</Label>
                  <Input 
                    className="bg-slate-700 border-slate-600 text-white" 
                    placeholder="Silva"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Cargo</Label>
                <Input 
                  className="bg-slate-700 border-slate-600 text-white" 
                  placeholder="CEO"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Email</Label>
                <Input 
                  className="bg-slate-700 border-slate-600 text-white" 
                  placeholder="email@empresa.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">LinkedIn URL</Label>
                <Input 
                  className="bg-slate-700 border-slate-600 text-white" 
                  placeholder="https://linkedin.com/in/"
                  value={formData.linkedinUrl}
                  onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                />
              </div>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700" 
                onClick={handleSubmit}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Adicionar Decisor"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-400">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
            placeholder="Buscar decisores..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
          <Filter className="h-4 w-4 mr-2" />
          Filtros
        </Button>
      </div>

      {filteredDecisors.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Nenhum decisor encontrado</h3>
          <p className="text-slate-400 text-sm">
            {searchQuery ? "Tente uma busca diferente" : "Adicione seu primeiro decisor para comecar"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDecisors.map((decisor, index) => (
            <motion.div
              key={decisor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                        {decisor.firstName.charAt(0)}{decisor.lastName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">
                          {decisor.firstName} {decisor.lastName}
                        </h3>
                        <p className="text-xs text-slate-400">{decisor.title || "Sem cargo"}</p>
                        <p className="text-xs text-blue-400">{decisor.account?.name || "Sem conta"}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-slate-800 border-slate-700">
                        <DropdownMenuItem className="text-slate-300 hover:text-white focus:text-white focus:bg-slate-700">
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-slate-300 hover:text-white focus:text-white focus:bg-slate-700">
                          Ver Sinais
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-slate-300 hover:text-white focus:text-white focus:bg-slate-700">
                          Criar Acao
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-400 hover:text-red-300 focus:text-red-300 focus:bg-slate-700"
                          onClick={() => handleDelete(decisor.id)}
                        >
                          Remover
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className={`p-2 rounded-lg ${getScoreBgColor(decisor.influence || 0)}`}>
                      <p className="text-xs text-slate-400">Influencia</p>
                      <p className={`text-lg font-bold ${getScoreColor(decisor.influence || 0)}`}>
                        {decisor.influence || 0}
                      </p>
                    </div>
                    <div className={`p-2 rounded-lg ${getScoreBgColor(decisor.engagementScore || 0)}`}>
                      <p className="text-xs text-slate-400">Engajamento</p>
                      <p className={`text-lg font-bold ${getScoreColor(decisor.engagementScore || 0)}`}>
                        {decisor.engagementScore || 0}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {decisor.linkedinUrl && (
                        <a
                          href={decisor.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-slate-700 text-slate-400 hover:text-blue-400 transition-colors"
                        >
                          <Linkedin className="h-4 w-4" />
                        </a>
                      )}
                      {decisor.email && (
                        <a
                          href={`mailto:${decisor.email}`}
                          className="p-1.5 rounded-lg bg-slate-700 text-slate-400 hover:text-blue-400 transition-colors"
                        >
                          <Mail className="h-4 w-4" />
                        </a>
                      )}
                      {decisor.phone && (
                        <a
                          href={`tel:${decisor.phone}`}
                          className="p-1.5 rounded-lg bg-slate-700 text-slate-400 hover:text-blue-400 transition-colors"
                        >
                          <Phone className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">{formatTimeAgo(decisor.lastActivityAt)}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
