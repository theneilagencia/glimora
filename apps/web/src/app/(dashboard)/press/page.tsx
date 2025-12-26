"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  Search, 
  Download,
  Copy,
  Eye,
  Sparkles
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

const pressReleases = [
  {
    id: "1",
    title: "TechCorp Brasil Anuncia Parceria Estratégica com Líder Global",
    content: `São Paulo, 15 de Janeiro de 2024 - A TechCorp Brasil, empresa líder em soluções de tecnologia para o mercado B2B, anuncia hoje uma parceria estratégica com a Global Tech Solutions, expandindo sua presença no mercado latino-americano.

"Esta parceria representa um marco importante em nossa trajetória de crescimento", afirma João Silva, CEO da TechCorp Brasil. "Juntos, poderemos oferecer soluções ainda mais completas e inovadoras para nossos clientes."

A parceria inclui colaboração em desenvolvimento de produtos, compartilhamento de expertise técnica e expansão conjunta para novos mercados.

Sobre a TechCorp Brasil:
Fundada em 2015, a TechCorp Brasil é uma empresa de tecnologia focada em soluções B2B, atendendo mais de 500 clientes em todo o país.`,
    templateType: "PARTNERSHIP",
    status: "PUBLISHED",
    createdAt: "2024-01-15"
  },
  {
    id: "2",
    title: "Inovação SA Lança Nova Plataforma de Inteligência Artificial",
    content: `São Paulo, 10 de Janeiro de 2024 - A Inovação SA apresenta ao mercado sua nova plataforma de inteligência artificial, desenvolvida para transformar a forma como empresas B2B gerenciam seus processos comerciais.

"Investimos dois anos de pesquisa e desenvolvimento para criar uma solução que realmente entende as necessidades do mercado brasileiro", destaca Maria Santos, CTO da Inovação SA.

A plataforma oferece recursos avançados de análise preditiva, automação de processos e insights em tempo real.

Principais características:
- Análise preditiva de oportunidades
- Automação de processos comerciais
- Dashboard intuitivo e responsivo
- Integração com principais CRMs do mercado`,
    templateType: "PRODUCT_LAUNCH",
    status: "DRAFT",
    createdAt: "2024-01-10"
  },
  {
    id: "3",
    title: "CEO da Global Tech Compartilha Visão sobre o Futuro do Setor",
    content: `São Paulo, 5 de Janeiro de 2024 - Em artigo exclusivo, Pedro Costa, CEO da Global Tech, compartilha sua visão sobre as principais tendências que irão moldar o setor de tecnologia nos próximos anos.

"Estamos vivendo um momento de transformação sem precedentes", afirma Costa. "As empresas que souberem se adaptar e inovar serão as líderes do amanhã."

Entre os principais pontos destacados pelo executivo estão:

1. A consolidação da inteligência artificial como ferramenta essencial
2. A importância crescente da experiência do cliente
3. A necessidade de modelos de negócio mais sustentáveis
4. O papel fundamental da cultura organizacional na inovação

Costa também enfatiza a importância de investir em capacitação e desenvolvimento de talentos como diferencial competitivo.`,
    templateType: "THOUGHT_LEADERSHIP",
    status: "PUBLISHED",
    createdAt: "2024-01-05"
  },
];

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
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedPress, setSelectedPress] = useState<typeof pressReleases[0] | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");

  const filteredReleases = pressReleases.filter(release =>
    release.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    release.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                <Label className="text-slate-300">Template</Label>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Selecione um template" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="PRODUCT_LAUNCH" className="text-white">
                      Lançamento de Produto
                    </SelectItem>
                    <SelectItem value="PARTNERSHIP" className="text-white">
                      Parceria Estratégica
                    </SelectItem>
                    <SelectItem value="THOUGHT_LEADERSHIP" className="text-white">
                      Thought Leadership
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Título</Label>
                <Input className="bg-slate-700 border-slate-600 text-white" placeholder="Título do press release" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Contexto / Sinal Base</Label>
                <Textarea 
                  className="bg-slate-700 border-slate-600 text-white min-h-24" 
                  placeholder="Descreva o contexto ou sinal que motivou este press release..."
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Pontos-chave (um por linha)</Label>
                <Textarea 
                  className="bg-slate-700 border-slate-600 text-white min-h-24" 
                  placeholder="- Ponto 1&#10;- Ponto 2&#10;- Ponto 3"
                />
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => setIsCreateDialogOpen(false)}>
                <Sparkles className="h-4 w-4 mr-2" />
                Gerar Press Release
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
            <p className="text-2xl font-bold text-green-400">
              {pressReleases.filter(p => p.status === "PUBLISHED").length}
            </p>
            <p className="text-xs text-slate-400 mt-1">Publicados</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-400">
              {pressReleases.filter(p => p.status === "DRAFT").length}
            </p>
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

      <div className="space-y-4">
        {filteredReleases.map((release, index) => (
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
                      <Badge variant="outline" className={templateTypes[release.templateType as keyof typeof templateTypes].color}>
                        {templateTypes[release.templateType as keyof typeof templateTypes].label}
                      </Badge>
                      <Badge variant="outline" className={statusColors[release.status]}>
                        {release.status === "DRAFT" ? "Rascunho" : "Publicado"}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-white mt-2">{release.title}</h3>
                    <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                      {release.content.substring(0, 200)}...
                    </p>
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
                    <Button size="sm" variant="outline" className="border-slate-700 text-slate-300">
                      <Copy className="h-4 w-4 mr-1" />
                      Copiar
                    </Button>
                    <Button size="sm" variant="outline" className="border-slate-700 text-slate-300">
                      <Download className="h-4 w-4 mr-1" />
                      PDF
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Dialog open={!!selectedPress} onOpenChange={() => setSelectedPress(null)}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">{selectedPress?.title}</DialogTitle>
          </DialogHeader>
          {selectedPress && (
            <div className="space-y-4 mt-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={templateTypes[selectedPress.templateType as keyof typeof templateTypes].color}>
                  {templateTypes[selectedPress.templateType as keyof typeof templateTypes].label}
                </Badge>
                <Badge variant="outline" className={statusColors[selectedPress.status]}>
                  {selectedPress.status === "DRAFT" ? "Rascunho" : "Publicado"}
                </Badge>
              </div>
              <div className="p-4 rounded-lg bg-slate-700/50 text-slate-300 whitespace-pre-wrap text-sm">
                {selectedPress.content}
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar Texto
                </Button>
                <Button variant="outline" className="border-slate-700 text-slate-300">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
