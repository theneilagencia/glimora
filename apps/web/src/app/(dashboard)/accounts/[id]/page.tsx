"use client";

import { motion } from "framer-motion";
import { 
  Building2, 
  ArrowLeft,
  Users,
  Zap,
  Linkedin,
  Globe
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

const account = {
  id: "1",
  name: "TechCorp Brasil",
  industry: "Tecnologia",
  website: "https://techcorp.com.br",
  linkedinUrl: "https://linkedin.com/company/techcorp-brasil",
  description: "Empresa líder em soluções de tecnologia para o mercado B2B brasileiro.",
  employeeCount: 250,
  revenue: "R$ 50M - R$ 100M",
  signalScore: 85,
  priority: 1,
  lastSignalAt: "2h atrás"
};

const decisors = [
  { id: "1", name: "João Silva", title: "CEO", influence: 95, engagementScore: 88 },
  { id: "2", name: "Maria Santos", title: "CTO", influence: 85, engagementScore: 72 },
  { id: "3", name: "Pedro Costa", title: "VP Sales", influence: 80, engagementScore: 65 },
];

const signals = [
  { id: "1", title: "Post sobre transformação digital", type: "LINKEDIN_POST", strength: "HIGH", score: 85, time: "2h atrás" },
  { id: "2", title: "Engajamento com conteúdo de IA", type: "LINKEDIN_ENGAGEMENT", strength: "MEDIUM", score: 65, time: "1d atrás" },
  { id: "3", title: "Atualização de perfil corporativo", type: "LINKEDIN_PROFILE_UPDATE", strength: "LOW", score: 45, time: "3d atrás" },
];

const actions = [
  { id: "1", title: "Enviar mensagem de follow-up", status: "PENDING", priority: 1, dueDate: "Hoje" },
  { id: "2", title: "Compartilhar artigo de autoridade", status: "PENDING", priority: 2, dueDate: "Amanhã" },
];

const strengthColors: Record<string, string> = {
  LOW: "bg-slate-500",
  MEDIUM: "bg-yellow-500",
  HIGH: "bg-orange-500",
  CRITICAL: "bg-red-500",
};

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-400";
  if (score >= 60) return "text-yellow-400";
  if (score >= 40) return "text-orange-400";
  return "text-red-400";
}

export default function AccountDetailPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/accounts">
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{account.name}</h1>
          <p className="text-slate-400 text-sm">{account.industry}</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Zap className="h-4 w-4 mr-2" />
          Coletar Sinais
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="lg:col-span-2"
        >
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-slate-300">{account.description}</p>
                  <div className="mt-4 flex flex-wrap gap-4 text-sm">
                    {account.website && (
                      <a
                        href={account.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
                      >
                        <Globe className="h-4 w-4" />
                        Website
                      </a>
                    )}
                    {account.linkedinUrl && (
                      <a
                        href={account.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
                      >
                        <Linkedin className="h-4 w-4" />
                        LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 rounded-lg bg-slate-700/30">
                  <p className={`text-2xl font-bold ${getScoreColor(account.signalScore)}`}>{account.signalScore}</p>
                  <p className="text-xs text-slate-400 mt-1">Signal Score</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-slate-700/30">
                  <p className="text-2xl font-bold text-white">{account.employeeCount}</p>
                  <p className="text-xs text-slate-400 mt-1">Funcionários</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-slate-700/30">
                  <p className="text-2xl font-bold text-white">{decisors.length}</p>
                  <p className="text-xs text-slate-400 mt-1">Decisores</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-slate-700/30">
                  <p className="text-2xl font-bold text-white">{signals.length}</p>
                  <p className="text-xs text-slate-400 mt-1">Sinais</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-white">Ações Pendentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {actions.map((action) => (
                <div
                  key={action.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-slate-700/30"
                >
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">
                    {action.priority}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{action.title}</p>
                    <Badge variant="outline" className="mt-1 text-xs border-slate-600 text-slate-300">
                      {action.dueDate}
                    </Badge>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full border-slate-700 text-slate-300 hover:bg-slate-700">
                Ver Todas as Ações
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Tabs defaultValue="decisors" className="w-full">
          <TabsList className="bg-slate-800 border border-slate-700">
            <TabsTrigger value="decisors" className="data-[state=active]:bg-blue-600">
              <Users className="h-4 w-4 mr-2" />
              Decisores
            </TabsTrigger>
            <TabsTrigger value="signals" className="data-[state=active]:bg-blue-600">
              <Zap className="h-4 w-4 mr-2" />
              Sinais
            </TabsTrigger>
          </TabsList>

          <TabsContent value="decisors" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {decisors.map((decisor) => (
                <Card key={decisor.id} className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                        {decisor.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{decisor.name}</h4>
                        <p className="text-xs text-slate-400">{decisor.title}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <div>
                        <span className="text-slate-400">Influência: </span>
                        <span className={getScoreColor(decisor.influence)}>{decisor.influence}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Engajamento: </span>
                        <span className={getScoreColor(decisor.engagementScore)}>{decisor.engagementScore}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="signals" className="mt-4">
            <div className="space-y-3">
              {signals.map((signal) => (
                <Card key={signal.id} className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${strengthColors[signal.strength]}`} />
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{signal.title}</h4>
                        <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                          <Badge variant="secondary" className="bg-slate-700">
                            Score: {signal.score}
                          </Badge>
                          <span>{signal.type.replace(/_/g, " ")}</span>
                          <span>{signal.time}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
