"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { 
  Plus, 
  Search, 
  ExternalLink,
  Tag,
  TrendingUp,
  Calendar,
  Loader2,
  Award
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
import { fetchWithAuth } from "@/lib/api";

interface AuthorityContent {
  id: string;
  title: string;
  content?: string;
  summary?: string;
  topics: string[];
  sourceUrl?: string;
  publishedAt?: string;
  engagementCount: number;
}

export default function AuthorityPage() {
  const { getToken } = useAuth();
  const [authorityContent, setAuthorityContent] = useState<AuthorityContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    sourceUrl: "",
    topics: "",
  });

  const fetchAuthorityContent = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;
      const data = await fetchWithAuth<AuthorityContent[]>("/authority", token);
      setAuthorityContent(data);
    } catch (error) {
      console.error("Error fetching authority content:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthorityContent();
  }, []);

  const handleSubmit = async () => {
    if (!formData.title.trim()) return;
    
    try {
      setSaving(true);
      const token = await getToken();
      if (!token) return;
      
      const topics = formData.topics.split(",").map(t => t.trim()).filter(t => t);
      
      await fetchWithAuth<AuthorityContent>("/authority", token, {
        method: "POST",
        body: JSON.stringify({
          title: formData.title,
          content: formData.content || undefined,
          sourceUrl: formData.sourceUrl || undefined,
          topics: topics.length > 0 ? topics : ["Geral"],
        }),
      });
      
      setFormData({ title: "", content: "", sourceUrl: "", topics: "" });
      setIsDialogOpen(false);
      await fetchAuthorityContent();
    } catch (error) {
      console.error("Error saving authority content:", error);
    } finally {
      setSaving(false);
    }
  };

  const filteredContent = authorityContent.filter(content => {
    const matchesSearch = content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (content.content?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    const matchesTopic = !selectedTopic || content.topics.includes(selectedTopic);
    return matchesSearch && matchesTopic;
  });

  const allTopics = Array.from(new Set(authorityContent.flatMap(c => c.topics || [])));
  const totalEngagement = authorityContent.reduce((acc, c) => acc + (c.engagementCount || 0), 0);
  const avgEngagement = authorityContent.length > 0 ? Math.round(totalEngagement / authorityContent.length) : 0;

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
          <h1 className="text-2xl font-bold text-white">Authority Engine</h1>
          <p className="text-slate-400 text-sm mt-1">Conteúdo de autoridade do CEO indexado</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Novo Conteúdo
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Adicionar Conteúdo de Autoridade</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Titulo *</Label>
                <Input 
                  className="bg-slate-700 border-slate-600 text-white" 
                  placeholder="Titulo do conteudo"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Conteudo</Label>
                <Textarea 
                  className="bg-slate-700 border-slate-600 text-white min-h-32" 
                  placeholder="Cole o conteudo completo aqui..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">URL da Fonte</Label>
                <Input 
                  className="bg-slate-700 border-slate-600 text-white" 
                  placeholder="https://"
                  value={formData.sourceUrl}
                  onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Topicos (separados por virgula)</Label>
                <Input 
                  className="bg-slate-700 border-slate-600 text-white" 
                  placeholder="IA, Tecnologia, Inovacao"
                  value={formData.topics}
                  onChange={(e) => setFormData({ ...formData, topics: e.target.value })}
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
                  "Adicionar Conteudo"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-white">{authorityContent.length}</p>
            <p className="text-xs text-slate-400 mt-1">Conteudos</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-400">{allTopics.length}</p>
            <p className="text-xs text-slate-400 mt-1">Topicos</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{totalEngagement.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-1">Engajamento Total</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-400">{avgEngagement}</p>
            <p className="text-xs text-slate-400 mt-1">Media por Conteudo</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
            placeholder="Buscar conteúdo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedTopic === null ? "default" : "outline"}
          size="sm"
          className={selectedTopic === null ? "bg-blue-600" : "border-slate-700 text-slate-300"}
          onClick={() => setSelectedTopic(null)}
        >
          Todos
        </Button>
        {allTopics.map(topic => (
          <Button
            key={topic}
            variant={selectedTopic === topic ? "default" : "outline"}
            size="sm"
            className={selectedTopic === topic ? "bg-blue-600" : "border-slate-700 text-slate-300"}
            onClick={() => setSelectedTopic(topic)}
          >
            <Tag className="h-3 w-3 mr-1" />
            {topic}
          </Button>
        ))}
      </div>

      {filteredContent.length === 0 ? (
        <div className="text-center py-12">
          <Award className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Nenhum conteudo encontrado</h3>
          <p className="text-slate-400 text-sm">
            {searchQuery || selectedTopic 
              ? "Tente ajustar os filtros" 
              : "Adicione seu primeiro conteudo de autoridade"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredContent.map((content, index) => (
            <motion.div
              key={content.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-colors h-full">
                <CardContent className="p-4 flex flex-col h-full">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-white line-clamp-2">{content.title}</h3>
                    {content.sourceUrl && (
                      <a
                        href={content.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-blue-400 flex-shrink-0"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                  
                  <p className="text-sm text-slate-400 mt-2 line-clamp-3 flex-1">
                    {content.summary || content.content || "Sem descricao"}
                  </p>

                  <div className="flex flex-wrap gap-1 mt-3">
                    {(content.topics || []).map(topic => (
                      <Badge key={topic} variant="secondary" className="bg-slate-700 text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {content.publishedAt ? new Date(content.publishedAt).toLocaleDateString("pt-BR") : "Sem data"}
                    </div>
                    <div className="flex items-center gap-1 text-green-400">
                      <TrendingUp className="h-3 w-3" />
                      {(content.engagementCount || 0).toLocaleString()} engajamentos
                    </div>
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
