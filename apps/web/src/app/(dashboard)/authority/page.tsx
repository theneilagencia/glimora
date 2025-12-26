"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  Search, 
  ExternalLink,
  Tag,
  TrendingUp,
  Calendar
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

const authorityContent = [
  {
    id: "1",
    title: "O Futuro da IA no Brasil: Oportunidades e Desafios",
    content: "Em minha palestra no evento Tech Summit, compartilhei insights sobre como a inteligência artificial está transformando o mercado brasileiro...",
    summary: "Análise sobre o impacto da IA no mercado brasileiro e as oportunidades para empresas locais.",
    topics: ["IA", "Tecnologia", "Inovação", "Brasil"],
    sourceUrl: "https://linkedin.com/posts/ceo/123",
    publishedAt: "2024-01-15",
    engagementCount: 1250
  },
  {
    id: "2",
    title: "Liderança em Tempos de Transformação Digital",
    content: "A transformação digital não é apenas sobre tecnologia, é sobre pessoas. Neste artigo, exploro como líderes podem guiar suas equipes...",
    summary: "Reflexões sobre liderança e gestão de mudanças em contextos de transformação digital.",
    topics: ["Liderança", "Transformação Digital", "Gestão"],
    sourceUrl: "https://forbes.com.br/article/456",
    publishedAt: "2024-01-10",
    engagementCount: 890
  },
  {
    id: "3",
    title: "Tendências de Mercado B2B para 2024",
    content: "O mercado B2B está passando por mudanças significativas. Identifiquei 5 tendências que todo gestor comercial precisa conhecer...",
    summary: "Análise das principais tendências do mercado B2B para o ano de 2024.",
    topics: ["B2B", "Vendas", "Tendências", "Mercado"],
    sourceUrl: "https://linkedin.com/posts/ceo/789",
    publishedAt: "2024-01-05",
    engagementCount: 2100
  },
  {
    id: "4",
    title: "Como Construir uma Cultura de Inovação",
    content: "Inovação não acontece por acaso. É resultado de uma cultura organizacional que incentiva experimentação e aprendizado contínuo...",
    summary: "Guia prático para desenvolver uma cultura de inovação nas organizações.",
    topics: ["Inovação", "Cultura Organizacional", "Gestão"],
    sourceUrl: "https://exame.com/article/101",
    publishedAt: "2023-12-20",
    engagementCount: 1560
  },
];

const allTopics = Array.from(new Set(authorityContent.flatMap(c => c.topics)));

export default function AuthorityPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredContent = authorityContent.filter(content => {
    const matchesSearch = content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTopic = !selectedTopic || content.topics.includes(selectedTopic);
    return matchesSearch && matchesTopic;
  });

  const totalEngagement = authorityContent.reduce((acc, c) => acc + c.engagementCount, 0);

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
                <Label className="text-slate-300">Título</Label>
                <Input className="bg-slate-700 border-slate-600 text-white" placeholder="Título do conteúdo" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Conteúdo</Label>
                <Textarea 
                  className="bg-slate-700 border-slate-600 text-white min-h-32" 
                  placeholder="Cole o conteúdo completo aqui..."
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">URL da Fonte</Label>
                <Input className="bg-slate-700 border-slate-600 text-white" placeholder="https://" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Tópicos (separados por vírgula)</Label>
                <Input className="bg-slate-700 border-slate-600 text-white" placeholder="IA, Tecnologia, Inovação" />
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => setIsDialogOpen(false)}>
                Adicionar Conteúdo
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-white">{authorityContent.length}</p>
            <p className="text-xs text-slate-400 mt-1">Conteúdos</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-400">{allTopics.length}</p>
            <p className="text-xs text-slate-400 mt-1">Tópicos</p>
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
            <p className="text-2xl font-bold text-purple-400">
              {Math.round(totalEngagement / authorityContent.length)}
            </p>
            <p className="text-xs text-slate-400 mt-1">Média por Conteúdo</p>
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
                  {content.summary || content.content}
                </p>

                <div className="flex flex-wrap gap-1 mt-3">
                  {content.topics.map(topic => (
                    <Badge key={topic} variant="secondary" className="bg-slate-700 text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(content.publishedAt).toLocaleDateString("pt-BR")}
                  </div>
                  <div className="flex items-center gap-1 text-green-400">
                    <TrendingUp className="h-3 w-3" />
                    {content.engagementCount.toLocaleString()} engajamentos
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
