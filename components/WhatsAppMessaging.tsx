'use client'

import { useState, useEffect } from 'react'

interface Aluno {
  id: number
  nome: string
  email: string
  telefone: string
  dataMatricula: string
  valorMensalidade: number
  status: 'Ativo' | 'Inativo'
  dataProximoPagamento: string
}

interface WhatsAppConfig {
  mensagemPadrao: string
}

export default function WhatsAppMessaging() {
  const [config, setConfig] = useState<WhatsAppConfig>({
    mensagemPadrao: 'Olá! Sua mensalidade está vencendo. Por favor, efetue o pagamento.'
  })
  const [grupoSelecionado, setGrupoSelecionado] = useState('todos')
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [alunosSelecionados, setAlunosSelecionados] = useState<Aluno[]>([])

  useEffect(() => {
    const savedConfig = localStorage.getItem('whatsappConfig')
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig))
    }
    //setMensagem(config.mensagemPadrao)

    const storedAlunos = JSON.parse(localStorage.getItem('alunos') || '[]')
    setAlunos(storedAlunos)
  }, [])

  useEffect(() => {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    const filteredAlunos = alunos.filter(aluno => {
      const dataProximoPagamento = new Date(aluno.dataProximoPagamento)
      dataProximoPagamento.setHours(0, 0, 0, 0)

      switch (grupoSelecionado) {
        case 'todos':
          return true
        case 'ativos':
          return aluno.status === 'Ativo'
        case 'inativos':
          return aluno.status === 'Inativo'
        case 'vencendo':
          return dataProximoPagamento.getTime() === hoje.getTime()
        default:
          return false
      }
    })

    setAlunosSelecionados(filteredAlunos)
  }, [grupoSelecionado, alunos])

  const handleConfigChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target
    const newConfig = { ...config, [name]: value }
    setConfig(newConfig)
    localStorage.setItem('whatsappConfig', JSON.stringify(newConfig))
  }


  const handleEnviarMensagem = () => {
    console.log(`Enviando mensagem para ${alunosSelecionados.length} alunos: ${config.mensagemPadrao}`)
    alert('Mensagem enviada com sucesso!')
  }

  const toggleAlunoSelecionado = (aluno: Aluno) => {
    setAlunosSelecionados(prev => 
      prev.find(a => a.id === aluno.id)
        ? prev.filter(a => a.id !== aluno.id)
        : [...prev, aluno]
    )
  }

  return (
    <div className="container mx-auto px-4">
      <h2 className="text-2xl font-bold mb-4">Configuração de Mensagens WhatsApp</h2>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="mensagemPadrao">
          Mensagem Padrão
        </label>
        <textarea
          id="mensagemPadrao"
          name="mensagemPadrao"
          value={config.mensagemPadrao}
          onChange={handleConfigChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          rows={4}
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="grupoSelecionado">
          Grupo de Envio
        </label>
        <select
          id="grupoSelecionado"
          value={grupoSelecionado}
          onChange={(e) => setGrupoSelecionado(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        >
          <option value="todos">Todos os Alunos</option>
          <option value="ativos">Alunos Ativos</option>
          <option value="inativos">Alunos Inativos</option>
          <option value="vencendo">Alunos com Mensalidade Vencendo Hoje</option>
        </select>
      </div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Alunos Selecionados</h3>
        <div className="max-h-60 overflow-y-auto border rounded p-2">
          {alunosSelecionados.map(aluno => (
            <div key={aluno.id} className="flex items-center mb-2">
              <input
                type="checkbox"
                id={`aluno-${aluno.id}`}
                checked={alunosSelecionados.some(a => a.id === aluno.id)}
                onChange={() => toggleAlunoSelecionado(aluno)}
                className="mr-2"
              />
              <label htmlFor={`aluno-${aluno.id}`}>{aluno.nome} - {aluno.telefone}</label>
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={handleEnviarMensagem}
        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
      >
        Enviar Mensagem
      </button>
    </div>
  )
}

