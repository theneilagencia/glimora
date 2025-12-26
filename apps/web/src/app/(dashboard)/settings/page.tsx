"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  User,
  Building2,
  Bell,
  Shield,
  Save
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    signals: true,
    actions: true,
    weekly: true,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Configurações</h1>
        <p className="text-slate-400 text-sm mt-1">Gerencie suas preferências e configurações</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="bg-slate-800 border border-slate-700 w-full justify-start overflow-x-auto">
          <TabsTrigger value="profile" className="data-[state=active]:bg-blue-600">
            <User className="h-4 w-4 mr-2" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="organization" className="data-[state=active]:bg-blue-600">
            <Building2 className="h-4 w-4 mr-2" />
            Organização
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-blue-600">
            <Bell className="h-4 w-4 mr-2" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-blue-600">
            <Shield className="h-4 w-4 mr-2" />
            Segurança
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg text-white">Informações do Perfil</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                    JS
                  </div>
                  <Button variant="outline" className="border-slate-700 text-slate-300">
                    Alterar Foto
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Nome</Label>
                    <Input className="bg-slate-700 border-slate-600 text-white" defaultValue="João" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Sobrenome</Label>
                    <Input className="bg-slate-700 border-slate-600 text-white" defaultValue="Silva" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Email</Label>
                  <Input className="bg-slate-700 border-slate-600 text-white" defaultValue="joao@empresa.com" disabled />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Cargo</Label>
                  <Input className="bg-slate-700 border-slate-600 text-white" defaultValue="CEO" />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Função no Sistema</Label>
                  <Select defaultValue="EXEC">
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="EXEC" className="text-white">Executivo</SelectItem>
                      <SelectItem value="MANAGER" className="text-white">Gestor</SelectItem>
                      <SelectItem value="SELLER" className="text-white">Vendedor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="organization" className="mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg text-white">Informações da Organização</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Nome da Empresa</Label>
                  <Input className="bg-slate-700 border-slate-600 text-white" defaultValue="Minha Empresa LTDA" />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Domínio</Label>
                  <Input className="bg-slate-700 border-slate-600 text-white" defaultValue="minhaempresa.com.br" />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Setor</Label>
                  <Select defaultValue="tech">
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="tech" className="text-white">Tecnologia</SelectItem>
                      <SelectItem value="consulting" className="text-white">Consultoria</SelectItem>
                      <SelectItem value="finance" className="text-white">Finanças</SelectItem>
                      <SelectItem value="healthcare" className="text-white">Saúde</SelectItem>
                      <SelectItem value="other" className="text-white">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Tamanho da Empresa</Label>
                  <Select defaultValue="50-200">
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="1-10" className="text-white">1-10 funcionários</SelectItem>
                      <SelectItem value="11-50" className="text-white">11-50 funcionários</SelectItem>
                      <SelectItem value="50-200" className="text-white">50-200 funcionários</SelectItem>
                      <SelectItem value="200+" className="text-white">200+ funcionários</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg text-white">Preferências de Notificação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Notificações por Email</p>
                    <p className="text-sm text-slate-400">Receber atualizações por email</p>
                  </div>
                  <Switch 
                    checked={notifications.email} 
                    onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Notificações Push</p>
                    <p className="text-sm text-slate-400">Receber notificações no navegador</p>
                  </div>
                  <Switch 
                    checked={notifications.push} 
                    onCheckedChange={(checked) => setNotifications({...notifications, push: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Alertas de Sinais</p>
                    <p className="text-sm text-slate-400">Notificar quando novos sinais forem detectados</p>
                  </div>
                  <Switch 
                    checked={notifications.signals} 
                    onCheckedChange={(checked) => setNotifications({...notifications, signals: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Lembretes de Ações</p>
                    <p className="text-sm text-slate-400">Lembrar sobre ações pendentes</p>
                  </div>
                  <Switch 
                    checked={notifications.actions} 
                    onCheckedChange={(checked) => setNotifications({...notifications, actions: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Resumo Semanal</p>
                    <p className="text-sm text-slate-400">Receber relatório semanal de atividades</p>
                  </div>
                  <Switch 
                    checked={notifications.weekly} 
                    onCheckedChange={(checked) => setNotifications({...notifications, weekly: checked})}
                  />
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Preferências
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg text-white">Segurança da Conta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 rounded-lg bg-slate-700/50">
                  <p className="text-white font-medium">Autenticação</p>
                  <p className="text-sm text-slate-400 mt-1">
                    Sua conta está protegida pelo Clerk. Gerencie suas configurações de segurança diretamente no painel do Clerk.
                  </p>
                  <Button variant="outline" className="mt-4 border-slate-600 text-slate-300">
                    Gerenciar Segurança
                  </Button>
                </div>
                <div className="p-4 rounded-lg bg-slate-700/50">
                  <p className="text-white font-medium">Sessões Ativas</p>
                  <p className="text-sm text-slate-400 mt-1">
                    Você está logado em 1 dispositivo.
                  </p>
                  <Button variant="outline" className="mt-4 border-slate-600 text-slate-300">
                    Ver Sessões
                  </Button>
                </div>
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                  <p className="text-red-400 font-medium">Zona de Perigo</p>
                  <p className="text-sm text-slate-400 mt-1">
                    Ações irreversíveis para sua conta.
                  </p>
                  <Button variant="outline" className="mt-4 border-red-500/50 text-red-400 hover:bg-red-500/10">
                    Excluir Conta
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
