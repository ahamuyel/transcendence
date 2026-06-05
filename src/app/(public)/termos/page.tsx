import Link from "next/link"
import { Shield, BookOpen, FileText, UserCheck, Lock, AlertTriangle, Scale, Mail } from "lucide-react"
import { getServerLocale } from "@/lib/i18n/server"

export default async function TermsPage() {
  const locale = await getServerLocale()

  if (locale === "en") {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center md:text-left border-b border-zinc-200 dark:border-zinc-800 pb-8 mb-12">
            <div className="inline-flex items-center justify-center p-3 bg-neutral-900 dark:bg-white text-white dark:text-zinc-950 rounded-xl mb-4 shadow-sm">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              Terms of Use
            </h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Last updated: May 2026 • Cur10usX Platform
            </p>
          </div>

          {/* Article content */}
          <article className="prose prose-zinc dark:prose-invert max-w-none 
            prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-zinc-900 dark:prose-headings:text-white
            prose-p:text-zinc-600 dark:prose-p:text-zinc-300 prose-p:leading-relaxed
            prose-li:text-zinc-600 dark:prose-li:text-zinc-300">
            
            {/* Section 1 */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 shadow-sm mb-6">
              <h2 className="flex items-center gap-3 text-xl md:text-2xl mt-0 pb-3 border-b border-zinc-100 dark:border-zinc-800/50">
                <FileText className="w-5 h-5 text-zinc-500 shrink-0" />
                1. Acceptance of Terms
              </h2>
              <p className="mb-0">
                By accessing and using the Cur10usX platform (&ldquo;Platform&rdquo;), you confirm that
                you have read, understood, and accept these Terms of Use. If you do not
                agree to any part of these terms, you should not use the Platform.
              </p>
            </div>

            {/* Section 2 */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 shadow-sm mb-6">
              <h2 className="flex items-center gap-3 text-xl md:text-2xl mt-0 pb-3 border-b border-zinc-100 dark:border-zinc-800/50">
                <BookOpen className="w-5 h-5 text-zinc-500 shrink-0" />
                2. Definitions
              </h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none pl-0 my-4">
                <li className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/30">
                  <strong className="text-zinc-900 dark:text-white block mb-1">Platform:</strong> 
                  Cur10usX school management system, including all its web features.
                </li>
                <li className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/30">
                  <strong className="text-zinc-900 dark:text-white block mb-1">User:</strong> 
                  Any person who accesses or uses the Platform.
                </li>
                <li className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/30">
                  <strong className="text-zinc-900 dark:text-white block mb-1">School:</strong> 
                  Educational institution registered on the Platform.
                </li>
                <li className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/30">
                  <strong className="text-zinc-900 dark:text-white block mb-1">Personal Data:</strong> 
                  Any information relating to an identified or identifiable natural person.
                </li>
              </ul>
            </div>

            {/* Section 3 */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 shadow-sm mb-6">
              <h2 className="text-xl md:text-2xl mt-0 pb-3 border-b border-zinc-100 dark:border-zinc-800/50">
                3. Services Provided
              </h2>
              <p>The Platform offers the following features:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-0">
                {[
                  "Management of students, teachers, classes, and subjects",
                  "Recording and monitoring of grades and attendance",
                  "Internal communication within the school community",
                  "Management of schedules, exams, and assignments",
                  "Generation of academic reports and statistics",
                  "Management of applications and enrollments"
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

            {/* Section 4 & 5 */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 shadow-sm mb-6">
              <h2 className="flex items-center gap-3 text-xl md:text-2xl mt-0 pb-3 border-b border-zinc-100 dark:border-zinc-800/50">
                <UserCheck className="w-5 h-5 text-zinc-500 shrink-0" />
                4. User Account
              </h2>
              <p>
                The user is responsible for maintaining the confidentiality of their access
                credentials and for all activities carried out in their account. The user
                agrees to immediately notify the Platform team of any unauthorized
                use of their account.
              </p>

              <h2 className="flex items-center gap-3 text-xl md:text-2xl mt-8 pb-3 border-b border-zinc-100 dark:border-zinc-800/50">
                <Lock className="w-5 h-5 text-zinc-500 shrink-0" />
                5. Privacy and Data Protection
              </h2>
              <p className="mb-0">
                The collection and processing of personal data are carried out in compliance with the
                <strong> Angola Data Protection Law (Law No. 22/11 of June 17)</strong> and the
                General Data Protection Regulation (GDPR), where applicable. See our{" "}
                <Link href="/privacidade" className="text-zinc-900 dark:text-white font-medium underline underline-offset-4 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                  Privacy Policy
                </Link>{" "}
                for detailed information.
              </p>
            </div>

            {/* Section 6 & 7 */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 shadow-sm mb-6">
              <h2 className="text-xl md:text-2xl mt-0 pb-3 border-b border-zinc-100 dark:border-zinc-800/50">
                6. User Obligations
              </h2>
              <ul className="space-y-2 my-4 pl-4 marker:text-zinc-400">
                <li>Provide accurate and updated information.</li>
                <li>Do not use the Platform for illegal or unauthorized purposes.</li>
                <li>Do not interfere with the proper technical operation of the Platform.</li>
                <li>Fully respect intellectual property rights.</li>
              </ul>

              <h2 className="text-xl md:text-2xl mt-8 pb-3 border-b border-zinc-100 dark:border-zinc-800/50">
                7. Intellectual Property
              </h2>
              <p className="mb-0">
                All content, design, logos, and software of the Platform are the exclusive
                property of Cur10usX or its licensors and are protected by international and
                local intellectual property laws.
              </p>
            </div>

            {/* Section 8 & 9 */}
            <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 shadow-sm mb-6">
              <h2 className="flex items-center gap-3 text-xl md:text-2xl mt-0 pb-3 border-b border-zinc-200 dark:border-zinc-800/50">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                8. Limitation of Liability
              </h2>
              <p>
                The Platform is provided &ldquo;as is&rdquo;, without warranties of any kind,
                express or implied. Cur10usX shall not be liable for any direct,
                indirect, incidental, or consequential damages arising out of the use or
                inability to use the Platform.
              </p>

              <h2 className="text-xl md:text-2xl mt-8 pb-3 border-b border-zinc-200 dark:border-zinc-800/50">
                9. Cancellation and Suspension
              </h2>
              <p className="mb-0">
                Cur10usX reserves the right to suspend or cancel the access of any
                user who violates these Terms of Use, without prior notice.
              </p>
            </div>

            {/* Section 10 & 11 */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 shadow-sm mb-6">
              <h2 className="text-xl md:text-2xl mt-0 pb-3 border-b border-zinc-100 dark:border-zinc-800/50">
                10. Changes to the Terms
              </h2>
              <p>
                These Terms of Use may be changed periodically. Users will be
                notified of significant changes through the Platform. Continued use
                after changes constitutes acceptance of the new terms.
              </p>

              <h2 className="flex items-center gap-3 text-xl md:text-2xl mt-8 pb-3 border-b border-zinc-100 dark:border-zinc-800/50">
                <Scale className="w-5 h-5 text-zinc-500 shrink-0" />
                11. Applicable Law
              </h2>
              <p className="mb-0">
                These Terms are governed by the laws of the <strong>Republic of Angola</strong>. Any dispute
                shall be submitted to the exclusive jurisdiction of the courts of <strong>Luanda, Angola</strong>.
              </p>
            </div>

            {/* Section 12 */}
            <div className="bg-neutral-900 dark:bg-zinc-900 text-white border border-transparent rounded-2xl p-6 md:p-8 shadow-md text-center">
              <h2 className="flex items-center justify-center gap-3 text-xl md:text-2xl mt-0 mb-3 text-white border-none">
                <Mail className="w-5 h-5 shrink-0" />
                12. Business Contact and Support
              </h2>
              <p className="text-zinc-300 dark:text-zinc-400 text-sm max-w-md mx-auto mb-6">
                For any doubts, questions, or additional clarifications related to these Terms of Use, use the official channel:
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

  if (locale === "fr") {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center md:text-left border-b border-zinc-200 dark:border-zinc-800 pb-8 mb-12">
            <div className="inline-flex items-center justify-center p-3 bg-neutral-900 dark:bg-white text-white dark:text-zinc-950 rounded-xl mb-4 shadow-sm">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              Conditions d&apos;utilisation
            </h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Dernière mise à jour : Mai 2026 • Plateforme Cur10usX
            </p>
          </div>

          {/* Article content */}
          <article className="prose prose-zinc dark:prose-invert max-w-none 
            prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-zinc-900 dark:prose-headings:text-white
            prose-p:text-zinc-600 dark:prose-p:text-zinc-300 prose-p:leading-relaxed
            prose-li:text-zinc-600 dark:prose-li:text-zinc-300">
            
            {/* Section 1 */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 shadow-sm mb-6">
              <h2 className="flex items-center gap-3 text-xl md:text-2xl mt-0 pb-3 border-b border-zinc-100 dark:border-zinc-800/50">
                <FileText className="w-5 h-5 text-zinc-500 shrink-0" />
                1. Acceptation des conditions
              </h2>
              <p className="mb-0">
                En accédant et en utilisant la plateforme Cur10usX (&ldquo;Plateforme&rdquo;), vous confirmez que
                vous avez lu, compris et accepté les présentes Conditions d&apos;utilisation. Si vous n&apos;acceptez pas
                une partie de ces conditions, vous ne devez pas utiliser la Plateforme.
              </p>
            </div>

            {/* Section 2 */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 shadow-sm mb-6">
              <h2 className="flex items-center gap-3 text-xl md:text-2xl mt-0 pb-3 border-b border-zinc-100 dark:border-zinc-800/50">
                <BookOpen className="w-5 h-5 text-zinc-500 shrink-0" />
                2. Définitions
              </h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none pl-0 my-4">
                <li className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/30">
                  <strong className="text-zinc-900 dark:text-white block mb-1">Plateforme:</strong> 
                  Le système de gestion scolaire Cur10usX, y compris toutes ses fonctionnalités web.
                </li>
                <li className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/30">
                  <strong className="text-zinc-900 dark:text-white block mb-1">Utilisateur:</strong> 
                  Toute personne qui accède ou utilise la Plateforme.
                </li>
                <li className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/30">
                  <strong className="text-zinc-900 dark:text-white block mb-1">École:</strong> 
                  Établissement d&apos;enseignement enregistré sur la Plateforme.
                </li>
                <li className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/30">
                  <strong className="text-zinc-900 dark:text-white block mb-1">Données personnelles:</strong> 
                  Toute information relative à une personne physique identifiée ou identifiable.
                </li>
              </ul>
            </div>

            {/* Section 3 */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 shadow-sm mb-6">
              <h2 className="text-xl md:text-2xl mt-0 pb-3 border-b border-zinc-100 dark:border-zinc-800/50">
                3. Services fournis
              </h2>
              <p>La Plateforme propose les fonctionnalités suivantes :</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-0">
                {[
                  "Gestion des élèves, des enseignants, des classes et des matières",
                  "Enregistrement et suivi des notes et des présences",
                  "Communication interne au sein de la communauté scolaire",
                  "Gestion des horaires, des examens et des devoirs",
                  "Génération de rapports académiques et statistiques",
                  "Gestion des candidatures et des inscriptions"
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

            {/* Section 4 & 5 */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 shadow-sm mb-6">
              <h2 className="flex items-center gap-3 text-xl md:text-2xl mt-0 pb-3 border-b border-zinc-100 dark:border-zinc-800/50">
                <UserCheck className="w-5 h-5 text-zinc-500 shrink-0" />
                4. Compte de l&apos;utilisateur
              </h2>
              <p>
                L&apos;utilisateur est responsable du maintien de la confidentialité de ses identifiants
                d&apos;accès et de toutes les activités menées sur son compte. L&apos;utilisateur
                s&apos;engage à informer immédiatement l&apos;équipe de la Plateforme de toute
                utilisation non autorisée de son compte.
              </p>

              <h2 className="flex items-center gap-3 text-xl md:text-2xl mt-8 pb-3 border-b border-zinc-100 dark:border-zinc-800/50">
                <Lock className="w-5 h-5 text-zinc-500 shrink-0" />
                5. Confidentialité et protection des données
              </h2>
              <p className="mb-0">
                La collecte et le traitement des données personnelles sont effectués conformément à la
                <strong> Loi angolaise sur la protection des données (Loi n° 22/11 du 17 juin)</strong> et au
                Règlement général sur la protection des données (RGPD), le cas échéant. Consultez notre{" "}
                <Link href="/privacidade" className="text-zinc-900 dark:text-white font-medium underline underline-offset-4 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                  Politique de confidentialité
                </Link>{" "}
                pour des informations détaillées.
              </p>
            </div>

            {/* Section 6 & 7 */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 shadow-sm mb-6">
              <h2 className="text-xl md:text-2xl mt-0 pb-3 border-b border-zinc-100 dark:border-zinc-800/50">
                6. Obligations de l&apos;utilisateur
              </h2>
              <ul className="space-y-2 my-4 pl-4 marker:text-zinc-400">
                <li>Fournir des informations précises et à jour.</li>
                <li>Ne pas utiliser la Plateforme à des fins illégales ou non autorisées.</li>
                <li>Ne pas interférer avec le bon fonctionnement technique de la Plateforme.</li>
                <li>Respecter pleinement les droits de propriété intellectuelle.</li>
              </ul>

              <h2 className="text-xl md:text-2xl mt-8 pb-3 border-b border-zinc-100 dark:border-zinc-800/50">
                7. Propriété intellectuelle
              </h2>
              <p className="mb-0">
                Tous les contenus, designs, logos et logiciels de la Plateforme sont la propriété
                exclusive de Cur10usX ou de ses concédants de licence et sont protégés par les lois
                internationales et locales sur la propriété intellectuelle.
              </p>
            </div>

            {/* Section 8 & 9 */}
            <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 shadow-sm mb-6">
              <h2 className="flex items-center gap-3 text-xl md:text-2xl mt-0 pb-3 border-b border-zinc-200 dark:border-zinc-800/50">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                8. Limitation de responsabilité
              </h2>
              <p>
                La Plateforme est fournie &ldquo;en l&apos;état&rdquo;, sans garantie d&apos;aucune sorte,
                expresse ou implicite. Cur10usX ne sera pas responsable des dommages directs,
                indirects, accessoires ou consécutifs découlant de l&apos;utilisation ou de
                l&apos;incapacité d&apos;utiliser la Plateforme.
              </p>

              <h2 className="text-xl md:text-2xl mt-8 pb-3 border-b border-zinc-200 dark:border-zinc-800/50">
                9. Annulation et suspension
              </h2>
              <p className="mb-0">
                Cur10usX se réserve le droit de suspendre ou d&apos;annuler l&apos;accès de tout
                utilisateur qui enfreint ces Conditions d&apos;utilisation, sans préavis.
              </p>
            </div>

            {/* Section 10 & 11 */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 shadow-sm mb-6">
              <h2 className="text-xl md:text-2xl mt-0 pb-3 border-b border-zinc-100 dark:border-zinc-800/50">
                10. Modifications des conditions
              </h2>
              <p>
                Ces Conditions d&apos;utilisation peuvent être modifiées périodiquement. Les utilisateurs
                seront informés des modifications importantes via la Plateforme. L&apos;utilisation
                continue après les modifications constitue l&apos;acceptation des nouvelles conditions.
              </p>

              <h2 className="flex items-center gap-3 text-xl md:text-2xl mt-8 pb-3 border-b border-zinc-100 dark:border-zinc-800/50">
                <Scale className="w-5 h-5 text-zinc-500 shrink-0" />
                11. Loi applicable
              </h2>
              <p className="mb-0">
                Ces Conditions sont régies par les lois de la <strong>République de l&apos;Angola</strong>. Tout litige
                sera soumis à la juridiction exclusive des tribunaux de <strong>Luanda, Angola</strong>.
              </p>
            </div>

            {/* Section 12 */}
            <div className="bg-neutral-900 dark:bg-zinc-900 text-white border border-transparent rounded-2xl p-6 md:p-8 shadow-md text-center">
              <h2 className="flex items-center justify-center gap-3 text-xl md:text-2xl mt-0 mb-3 text-white border-none">
                <Mail className="w-5 h-5 shrink-0" />
                12. Contact commercial et support
              </h2>
              <p className="text-zinc-300 dark:text-zinc-400 text-sm max-w-md mx-auto mb-6">
                Pour toute question, doute ou clarification supplémentaire concernant ces Conditions d&apos;utilisation, veuillez utiliser le canal officiel :
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