"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { 
  Building2, 
  Plus, 
  Search, 
  Filter,
  MoreVertical,
  ExternalLink,
  TrendingUp,
  Users,
  Loader2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import Link from "next/link";
import { fetchWithAuth } from "@/lib/api";

interface Account {
  id: string;
  name: string;
  industry?: string;
  website?: string;
  linkedinUrl?: string;
  signalScore: number;
  priority: number;
  lastSignalAt?: string;
  _count?: {
    decisors: number;
    signals: number;
    actions: number;
  };
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-400";
  if (score >= 60) return "text-yellow-400";
  if (score >= 40) return "text-orange-400";
  return "text-red-400";
}

function getPriorityBadge(priority: number) {
  const colors: Record<number, string> = {
    1: "bg-red-500/20 text-red-400 border-red-500/30",
    2: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    3: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  };
  return colors[priority] || colors[3];
}

function formatTimeAgo(dateString?: string): string {
  if (!dateString) return "Sem sinais";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffHours < 1) return "Agora";
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays === 1) return "1d atrás";
  return `${diffDays}d atrás`;
}

export default function AccountsPage() {
  const { getToken } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    website: "",
    linkedinUrl: "",
  });

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      if (!token) {
        setError("Não autenticado");
        return;
      }
      const data = await fetchWithAuth<Account[]>("/accounts", token);
      setAccounts(data);
    } catch (err) {
      setError("Erro ao carregar contas");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError("Nome da empresa é obrigatório");
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      const token = await getToken();
      if (!token) {
        setError("Não autenticado");
        return;
      }
      
      await fetchWithAuth<Account>("/accounts", token, {
        method: "POST",
        body: JSON.stringify({
          name: formData.name,
          industry: formData.industry || undefined,
          website: formData.website || undefined,
          linkedinUrl: formData.linkedinUrl || undefined,
        }),
      });
      
      setFormData({ name: "", industry: "", website: "", linkedinUrl: "" });
      setIsDialogOpen(false);
      await fetchAccounts();
    } catch (err) {
      setError("Erro ao salvar conta. Verifique se você tem permissão.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = await getToken();
      if (!token) return;
      
      await fetchWithAuth(`/accounts/${id}`, token, {
        method: "DELETE",
      });
      
      await fetchAccounts();
    } catch (err) {
      setError("Erro ao remover conta");
      console.error(err);
    }
  };

  const filteredAccounts = accounts.filter(account =>
    account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (account.industry?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Account Radar</h1>
          <p className="text-slate-400 text-sm mt-1">Contas monitoradas por sinais sociais</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Nova Conta
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Adicionar Nova Conta</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Nome da Empresa *</Label>
                <Input 
                  className="bg-slate-700 border-slate-600 text-white" 
                  placeholder="Ex: TechCorp Brasil"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Indústria</Label>
                <Input 
                  className="bg-slate-700 border-slate-600 text-white" 
                  placeholder="Ex: Tecnologia"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Website</Label>
                <Input 
                  className="bg-slate-700 border-slate-600 text-white" 
                  placeholder="https://"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">LinkedIn URL</Label>
                <Input 
                  className="bg-slate-700 border-slate-600 text-white" 
                  placeholder="https://linkedin.com/company/"
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
                  "Adicionar Conta"
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
            placeholder="Buscar contas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
          <Filter className="h-4 w-4 mr-2" />
          Filtros
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : filteredAccounts.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Nenhuma conta encontrada</h3>
          <p className="text-slate-400 text-sm">
            {searchQuery ? "Tente uma busca diferente" : "Adicione sua primeira conta para começar"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAccounts.map((account, index) => (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <Link href={`/accounts/${account.id}`}>
                          <h3 className="font-semibold text-white hover:text-blue-400 transition-colors">
                            {account.name}
                          </h3>
                        </Link>
                        <p className="text-xs text-slate-400">{account.industry || "Sem indústria"}</p>
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
                        <DropdownMenuItem 
                          className="text-red-400 hover:text-red-300 focus:text-red-300 focus:bg-slate-700"
                          onClick={() => handleDelete(account.id)}
                        >
                          Remover
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className={`h-4 w-4 ${getScoreColor(account.signalScore || 0)}`} />
                      <span className={`text-lg font-bold ${getScoreColor(account.signalScore || 0)}`}>
                        {account.signalScore || 0}
                      </span>
                      <span className="text-xs text-slate-500">score</span>
                    </div>
                    <Badge variant="outline" className={getPriorityBadge(account.priority || 3)}>
                      P{account.priority || 3}
                    </Badge>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-700 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {account._count?.decisors || 0} decisores
                      </span>
                      <span>{account._count?.signals || 0} sinais</span>
                    </div>
                    <span>{formatTimeAgo(account.lastSignalAt)}</span>
                  </div>

                  {account.website && (
                    <a
                      href={account.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {account.website.replace(/^https?:\/\//, "")}
                    </a>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
