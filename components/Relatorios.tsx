"use client"

import { useState, useEffect } from "react"
import { jsPDF } from "jspdf"
import "jspdf-autotable"

interface Aluno {
  id: number
  nome: string
  email: string
  telefone: string
  dataMatricula: string
  valorMensalidade: number
  status: "Ativo" | "Inativo"
  dataProximoPagamento: string
}

export default function Relatorios() {
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [tipoRelatorio, setTipoRelatorio] = useState<"total" | "ativos" | "inativos" | "vencendoHoje">("total")
  const [isDarkMode, setIsDarkMode] = useState(false) // Added state for dark mode

  useEffect(() => {
    const storedAlunos = JSON.parse(localStorage.getItem("alunos") || "[]")
    setAlunos(storedAlunos)
  }, [])

  const filtrarAlunos = () => {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    switch (tipoRelatorio) {
      case "ativos":
        return alunos.filter((aluno) => aluno.status === "Ativo")
      case "inativos":
        return alunos.filter((aluno) => aluno.status === "Inativo")
      case "vencendoHoje":
        return alunos.filter((aluno) => {
          const dataProximoPagamento = new Date(aluno.dataProximoPagamento)
          dataProximoPagamento.setHours(0, 0, 0, 0)
          return dataProximoPagamento.getTime() === hoje.getTime()
        })
      default:
        return alunos
    }
  }

  const generatePDF = () => {
    const doc = new jsPDF()
    const dataAtual = new Date().toLocaleDateString("pt-BR")
    const alunosFiltrados = filtrarAlunos()
    const titulo = `Relatório de Alunos - ${tipoRelatorio.charAt(0).toUpperCase() + tipoRelatorio.slice(1)} - ${dataAtual}`

    doc.setFontSize(18)
    doc.text(titulo, 14, 22)

    const headers = [["Nome", "Email", "Telefone", "Status", "Próximo Pagamento"]]
    const data = alunosFiltrados.map((aluno) => [
      aluno.nome,
      aluno.email,
      aluno.telefone,
      aluno.status,
      aluno.dataProximoPagamento,
    ])

    doc.autoTable({
      head: headers,
      body: data,
      startY: 30,
    })

    doc.save(`relatorio_alunos_${tipoRelatorio}_${dataAtual.replace(/\//g, "-")}.pdf`)
  }

  return (
    <div className="container mx-auto px-4">
      <div className="mb-4">
        <label htmlFor="tipoRelatorio" className="block text-sm font-medium text-gray-700">
          Tipo de Relatório
        </label>
        <select
          id="tipoRelatorio"
          value={tipoRelatorio}
          onChange={(e) => setTipoRelatorio(e.target.value as "total" | "ativos" | "inativos" | "vencendoHoje")}
          className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${isDarkMode ? "bg-gray-700 text-white" : "bg-white text-gray-800"}`}
        >
          <option value="total">Todos os Alunos</option>
          <option value="ativos">Alunos Ativos</option>
          <option value="inativos">Alunos Inativos</option>
          <option value="vencendoHoje">Alunos Vencendo Hoje</option>
        </select>
      </div>
      <button
        onClick={generatePDF}
        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
      >
        Gerar Relatório de Alunos (PDF)
      </button>
    </div>
  )
}

