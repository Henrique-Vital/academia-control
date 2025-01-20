"use client"

import { useState, useEffect } from "react"
import { Search, ArrowUpDown, Trash2, Edit } from "lucide-react"

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

export default function AlunosList({ isDarkMode }: { isDarkMode: boolean }) {
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"nome" | "dataProximoPagamento">("nome")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [editingAluno, setEditingAluno] = useState<Aluno | null>(null)
  const [novoAluno, setNovoAluno] = useState<Omit<Aluno, "id">>(() => {
    const hoje = new Date()
    const proximoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, hoje.getDate())
    return {
      nome: "",
      email: "email@padrao.com",
      telefone: "(00) 00000-0000",
      dataMatricula: hoje.toISOString().split("T")[0],
      valorMensalidade: 80,
      status: "Ativo",
      dataProximoPagamento: proximoMes.toISOString().split("T")[0],
      historicoMensalidades: [],
    }
  })
  const [statusFilter, setStatusFilter] = useState<"Todos" | "Ativo" | "Inativo" | "VencendoHoje">("Todos")

  useEffect(() => {
    const storedAlunos = JSON.parse(localStorage.getItem("alunos") || "[]")
    const updatedAlunos = storedAlunos.map(updateAlunoStatus)
    setAlunos(updatedAlunos)
    localStorage.setItem("alunos", JSON.stringify(updatedAlunos))
  }, [])

  const updateAlunoStatus = (aluno: Aluno): Aluno => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const proximoPagamento = new Date(aluno.dataProximoPagamento)
    proximoPagamento.setHours(0, 0, 0, 0)
    const status = today <= proximoPagamento ? "Ativo" : "Inativo"
    return { ...aluno, status }
  }

  const saveAlunos = (newAlunos: Aluno[]) => {
    const updatedAlunos = newAlunos.map(updateAlunoStatus)
    localStorage.setItem("alunos", JSON.stringify(updatedAlunos))
    setAlunos(updatedAlunos)
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    if (editingAluno) {
      setEditingAluno({ ...editingAluno, [name]: name === "valorMensalidade" ? Number.parseFloat(value) : value })
    } else {
      setNovoAluno((prev) => ({ ...prev, [name]: name === "valorMensalidade" ? Number.parseFloat(value) : value }))
    }
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (editingAluno) {
      const updatedAlunos = alunos.map((aluno) => {
        if (aluno.id === editingAluno.id) {
          const novoHistorico = [
            ...aluno.historicoMensalidades,
            { data: editingAluno.dataProximoPagamento, valor: editingAluno.valorMensalidade },
          ]
          return { ...editingAluno, historicoMensalidades: novoHistorico }
        }
        return aluno
      })
      saveAlunos(updatedAlunos)
      setEditingAluno(null)
    } else {
      const novoId = Math.max(...alunos.map((a) => a.id), 0) + 1
      const alunoCompleto = {
        ...novoAluno,
        id: novoId,
        historicoMensalidades: [{ data: novoAluno.dataMatricula, valor: novoAluno.valorMensalidade }],
      }
      saveAlunos([...alunos, alunoCompleto])
    }
    setShowModal(false)
    setNovoAluno({
      nome: "",
      email: "email@padrao.com",
      telefone: "(00) 00000-0000",
      dataMatricula: new Date().toISOString().split("T")[0],
      valorMensalidade: 80,
      status: "Ativo",
      dataProximoPagamento: new Date(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate())
        .toISOString()
        .split("T")[0],
      historicoMensalidades: [],
    })
  }

  const handleDelete = (id: number) => {
    const updatedAlunos = alunos.filter((aluno) => aluno.id !== id)
    saveAlunos(updatedAlunos)
  }

  const handleEdit = (aluno: Aluno) => {
    setEditingAluno(aluno)
    setShowModal(true)
  }

  const handleSort = (key: "nome" | "dataProximoPagamento") => {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(key)
      setSortOrder("asc")
    }
  }

  const filteredAlunos = alunos
    .filter((aluno) => {
      const hoje = new Date()
      hoje.setHours(0, 0, 0, 0)
      const dataProximoPagamento = new Date(aluno.dataProximoPagamento)
      dataProximoPagamento.setHours(0, 0, 0, 0)

      return (
        (aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          aluno.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (statusFilter === "Todos" ||
          (statusFilter === "Ativo" && aluno.status === "Ativo") ||
          (statusFilter === "Inativo" && aluno.status === "Inativo") ||
          (statusFilter === "VencendoHoje" && dataProximoPagamento.getTime() === hoje.getTime()))
      )
    })
    .sort((a, b) => {
      if (sortBy === "nome") {
        return sortOrder === "asc" ? a.nome.localeCompare(b.nome) : b.nome.localeCompare(a.nome)
      } else {
        return sortOrder === "asc"
          ? new Date(a.dataProximoPagamento).getTime() - new Date(b.dataProximoPagamento).getTime()
          : new Date(b.dataProximoPagamento).getTime() - new Date(a.dataProximoPagamento).getTime()
      }
    })

  const handleCancelCadastro = () => {
    if (window.confirm("Tem certeza que deseja cancelar o cadastro?")) {
      setShowModal(false)
      setEditingAluno(null)
      setNovoAluno({
        nome: "",
        email: "email@padrao.com",
        telefone: "(00) 00000-0000",
        dataMatricula: new Date().toISOString().split("T")[0],
        valorMensalidade: 80,
        status: "Ativo",
        dataProximoPagamento: "",
        historicoMensalidades: [],
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          Adicionar Aluno
        </button>
        <div className="flex items-center space-x-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "Todos" | "Ativo" | "Inativo" | "VencendoHoje")}
            className={`input ${isDarkMode ? "bg-gray-700 text-white" : "bg-white text-gray-800"}`}
          >
            <option value="Todos">Todos os Status</option>
            <option value="Ativo">Ativo</option>
            <option value="Inativo">Inativo</option>
            <option value="VencendoHoje">Vencendo Hoje</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "nome" | "dataProximoPagamento")}
            className={`input ${isDarkMode ? "bg-gray-700 text-white" : "bg-white text-gray-800"}`}
          >
            <option value="nome">Ordenar por Nome</option>
            <option value="dataProximoPagamento">Ordenar por Data de Vencimento</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className={`btn ${isDarkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-white hover:bg-gray-100"}`}
          >
            {sortOrder === "asc" ? "Crescente" : "Decrescente"}
          </button>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Pesquisar alunos..."
            className={`input pl-10 ${isDarkMode ? "bg-gray-700 text-white" : "bg-white text-gray-800"}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>
      <div className={`overflow-x-auto shadow-md rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
        <table className="min-w-full">
          <thead className={`${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`}>
            <tr>
              <th className="py-3 px-4 text-left cursor-pointer" onClick={() => handleSort("nome")}>
                Nome {sortBy === "nome" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th className="py-3 px-4 text-left">Email</th>
              <th className="py-3 px-4 text-left">Telefone</th>
              <th className="py-3 px-4 text-left">Data de Matrícula</th>
              <th className="py-3 px-4 text-left">Valor da Mensalidade</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left cursor-pointer" onClick={() => handleSort("dataProximoPagamento")}>
                Próximo Pagamento {sortBy === "dataProximoPagamento" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th className="py-3 px-4 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredAlunos.map((aluno) => (
              <tr key={aluno.id} className={`border-b ${aluno.status === "Inativo" ? "bg-red-100" : ""}`}>
                <td className="py-3 px-4">{aluno.nome}</td>
                <td className="py-3 px-4">{aluno.email}</td>
                <td className="py-3 px-4">{aluno.telefone}</td>
                <td className="py-3 px-4">{aluno.dataMatricula}</td>
                <td className="py-3 px-4">R$ {aluno.valorMensalidade.toFixed(2)}</td>
                <td className="py-3 px-4">{aluno.status}</td>
                <td className="py-3 px-4">{aluno.dataProximoPagamento}</td>
                <td className="py-3 px-4">
                  <button onClick={() => handleEdit(aluno)} className="text-blue-500 hover:text-blue-700 mr-2">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDelete(aluno.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {editingAluno ? "Editar Aluno" : "Adicionar Novo Aluno"}
              </h3>
              <form onSubmit={handleSubmit} className="mt-2 text-left">
                <div className="mb-4">
                  <label htmlFor="nome" className="block text-gray-700 text-sm font-bold mb-2">
                    Nome
                  </label>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    value={editingAluno ? editingAluno.nome : novoAluno.nome}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={editingAluno ? editingAluno.email : novoAluno.email}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="telefone" className="block text-gray-700 text-sm font-bold mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    id="telefone"
                    name="telefone"
                    value={editingAluno ? editingAluno.telefone : novoAluno.telefone}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="dataMatricula" className="block text-gray-700 text-sm font-bold mb-2">
                    Data de Matrícula
                  </label>
                  <input
                    type="date"
                    id="dataMatricula"
                    name="dataMatricula"
                    value={editingAluno ? editingAluno.dataMatricula : novoAluno.dataMatricula}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="valorMensalidade" className="block text-gray-700 text-sm font-bold mb-2">
                    Valor da Mensalidade
                  </label>
                  <input
                    type="number"
                    id="valorMensalidade"
                    name="valorMensalidade"
                    value={editingAluno ? editingAluno.valorMensalidade : novoAluno.valorMensalidade}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                    step="0.01"
                    min="0"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="dataProximoPagamento" className="block text-gray-700 text-sm font-bold mb-2">
                    Data do Próximo Pagamento
                  </label>
                  <input
                    type="date"
                    id="dataProximoPagamento"
                    name="dataProximoPagamento"
                    value={editingAluno ? editingAluno.dataProximoPagamento : novoAluno.dataProximoPagamento}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                <div className="flex items-center justify-between mt-4">
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    {editingAluno ? "Atualizar" : "Adicionar"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelCadastro}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

