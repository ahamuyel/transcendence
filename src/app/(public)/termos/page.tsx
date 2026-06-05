import Link from "next/link"
import { Shield, BookOpen, FileText, UserCheck, Lock, AlertTriangle, Scale, Mail } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        
        {/* Cabeçalho da Página */}
        <div className="text-center md:text-left border-b border-zinc-200 dark:border-zinc-800 pb-8 mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-neutral-900 dark:bg-white text-white dark:text-zinc-950 rounded-xl mb-4 shadow-sm">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Termos de Uso
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Última atualização: Maio de 2026 • Plataforma Cur10usX
          </p>
        </div>

        {/* Artigo com Estilo Proporcional */}
        <article className="prose prose-zinc dark:prose-invert max-w-none 
          prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-zinc-900 dark:prose-headings:text-white
          prose-p:text-zinc-600 dark:prose-p:text-zinc-300 prose-p:leading-relaxed
          prose-li:text-zinc-600 dark:prose-li:text-zinc-300">
          
          {/* Introdução / Secção 1 */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 shadow-sm mb-6">
            <h2 className="flex items-center gap-3 text-xl md:text-2xl mt-0 pb-3 border-b border-zinc-100 dark:border-zinc-800/50">
              <FileText className="w-5 h-5 text-zinc-500 shrink-0" />
              1. Aceitação dos Termos
            </h2>
            <p className="mb-0">
              Ao aceder e utilizar a plataforma Cur10usX (&ldquo;Plataforma&rdquo;), o utilizador
              confirma que leu, compreendeu e aceita os presentes Termos de Uso. Se não
              concordar com qualquer parte destes termos, não deverá utilizar a Plataforma.
            </p>
          </div>

          {/* Secção 2: Definições */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 shadow-sm mb-6">
            <h2 className="flex items-center gap-3 text-xl md:text-2xl mt-0 pb-3 border-b border-zinc-100 dark:border-zinc-800/50">
              <BookOpen className="w-5 h-5 text-zinc-500 shrink-0" />
              2. Definições
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none pl-0 my-4">
              <li className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/30">
                <strong className="text-zinc-900 dark:text-white block mb-1">Plataforma:</strong> 
                Sistema de gestão escolar Cur10usX, incluindo todas as suas funcionalidades web.
              </li>
              <li className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/30">
                <strong className="text-zinc-900 dark:text-white block mb-1">Utilizador:</strong> 
                Qualquer pessoa que aceda ou utilize a Plataforma.
              </li>
              <li className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/30">
                <strong className="text-zinc-900 dark:text-white block mb-1">Escola:</strong> 
                Instituição de ensino registada na Plataforma.
              </li>
              <li className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/30">
                <strong className="text-zinc-900 dark:text-white block mb-1">Dados Pessoais:</strong> 
                Qualquer informação relativa a uma pessoa singular identificada ou identificável.
              </li>
            </ul>
          </div>

          {/* Secção 3: Serviços */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 shadow-sm mb-6">
            <h2 className="text-xl md:text-2xl mt-0 pb-3 border-b border-zinc-100 dark:border-zinc-800/50">
              3. Serviços Prestados
            </h2>
            <p>A Plataforma oferece as seguintes funcionalidades:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-0">
              {[
                "Gestão de alunos, professores, turmas e disciplinas",
                "Registo e acompanhamento de notas e assiduidade",
                "Comunicação interna entre a comunidade escolar",
                "Gestão de horários, exames e trabalhos",
                "Geração de relatórios e estatísticas académicas",
                "Gestão de candidaturas e matrículas"
              ].map((servico, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-sm py-1.5 text-zinc-600 dark:text-zinc-300">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-medium text-zinc-900 dark:text-zinc-200">
                    ✓
                  </span>
                  {servico}
                </div>
              ))}
            </div>
          </div>

          {/* Secção 4 & 5 */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 shadow-sm mb-6">
            <h2 className="flex items-center gap-3 text-xl md:text-2xl mt-0 pb-3 border-b border-zinc-100 dark:border-zinc-800/50">
              <UserCheck className="w-5 h-5 text-zinc-500 shrink-0" />
              4. Conta do Utilizador
            </h2>
            <p>
              O utilizador é responsável por manter a confidencialidade das suas credenciais
              de acesso e por todas as atividades realizadas na sua conta. O utilizador
              compromete-se a notificar imediatamente a equipa da Plataforma sobre qualquer
              uso não autorizado da sua conta.
            </p>

            <h2 className="flex items-center gap-3 text-xl md:text-2xl mt-8 pb-3 border-b border-zinc-100 dark:border-zinc-800/50">
              <Lock className="w-5 h-5 text-zinc-500 shrink-0" />
              5. Privacidade e Proteção de Dados
            </h2>
            <p className="mb-0">
              A recolha e tratamento de dados pessoais são realizados em conformidade com a
              <strong> Lei de Proteção de Dados de Angola (Lei n.º 22/11 de 17 de Junho)</strong> e o
              Regulamento Geral de Proteção de Dados (RGPD), quando aplicável. Consulte a nossa{" "}
              <Link href="/privacidade" className="text-zinc-900 dark:text-white font-medium underline underline-offset-4 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                Política de Privacidade
              </Link>{" "}
              para informações detalhadas.
            </p>
          </div>

          {/* Secção 6 & 7 */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 shadow-sm mb-6">
            <h2 className="text-xl md:text-2xl mt-0 pb-3 border-b border-zinc-100 dark:border-zinc-800/50">
              6. Obrigações do Utilizador
            </h2>
            <ul className="space-y-2 my-4 pl-4 marker:text-zinc-400">
              <li>Fornecer informações precisas e atualizadas.</li>
              <li>Não utilizar a Plataforma para fins ilegais ou não autorizados.</li>
              <li>Não interferir com o bom funcionamento técnico da Plataforma.</li>
              <li>Respeitar integralmente os direitos de propriedade intelectual.</li>
            </ul>

            <h2 className="text-xl md:text-2xl mt-8 pb-3 border-b border-zinc-100 dark:border-zinc-800/50">
              7. Propriedade Intelectual
            </h2>
            <p className="mb-0">
              Todo o conteúdo, design, logótipos e software da Plataforma são propriedade
              exclusiva da Cur10usX ou dos seus licenciadores e estão protegidos pelas leis
              de propriedade intelectual internacionais e locais.
            </p>
          </div>

          {/* Secção 8 & 9 (Avisos e Limitações) */}
          <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 shadow-sm mb-6">
            <h2 className="flex items-center gap-3 text-xl md:text-2xl mt-0 pb-3 border-b border-zinc-200 dark:border-zinc-800/50">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
              8. Limitação de Responsabilidade
            </h2>
            <p>
              A Plataforma é fornecida &ldquo;tal como está&rdquo;, sem garantias de qualquer tipo,
              expressas ou implícitas. A Cur10usX não será responsável por danos diretos,
              indiretos, incidentais ou consequenciais decorrentes do uso ou da incapacidade
              de usar a Plataforma.
            </p>

            <h2 className="text-xl md:text-2xl mt-8 pb-3 border-b border-zinc-200 dark:border-zinc-800/50">
              9. Cancelamento e Suspensão
            </h2>
            <p className="mb-0">
              A Cur10usX reserva-se o direito de suspender ou cancelar o acesso de qualquer
              utilizador que viole estes Termos de Uso, sem necessidade de aviso prévio.
            </p>
          </div>

          {/* Secção 10 & 11 */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 shadow-sm mb-6">
            <h2 className="text-xl md:text-2xl mt-0 pb-3 border-b border-zinc-100 dark:border-zinc-800/50">
              10. Alterações aos Termos
            </h2>
            <p>
              Estes Termos de Uso podem ser alterados periodicamente. Os utilizadores serão
              notificados sobre alterações significativas através da Plataforma. O uso
              continuado após as alterações constitui aceitação dos novos termos.
            </p>

            <h2 className="flex items-center gap-3 text-xl md:text-2xl mt-8 pb-3 border-b border-zinc-100 dark:border-zinc-800/50">
              <Scale className="w-5 h-5 text-zinc-500 shrink-0" />
              11. Lei Aplicável
            </h2>
            <p className="mb-0">
              Estes Termos são regidos pelas leis da <strong>República de Angola</strong>. Qualquer litígio
              será submetido à jurisdição exclusiva dos tribunais da comarca de <strong>Luanda, Angola</strong>.
            </p>
          </div>

          {/* Secção 12: Contacto */}
          <div className="bg-neutral-900 dark:bg-zinc-900 text-white border border-transparent rounded-2xl p-6 md:p-8 shadow-md text-center">
            <h2 className="flex items-center justify-center gap-3 text-xl md:text-2xl mt-0 mb-3 text-white border-none">
              <Mail className="w-5 h-5 shrink-0" />
              12. Contacto Comercial e Suporte
            </h2>
            <p className="text-zinc-300 dark:text-zinc-400 text-sm max-w-md mx-auto mb-6">
              Para quaisquer dúvidas, questões ou esclarecimentos adicionais relacionados com estes Termos de Uso, utilize o canal oficial:
            </p>
            <a 
              href="mailto:suporte@cur10usx.com"
              className="inline-flex items-center justify-center px-5 py-3 font-medium tracking-tight bg-white dark:bg-white text-zinc-950 rounded-xl hover:bg-zinc-100 transition-colors shadow-sm no-underline"
            >
              suporte@cur10usx.com
            </a>
          </div>

        </article>
      </div>
    </div>
  )
}