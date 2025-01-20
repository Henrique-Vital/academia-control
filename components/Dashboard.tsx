"use client"

import { useState, useEffect } from "react"
import { Bar } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface Aluno {
  id: number
  nome: string
  email: string
  telefone: string
  dataMatricula: string
  valorMensalidade: number
  status: "Ativo" | "Inativo"
  dataProximoPagamento: string
  historicoMensalidades: { data: string; valor: number }[]
}

export default function Dashboard() {
  const [totalAlunos, setTotalAlunos] = useState(0)
  const [alunosInativos, setAlunosInativos] = useState(0)
  const [receitaMensal, setReceitaMensal] = useState(0)
  const [receitaAnual, setReceitaAnual] = useState<number[]>([])

  useEffect(() => {
    const alunos: Aluno[] = JSON.parse(localStorage.getItem("alunos") || "[]")

    setTotalAlunos(alunos.length)

    const inativos = alunos.filter((aluno) => aluno.status === "Inativo")
    setAlunosInativos(inativos.length)

    const hoje = new Date()
    const mesAtual = hoje.getMonth()
    const anoAtual = hoje.getFullYear()

    const receitasPorMes = Array(12).fill(0)

    alunos.forEach((aluno) => {
      const historicoCompleto = [
        { data: aluno.dataMatricula, valor: aluno.valorMensalidade },
        ...(aluno.historicoMensalidades || []),
      ]

      historicoCompleto.forEach((pagamento) => {
        const dataPagamento = new Date(pagamento.data)
        if (dataPagamento.getFullYear() === anoAtual) {
          receitasPorMes[dataPagamento.getMonth()] += pagamento.valor
        }
      })
    })

    setReceitaMensal(receitasPorMes[mesAtual])
    setReceitaAnual(receitasPorMes)
  }, [])

  const chartData = {
    labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
    datasets: [
      {
        label: "Receita Mensal",
        data: receitaAnual,
        backgroundColor: "rgba(56, 189, 248, 0.6)",
        borderColor: "rgba(56, 189, 248, 1)",
        borderWidth: 1,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "white",
        },
      },
      title: {
        display: true,
        text: "Receita Anual",
        color: "white",
      },
    },
    scales: {
      y: {
        ticks: { color: "white" },
      },
      x: {
        ticks: { color: "white" },
      },
    },
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-r from-blue-500 to-blue-600">
          <h3 className="text-lg font-semibold mb-1">Total de Alunos</h3>
          <p className="text-3xl font-bold">{totalAlunos}</p>
        </div>
        <div className="card bg-gradient-to-r from-yellow-500 to-yellow-600">
          <h3 className="text-lg font-semibold mb-1">Alunos Inativos</h3>
          <p className="text-3xl font-bold">{alunosInativos}</p>
        </div>
        <div className="card bg-gradient-to-r from-green-500 to-green-600">
          <h3 className="text-lg font-semibold mb-1">Receita Mensal</h3>
          <p className="text-3xl font-bold">R$ {receitaMensal.toFixed(2)}</p>
        </div>
      </div>
      <div className="card h-[300px]">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  )
}

