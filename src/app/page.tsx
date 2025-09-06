import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, Zap, Shield, Download, CheckCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Doclify</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/auth/login">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Começar Grátis</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Gere Documentos de Requisitos
          <span className="text-blue-600"> Profissionais</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Plataforma SaaS completa para criar, gerenciar e exportar documentos de análise de requisitos e contratos de forma rápida e profissional.
        </p>
        <div className="flex items-center justify-center space-x-4">
          <Link href="/auth/register">
            <Button size="lg" className="px-8 py-3">
              Começar Agora
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button variant="outline" size="lg" className="px-8 py-3">
              Ver Demo
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Tudo que você precisa para documentar seus projetos
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <FileText className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Editor Intuitivo</CardTitle>
              <CardDescription>
                Formulário multi-step com validação para capturar todos os detalhes do seu projeto
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-green-600 mb-2" />
              <CardTitle>Gestão de Equipe</CardTitle>
              <CardDescription>
                Gerencie stakeholders, equipe e responsabilidades de forma organizada
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Download className="h-10 w-10 text-purple-600 mb-2" />
              <CardTitle>Exportação Profissional</CardTitle>
              <CardDescription>
                Exporte seus documentos em PDF com layout profissional e personalizado
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-10 w-10 text-yellow-600 mb-2" />
              <CardTitle>Rápido e Eficiente</CardTitle>
              <CardDescription>
                Interface moderna e responsiva para máxima produtividade
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-red-600 mb-2" />
              <CardTitle>Seguro e Confiável</CardTitle>
              <CardDescription>
                Seus dados protegidos com autenticação segura e backup automático
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CheckCircle className="h-10 w-10 text-indigo-600 mb-2" />
              <CardTitle>Validação Completa</CardTitle>
              <CardDescription>
                Formulários com validação em tempo real para garantir qualidade dos dados
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Pronto para começar?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Crie sua conta gratuita e comece a gerar documentos profissionais hoje mesmo.
          </p>
          <Link href="/auth/register">
            <Button size="lg" variant="secondary" className="px-8 py-3">
              Criar Conta Grátis
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-6 w-6" />
              <span className="text-xl font-bold">Doclify</span>
            </div>
            <p className="text-gray-400">
              © 2024 Doclify. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
