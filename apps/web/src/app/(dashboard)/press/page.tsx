"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { 
  Plus, 
  Search, 
  Copy,
  Eye,
  Sparkles,
  Loader2,
  Newspaper
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchWithAuth } from "@/lib/api";

interface PressRelease {
  id: string;
  title: string;
  content?: string;
  templateType: string;
  status: string;
  createdAt: string;
}

const templateTypes = {
  PRODUCT_LAUNCH: { label: "Lançamento de Produto", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  PARTNERSHIP: { label: "Parceria", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  THOUGHT_LEADERSHIP: { label: "Thought Leadership", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
};

const statusColors: Record<string, string> = {
  DRAFT: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  PUBLISHED: "bg-green-500/20 text-green-400 border-green-500/30",
};

export default function PressPage() {
  const { getToken } = useAuth();
  const [pressReleases, setPressReleases] = useState<PressRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedPress, setSelectedPress] = useState<PressRelease | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [formData, setFormData] = useState({
    title: "",
    context: "",
    keyPoints: "",
  });

  const fetchPressReleases = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;
      const data = await fetchWithAuth<PressRelease[]>("/press", token);
      setPressReleases(data);
    } catch (error) {
      console.error("Error fetching press releases:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPressReleases();
  }, []);

  const handleSubmit = async () => {
    if (!formData.title.trim() || !selectedTemplate) return;
    
    try {
      setSaving(true);
      const token = await getToken();
      if (!token) return;
      
      await fetchWithAuth<PressRelease>("/press", token, {
        method: "POST",
        body: JSON.stringify({
          title: formData.title,
          templateType: selectedTemplate,
          content: formData.context + (formData.keyPoints ? "\n\nPontos-chave:\n" + formData.keyPoints : ""),
        }),
      });
      
      setFormData({ title: "", context: "", keyPoints: "" });
      setSelectedTemplate("");
      setIsCreateDialogOpen(false);
      await fetchPressReleases();
    } catch (error) {
      console.error("Error saving press release:", error);
    } finally {
      setSaving(false);
    }
  };

  const filteredReleases = pressReleases.filter(release =>
    release.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (release.content?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const publishedCount = pressReleases.filter(p => p.status === "PUBLISHED").length;
  const draftCount = pressReleases.filter(p => p.status === "DRAFT").length;

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
          <h1 className="text-2xl font-bold text-white">Press Signal Engine</h1>
          <p className="text-slate-400 text-sm mt-1">Gerador de press releases baseado em sinais</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Gerar Press Release
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Gerar Novo Press Release</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Template *</Label>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Selecione um template" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="PRODUCT_LAUNCH" className="text-white">
                      Lancamento de Produto
                    </SelectItem>
                    <SelectItem value="PARTNERSHIP" className="text-white">
                      Parceria Estrategica
                    </SelectItem>
                    <SelectItem value="THOUGHT_LEADERSHIP" className="text-white">
                      Thought Leadership
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Titulo *</Label>
                <Input 
                  className="bg-slate-700 border-slate-600 text-white" 
                  placeholder="Titulo do press release"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Contexto / Sinal Base</Label>
                <Textarea 
                  className="bg-slate-700 border-slate-600 text-white min-h-24" 
                  placeholder="Descreva o contexto ou sinal que motivou este press release..."
                  value={formData.context}
                  onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Pontos-chave (um por linha)</Label>
                <Textarea 
                  className="bg-slate-700 border-slate-600 text-white min-h-24" 
                  placeholder="- Ponto 1&#10;- Ponto 2&#10;- Ponto 3"
                  value={formData.keyPoints}
                  onChange={(e) => setFormData({ ...formData, keyPoints: e.target.value })}
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
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Gerar Press Release
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-white">{pressReleases.length}</p>
            <p className="text-xs text-slate-400 mt-1">Total</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{publishedCount}</p>
            <p className="text-xs text-slate-400 mt-1">Publicados</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-400">{draftCount}</p>
            <p className="text-xs text-slate-400 mt-1">Rascunhos</p>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
          placeholder="Buscar press releases..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredReleases.length === 0 ? (
        <div className="text-center py-12">
          <Newspaper className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Nenhum press release encontrado</h3>
          <p className="text-slate-400 text-sm">
            {searchQuery 
              ? "Tente ajustar a busca" 
              : "Gere seu primeiro press release clicando no botao acima"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReleases.map((release, index) => {
            const templateInfo = templateTypes[release.templateType as keyof typeof templateTypes] || { label: release.templateType, color: "bg-slate-500/20 text-slate-400 border-slate-500/30" };
            return (
              <motion.div
                key={release.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className={templateInfo.color}>
                            {templateInfo.label}
                          </Badge>
                          <Badge variant="outline" className={statusColors[release.status] || "border-slate-500 text-slate-400"}>
                            {release.status === "DRAFT" ? "Rascunho" : "Publicado"}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-white mt-2">{release.title}</h3>
                        {release.content && (
                          <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                            {release.content.substring(0, 200)}...
                          </p>
                        )}
                        <p className="text-xs text-slate-500 mt-2">
                          Criado em {new Date(release.createdAt).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-slate-700 text-slate-300"
                          onClick={() => setSelectedPress(release)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-slate-700 text-slate-300"
                          onClick={() => navigator.clipboard.writeText(release.content || "")}
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Copiar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <Dialog open={!!selectedPress} onOpenChange={() => setSelectedPress(null)}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">{selectedPress?.title}</DialogTitle>
          </DialogHeader>
          {selectedPress && (
            <div className="space-y-4 mt-4">
              <div className="flex items-center gap-2">
                {(() => {
                  const templateInfo = templateTypes[selectedPress.templateType as keyof typeof templateTypes] || { label: selectedPress.templateType, color: "bg-slate-500/20 text-slate-400 border-slate-500/30" };
                  return (
                    <Badge variant="outline" className={templateInfo.color}>
                      {templateInfo.label}
                    </Badge>
                  );
                })()}
                <Badge variant="outline" className={statusColors[selectedPress.status] || "border-slate-500 text-slate-400"}>
                  {selectedPress.status === "DRAFT" ? "Rascunho" : "Publicado"}
                </Badge>
              </div>
              <div className="p-4 rounded-lg bg-slate-700/50 text-slate-300 whitespace-pre-wrap text-sm">
                {selectedPress.content || "Sem conteudo"}
              </div>
              <div className="flex gap-2">
                <Button 
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={() => navigator.clipboard.writeText(selectedPress.content || "")}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar Texto
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
