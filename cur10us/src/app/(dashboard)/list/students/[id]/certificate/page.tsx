"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Loader2, Printer } from "lucide-react"

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function StudentCertificatePage() {
  const { id } = useParams<{ id: string }>()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch(`/api/students/${id}/portfolio`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error)
        else setData(d)
      })
      .catch(() => setError("Erro ao carregar dados"))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="m-4 p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-center">
        <p className="text-zinc-500">{error || "Dados não disponíveis"}</p>
      </div>
    )
  }

  const { student, averages, attendance } = data
  const generalAvg = averages.length > 0
    ? Math.round((averages.reduce((acc: number, a: any) => acc + a.average, 0) / averages.length) * 10) / 10
    : 0
  const today = new Date().toLocaleDateString("pt", { year: "numeric", month: "long", day: "numeric" })

  return (
    <>
      {/* Print button (hidden on print) */}
      <div className="print:hidden m-2 sm:m-3 flex justify-end">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/20"
        >
          <Printer size={16} /> Imprimir
        </button>
      </div>

      {/* Certificate */}
      <div className="m-2 sm:m-3 print:m-0 bg-white dark:bg-zinc-900 print:bg-white border border-zinc-200 dark:border-zinc-800 print:border-2 print:border-zinc-300 rounded-xl sm:rounded-2xl print:rounded-none p-6 sm:p-10 print:p-12 shadow-sm print:shadow-none max-w-4xl mx-auto print:max-w-none print:text-black">
        {/* Header */}
        <div className="text-center border-b-2 border-zinc-200 print:border-zinc-400 pb-6 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 print:text-black">
            {student.school.name}
          </h1>
          {student.school.city && (
            <p className="text-sm text-zinc-500 print:text-zinc-600 mt-1">{student.school.city}</p>
          )}
          <p className="text-lg font-semibold text-indigo-600 print:text-zinc-800 mt-4 uppercase tracking-wider">
            Certificado Escolar
          </p>
        </div>

        {/* Student Info */}
        <div className="mb-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 print:text-zinc-600 mb-3">Dados do Aluno</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div><span className="font-medium text-zinc-600 print:text-zinc-700">Nome:</span> <span className="text-zinc-900 dark:text-zinc-100 print:text-black">{student.name}</span></div>
            {student.class && (
              <div><span className="font-medium text-zinc-600 print:text-zinc-700">Turma:</span> <span className="text-zinc-900 dark:text-zinc-100 print:text-black">{student.class.name} ({student.class.grade}.ª classe)</span></div>
            )}
            {student.gender && (
              <div><span className="font-medium text-zinc-600 print:text-zinc-700">Género:</span> <span className="text-zinc-900 dark:text-zinc-100 print:text-black capitalize">{student.gender}</span></div>
            )}
            {student.dateOfBirth && (
              <div><span className="font-medium text-zinc-600 print:text-zinc-700">Data de Nascimento:</span> <span className="text-zinc-900 dark:text-zinc-100 print:text-black">{new Date(student.dateOfBirth).toLocaleDateString("pt")}</span></div>
            )}
            {student.documentType && student.documentNumber && (
              <div><span className="font-medium text-zinc-600 print:text-zinc-700">{student.documentType}:</span> <span className="text-zinc-900 dark:text-zinc-100 print:text-black">{student.documentNumber}</span></div>
            )}
          </div>
        </div>

        {/* Grades Table */}
        {averages.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 print:text-zinc-600 mb-3">Resultados por Disciplina</h2>
            <table className="w-full text-sm border border-zinc-200 print:border-zinc-400">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800 print:bg-zinc-100">
                  <th className="text-left py-2 px-3 border-b border-zinc-200 print:border-zinc-400 font-semibold text-zinc-600 print:text-zinc-700">Disciplina</th>
                  <th className="text-center py-2 px-3 border-b border-zinc-200 print:border-zinc-400 font-semibold text-zinc-600 print:text-zinc-700">Média</th>
                  <th className="text-center py-2 px-3 border-b border-zinc-200 print:border-zinc-400 font-semibold text-zinc-600 print:text-zinc-700">Avaliações</th>
                </tr>
              </thead>
              <tbody>
                {averages.map((a: any) => (
                  <tr key={a.subjectId} className="border-b border-zinc-100 dark:border-zinc-800 print:border-zinc-300">
                    <td className="py-2 px-3 text-zinc-900 dark:text-zinc-100 print:text-black">{a.subjectName}</td>
                    <td className="py-2 px-3 text-center font-bold text-zinc-900 dark:text-zinc-100 print:text-black">{a.average}</td>
                    <td className="py-2 px-3 text-center text-zinc-500 print:text-zinc-600">{a.count}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-zinc-50 dark:bg-zinc-800 print:bg-zinc-100 font-bold">
                  <td className="py-2 px-3 border-t border-zinc-200 print:border-zinc-400 text-zinc-900 dark:text-zinc-100 print:text-black">Média Geral</td>
                  <td className="py-2 px-3 border-t border-zinc-200 print:border-zinc-400 text-center text-zinc-900 dark:text-zinc-100 print:text-black">{generalAvg}</td>
                  <td className="py-2 px-3 border-t border-zinc-200 print:border-zinc-400" />
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Attendance */}
        {attendance.total > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 print:text-zinc-600 mb-3">Assiduidade</h2>
            <div className="flex gap-6 text-sm">
              <div><span className="font-medium text-zinc-600 print:text-zinc-700">Presença:</span> <span className="font-bold text-zinc-900 dark:text-zinc-100 print:text-black">{attendance.percent}%</span></div>
              <div><span className="text-zinc-500">Presente: {attendance.presente}</span></div>
              <div><span className="text-zinc-500">Atrasado: {attendance.atrasado}</span></div>
              <div><span className="text-zinc-500">Ausente: {attendance.ausente}</span></div>
            </div>
          </div>
        )}

        {/* Signature */}
        <div className="mt-12 pt-8 border-t border-zinc-200 print:border-zinc-400">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="text-center">
              <div className="border-b border-zinc-300 print:border-zinc-500 mb-2 h-12" />
              <p className="text-sm text-zinc-600 print:text-zinc-700">Director(a) / Administrador(a)</p>
            </div>
            <div className="text-center">
              <div className="border-b border-zinc-300 print:border-zinc-500 mb-2 h-12" />
              <p className="text-sm text-zinc-600 print:text-zinc-700">Carimbo da Escola</p>
            </div>
          </div>
          <p className="text-xs text-zinc-400 print:text-zinc-500 text-center mt-6">{student.school.city}, {today}</p>
        </div>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          nav, aside, header, .print\\:hidden { display: none !important; }
          main { padding: 0 !important; margin: 0 !important; }
        }
      `}</style>
    </>
  )
}
