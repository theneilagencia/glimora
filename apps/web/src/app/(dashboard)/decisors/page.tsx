"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  Search, 
  Filter,
  MoreVertical,
  Linkedin,
  Mail,
  Phone
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

const decisors = [
  {
    id: "1",
    firstName: "João",
    lastName: "Silva",
    title: "CEO",
    email: "joao@techcorp.com.br",
    phone: "+55 11 99999-9999",
    linkedinUrl: "https://linkedin.com/in/joaosilva",
    account: "TechCorp Brasil",
    influence: 95,
    engagementScore: 88,
    signalCount: 12,
    lastActivityAt: "2h atrás"
  },
  {
    id: "2",
    firstName: "Maria",
    lastName: "Santos",
    title: "CTO",
    email: "maria@inovacao.com.br",
    linkedinUrl: "https://linkedin.com/in/mariasantos",
    account: "Inovação SA",
    influence: 85,
    engagementScore: 72,
    signalCount: 8,
    lastActivityAt: "4h atrás"
  },
  {
    id: "3",
    firstName: "Pedro",
    lastName: "Costa",
    title: "VP Sales",
    email: "pedro@globaltech.io",
    linkedinUrl: "https://linkedin.com/in/pedrocosta",
    account: "Global Tech",
    influence: 80,
    engagementScore: 65,
    signalCount: 6,
    lastActivityAt: "1d atrás"
  },
  {
    id: "4",
    firstName: "Ana",
    lastName: "Oliveira",
    title: "CMO",
    email: "ana@startuphub.vc",
    linkedinUrl: "https://linkedin.com/in/anaoliveira",
    account: "Startup Hub",
    influence: 75,
    engagementScore: 78,
    signalCount: 9,
    lastActivityAt: "6h atrás"
  },
  {
    id: "5",
    firstName: "Carlos",
    lastName: "Ferreira",
    title: "Diretor Comercial",
    email: "carlos@digitalsolutions.com",
    account: "Digital Solutions",
    influence: 70,
    engagementScore: 54,
    signalCount: 4,
    lastActivityAt: "3d atrás"
  },
];

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

export default function DecisorsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredDecisors = decisors.filter(decisor =>
    `${decisor.firstName} ${decisor.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    decisor.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    decisor.account.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                  <Label className="text-slate-300">Nome</Label>
                  <Input className="bg-slate-700 border-slate-600 text-white" placeholder="João" />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Sobrenome</Label>
                  <Input className="bg-slate-700 border-slate-600 text-white" placeholder="Silva" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Cargo</Label>
                <Input className="bg-slate-700 border-slate-600 text-white" placeholder="CEO" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Email</Label>
                <Input className="bg-slate-700 border-slate-600 text-white" placeholder="email@empresa.com" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">LinkedIn URL</Label>
                <Input className="bg-slate-700 border-slate-600 text-white" placeholder="https://linkedin.com/in/" />
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => setIsDialogOpen(false)}>
                Adicionar Decisor
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

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
                      <p className="text-xs text-slate-400">{decisor.title}</p>
                      <p className="text-xs text-blue-400">{decisor.account}</p>
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
                        Criar Ação
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-400 hover:text-red-300 focus:text-red-300 focus:bg-slate-700">
                        Remover
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className={`p-2 rounded-lg ${getScoreBgColor(decisor.influence)}`}>
                    <p className="text-xs text-slate-400">Influência</p>
                    <p className={`text-lg font-bold ${getScoreColor(decisor.influence)}`}>
                      {decisor.influence}
                    </p>
                  </div>
                  <div className={`p-2 rounded-lg ${getScoreBgColor(decisor.engagementScore)}`}>
                    <p className="text-xs text-slate-400">Engajamento</p>
                    <p className={`text-lg font-bold ${getScoreColor(decisor.engagementScore)}`}>
                      {decisor.engagementScore}
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
                  <span className="text-xs text-slate-500">{decisor.lastActivityAt}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
