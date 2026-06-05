import { getServerLocale } from "@/lib/i18n/server"

export default async function PrivacyPage() {
  const locale = await getServerLocale()

  if (locale === "en") {
    return (
      <article className="prose prose-zinc dark:prose-invert max-w-none">
        <h1>Privacy Policy</h1>
        <p className="text-sm text-zinc-500">Last updated: May 2026</p>

        <h2>1. Introduction</h2>
        <p>
          Cur10usX (&ldquo;we&rdquo;, &ldquo;our&rdquo; or &ldquo;Platform&rdquo;) is committed to protecting
          the privacy of its users. This Privacy Policy explains how
          we collect, use, share, and protect your personal data when
          you use our school management platform.
        </p>

        <h2>2. Data We Collect</h2>
        <p>We may collect the following types of personal data:</p>
        <ul>
          <li><strong>Identification data:</strong> full name, email, phone number, address</li>
          <li><strong>Academic data:</strong> grades, evaluations, attendance, class, subject</li>
          <li><strong>Demographic data:</strong> gender, date of birth</li>
          <li><strong>Access data:</strong> IP address, browser type, activity logs</li>
          <li><strong>Documents:</strong> profile picture, school identification documents</li>
        </ul>

        <h2>3. Purpose of Processing</h2>
        <p>The collected data is intended for the following purposes:</p>
        <ul>
          <li>School system management and administration</li>
          <li>Communication between school community members</li>
          <li>Generation of academic reports and statistics</li>
          <li>Compliance with legal and regulatory obligations</li>
          <li>Improvement of the Platform services</li>
        </ul>

        <h2>4. Legal Basis for Processing</h2>
        <p>The processing of your data is based on the following legal bases:</p>
        <ul>
          <li><strong>Consent:</strong> when you provide your data voluntarily</li>
          <li><strong>Legal obligation:</strong> to comply with applicable legal requirements</li>
          <li><strong>Legitimate interest:</strong> to improve and manage the Platform</li>
          <li><strong>Contract performance:</strong> to provide the contracted services</li>
        </ul>

        <h2>5. Data Sharing</h2>
        <p>
          We do not sell your personal data to third parties. We may share data with:
        </p>
        <ul>
          <li><strong>Schools:</strong> data is shared with the school to which you are associated</li>
          <li><strong>Service providers:</strong> hosting, email sending, and storage services</li>
          <li><strong>Legal authorities:</strong> when required by law</li>
        </ul>

        <h2>6. Data Security</h2>
        <p>
          We implement appropriate technical and organizational security measures to
          protect your data against unauthorized access, alteration, disclosure, or
          destruction, including password encryption, HTTPS in all communications,
          and role-based access control.
        </p>

        <h2>7. Data Retention</h2>
        <p>
          We retain your personal data for the period necessary to fulfill the
          purposes described in this policy, unless a longer retention period is
          required or permitted by law. Academic data is kept during the period
          the school operates on the Platform.
        </p>

        <h2>8. Your Rights</h2>
        <p>According to applicable legislation, you have the following rights:</p>
        <ul>
          <li><strong>Access:</strong> request a copy of your personal data</li>
          <li><strong>Rectification:</strong> request the correction of inaccurate data</li>
          <li><strong>Erasure:</strong> request the deletion of your data (&ldquo;right to be forgotten&rdquo;)</li>
          <li><strong>Portability:</strong> request the transfer of your data to another entity</li>
          <li><strong>Objection:</strong> object to the processing of your data for specific purposes</li>
        </ul>

        <h2>9. Cookies</h2>
        <p>
          We use essential cookies for the operation of the Platform, including
          authentication cookies (session tokens) and security cookies (CSRF tokens).
          We do not use tracking or advertising cookies.
        </p>

        <h2>10. Data of Minors</h2>
        <p>
          The Platform may contain data of minors (students) provided by schools and
          their legal guardians. The processing is carried out within the scope of
          educational activity and with the consent of legal guardians.
        </p>

        <h2>11. International Transfers</h2>
        <p>
          Your data may be stored and processed on servers located outside of Angola,
          namely in the European Union. We ensure that all transfers are carried out
          in compliance with applicable law.
        </p>

        <h2>12. Changes to This Policy</h2>
        <p>
          This Privacy Policy may be updated periodically. Changes will be communicated
          through the Platform. We recommend periodic review of this policy.
        </p>

        <h2>13. Data Protection Officer Contact</h2>
        <p>
          To exercise your rights or clarify doubts about this Privacy Policy,
          contact us at the email: privacidade@cur10usx.com
        </p>
      </article>
    )
  }

  if (locale === "fr") {
    return (
      <article className="prose prose-zinc dark:prose-invert max-w-none">
        <h1>Politique de confidentialité</h1>
        <p className="text-sm text-zinc-500">Dernière mise à jour : Mai 2026</p>

        <h2>1. Introduction</h2>
        <p>
          Cur10usX (&ldquo;nous&rdquo;, &ldquo;notre&rdquo; ou &ldquo;Plateforme&rdquo;) s'engage à protéger
          la confidentialité de ses utilisateurs. Cette Politique de confidentialité explique comment
          nous collectons, utilisons, partageons et protégeons vos données personnelles lorsque
          vous utilisez notre plateforme de gestion scolaire.
        </p>

        <h2>2. Données que nous collectons</h2>
        <p>Nous pouvons collecter les types de données personnelles suivants :</p>
        <ul>
          <li><strong>Données d'identification :</strong> nom complet, e-mail, numéro de téléphone, adresse</li>
          <li><strong>Données académiques :</strong> notes, évaluations, présences, classe, matière</li>
          <li><strong>Données démographiques :</strong> genre, date de naissance</li>
          <li><strong>Données d'accès :</strong> adresse IP, type de navigateur, journaux d'activité</li>
          <li><strong>Documents :</strong> photo de profil, documents d'identification scolaire</li>
        </ul>

        <h2>3. Finalité du traitement</h2>
        <p>Les données collectées sont destinées aux finalités suivantes :</p>
        <ul>
          <li>Gestion et administration du système scolaire</li>
          <li>Communication entre les membres de la communauté scolaire</li>
          <li>Génération de rapports académiques et statistiques</li>
          <li>Respect des obligations légales et réglementaires</li>
          <li>Amélioration des services de la Plateforme</li>
        </ul>

        <h2>4. Base légale pour le traitement</h2>
        <p>Le traitement de vos données repose sur les bases légales suivantes :</p>
        <ul>
          <li><strong>Consentement :</strong> lorsque vous fournissez vos données volontairement</li>
          <li><strong>Obligation légale :</strong> pour se conformer aux exigences légales applicables</li>
          <li><strong>Intérêt légitime :</strong> pour améliorer et gérer la Plateforme</li>
          <li><strong>Exécution d'un contrat :</strong> pour fournir les services contractés</li>
        </ul>

        <h2>5. Partage des données</h2>
        <p>
          Nous ne vendons pas vos données personnelles à des tiers. Nous pouvons partager des données avec :
        </p>
        <ul>
          <li><strong>Écoles :</strong> les données sont partagées avec l'école à laquelle vous êtes associé</li>
          <li><strong>Prestataires de services :</strong> services d'hébergement, d'envoi d'e-mails et de stockage</li>
          <li><strong>Autorités légales :</strong> lorsque la loi l'exige</li>
        </ul>

        <h2>6. Sécurité des données</h2>
        <p>
          Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour
          protéger vos données contre tout accès non autorisé, altération, divulgation ou
          destruction, y compris le cryptage des mots de passe, le HTTPS dans toutes les communications,
          et le contrôle d'accès basé sur les rôles.
        </p>

        <h2>7. Rétention des données</h2>
        <p>
          Nous conservons vos données personnelles pendant la période nécessaire pour remplir les
          finalités décrites dans cette politique, à moins qu'une période de rétention plus longue
          ne soit requise ou autorisée par la loi. Les données académiques sont conservées pendant la période
          de fonctionnement de l'école sur la Plateforme.
        </p>

        <h2>8. Vos droits</h2>
        <p>Conformément à la législation applicable, vous disposez des droits suivants :</p>
        <ul>
          <li><strong>Accès :</strong> demander une copie de vos données personnelles</li>
          <li><strong>Rectification :</strong> demander la correction de données inexactes</li>
          <li><strong>Suppression :</strong> demander la suppression de vos données (&ldquo;droit à l'oubli&rdquo;)</li>
          <li><strong>Portabilité :</strong> demander le transfert de vos données vers une autre entité</li>
          <li><strong>Opposition :</strong> s'opposer au traitement de vos données à des fins spécifiques</li>
        </ul>

        <h2>9. Cookies</h2>
        <p>
          Nous utilisons des cookies essentiels au fonctionnement de la Plateforme, y compris
          des cookies d'authentification (jetons de session) et des cookies de sécurité (jetons CSRF).
          Nous n'utilisons pas de cookies de suivi ou publicitaires.
        </p>

        <h2>10. Données des mineurs</h2>
        <p>
          La Plateforme peut contenir des données de mineurs (élèves) fournies par les écoles et
          par leurs tuteurs légaux. Le traitement est effectué dans le cadre de l'activité
          éducative et avec le consentement des tuteurs légaux.
        </p>

        <h2>11. Transferts internationaux</h2>
        <p>
          Vos données peuvent être stockées et traitées sur des serveurs situés en dehors de l'Angola,
          notamment dans l'Union européenne. Nous veillons à ce que tous les transferts soient effectués
          conformément à la loi applicable.
        </p>

        <h2>12. Modifications de cette politique</h2>
        <p>
          Cette Politique de confidentialité peut être mise à jour périodiquement. Les modifications
          seront communiquées via la Plateforme. Nous vous recommandons de consulter régulièrement cette politique.
        </p>

        <h2>13. Contact du délégué à la protection des données</h2>
        <p>
          Pour exercer vos droits ou clarifier des doutes sur cette Politique de
          confidentialité, contactez-nous par e-mail : privacidade@cur10usx.com
        </p>
      </article>
    )
  }

  return (
    <article className="prose prose-zinc dark:prose-invert max-w-none">
      <h1>Política de Privacidade</h1>
      <p className="text-sm text-zinc-500">Última atualização: Maio de 2026</p>

      <h2>1. Introdução</h2>
      <p>
        A Cur10usX (&ldquo;nós&rdquo;, &ldquo;nosso&rdquo; ou &ldquo;Plataforma&rdquo;) está comprometida com a proteção
        da privacidade dos seus utilizadores. Esta Política de Privacidade explica como
        recolhemos, usamos, partilhamos e protegemos os seus dados pessoais quando
        utiliza a nossa plataforma de gestão escolar.
      </p>

      <h2>2. Dados que Recolhemos</h2>
      <p>Podemos recolher os seguintes tipos de dados pessoais:</p>
      <ul>
        <li><strong>Dados de identificação:</strong> nome completo, e-mail, número de telefone, endereço</li>
        <li><strong>Dados académicos:</strong> notas, avaliações, assiduidade, turma, disciplina</li>
        <li><strong>Dados demográficos:</strong> género, data de nascimento</li>
        <li><strong>Dados de acesso:</strong> endereço IP, tipo de navegador, registos de atividade</li>
        <li><strong>Documentos:</strong> fotografia de perfil, documentos de identificação escolar</li>
      </ul>

      <h2>3. Finalidade do Tratamento</h2>
      <p>Os dados recolhidos destinam-se às seguintes finalidades:</p>
      <ul>
        <li>Gestão e administração do sistema escolar</li>
        <li>Comunicação entre membros da comunidade escolar</li>
        <li>Geração de relatórios académicos e estatísticas</li>
        <li>Cumprimento de obrigações legais e regulamentares</li>
        <li>Melhoria dos serviços da Plataforma</li>
      </ul>

      <h2>4. Base Legal para o Tratamento</h2>
      <p>O tratamento dos seus dados baseia-se nas seguintes bases legais:</p>
      <ul>
        <li><strong>Consentimento:</strong> quando fornece os seus dados voluntariamente</li>
        <li><strong>Obrigação legal:</strong> para cumprir requisitos legais aplicáveis</li>
        <li><strong>Interesse legítimo:</strong> para melhorar e gerir a Plataforma</li>
        <li><strong>Execução de contrato:</strong> para prestar os serviços contratados</li>
      </ul>

      <h2>5. Partilha de Dados</h2>
      <p>
        Não vendemos os seus dados pessoais a terceiros. Podemos partilhar dados com:
      </p>
      <ul>
        <li><strong>Escolas:</strong> os dados são partilhados com a escola à qual está associado</li>
        <li><strong>Prestadores de serviço:</strong> serviços de hospedagem, envio de e-mails e armazenamento</li>
        <li><strong>Autoridades legais:</strong> quando exigido por lei</li>
      </ul>

      <h2>6. Segurança dos Dados</h2>
      <p>
        Implementamos medidas de segurança técnicas e organizacionais adequadas para
        proteger os seus dados contra acesso não autorizado, alteração, divulgação ou
        destruição, incluindo encriptação de passwords, HTTPS em todas as comunicações
        e controlo de acesso baseado em perfis.
      </p>

      <h2>7. Retenção de Dados</h2>
      <p>
        Mantemos os seus dados pessoais pelo período necessário para cumprir as
        finalidades descritas nesta política, a menos que um período de retenção mais
        longo seja exigido ou permitido por lei. Os dados académicos são mantidos
        durante o período de funcionamento da escola na Plataforma.
      </p>

      <h2>8. Os Seus Direitos</h2>
      <p>De acordo com a legislação aplicável, tem os seguintes direitos:</p>
      <ul>
        <li><strong>Acesso:</strong> solicitar uma cópia dos seus dados pessoais</li>
        <li><strong>Retificação:</strong> solicitar a correção de dados inexatos</li>
        <li><strong>Eliminação:</strong> solicitar a eliminação dos seus dados (&ldquo;direito ao esquecimento&rdquo;)</li>
        <li><strong>Portabilidade:</strong> solicitar a transferência dos seus dados para outra entidade</li>
        <li><strong>Oposição:</strong> opor-se ao tratamento dos seus dados para determinadas finalidades</li>
      </ul>

      <h2>9. Cookies</h2>
      <p>
        Utilizamos cookies essenciais para o funcionamento da Plataforma, incluindo
        cookies de autenticação (session tokens) e cookies de segurança (CSRF tokens).
        Não utilizamos cookies de rastreio ou publicitários.
      </p>

      <h2>10. Dados de Menores</h2>
      <p>
        A Plataforma pode conter dados de menores (alunos) fornecidos pelas escolas e
        pelos seus responsáveis legais. O tratamento é realizado no âmbito da atividade
        educativa e com o consentimento dos responsáveis legais.
      </p>

      <h2>11. Transferências Internacionais</h2>
      <p>
        Os seus dados podem ser armazenados e processados em servidores localizados fora
        de Angola, nomeadamente na União Europeia. Garantimos que todas as transferências
        são realizadas em conformidade com a lei aplicável.
      </p>

      <h2>12. Alterações a Esta Política</h2>
      <p>
        Esta Política de Privacidade pode ser atualizada periodicamente. As alterações
        serão comunicadas através da Plataforma. Recomendamos a revisão periódica
        desta política.
      </p>

      <h2>13. Contacto do Encarregado de Proteção de Dados</h2>
      <p>
        Para exercer os seus direitos ou esclarecer dúvidas sobre esta Política de
        Privacidade, contacte-nos através do e-mail: privacidade@cur10usx.com
      </p>
    </article>
  )
}
