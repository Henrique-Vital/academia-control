'use client'

import { useState, useEffect } from 'react'
import { Save, Send } from 'lucide-react'

interface WhatsAppConfig {
  accountSid: string
  authToken: string
  twilioPhoneNumber: string
  defaultMessage: string
}

interface Aluno {
  id: number
  nome: string
  telefone: string
  status: 'Ativo' | 'Inativo'
  dataProximoPagamento: string
}

export default function WhatsAppConfig() {
  const [config, setConfig] = useState<WhatsAppConfig>({
    accountSid: '',
    authToken: '',
    twilioPhoneNumber: '',
    defaultMessage: 'Olá! Sua mensalidade está vencendo. Por favor, efetue o pagamento.'
  })
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [selectedAlunos, setSelectedAlunos] = useState<number[]>([])
  const [message, setMessage] = useState('')
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Ativo' | 'Inativo' | 'VencendoHoje'>('Todos')

  useEffect(() => {
    const savedConfig = localStorage.getItem('whatsappConfig')
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig))
    }

    const storedAlunos = JSON.parse(localStorage.getItem('alunos') || '[]')
    setAlunos(storedAlunos)
  }, [])

  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setConfig(prev => ({ ...prev, [name]: value }))
  }

  const saveConfig = () => {
    localStorage.setItem('whatsappConfig', JSON.stringify(config))
    alert('Configuração salva com sucesso!')
  }

  const handleAlunoSelection = (alunoId: number) => {
    setSelectedAlunos(prev => 
      prev.includes(alunoId) 
        ? prev.filter(id => id !== alunoId)
        : [...prev, alunoId]
    )
  }

  const filteredAlunos = alunos.filter(aluno => {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const dataProximoPagamento = new Date(aluno.dataProximoPagamento)
    dataProximoPagamento.setHours(0, 0, 0, 0)
    
    return (statusFilter === 'Todos' || 
      (statusFilter === 'Ativo' && aluno.status === 'Ativo') ||
      (statusFilter === 'Inativo' && aluno.status === 'Inativo') ||
      (statusFilter === 'VencendoHoje' && dataProximoPagamento.getTime() === hoje.getTime()))
  })

  const sendMessages = async () => {
    const alunosToMessage = alunos.filter(aluno => selectedAlunos.includes(aluno.id))
    
    for (const aluno of alunosToMessage) {
      try {
        const response = await fetch('/api/send-whatsapp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: aluno.telefone,
            body: message || config.defaultMessage,
            accountSid: config.accountSid,
            authToken: config.authToken,
            twilioPhoneNumber: config.twilioPhoneNumber,
          }),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        console.log(`Mensagem enviada com sucesso para ${aluno.nome}`)
      } catch (error) {
        console.error(`Erro ao enviar mensagem para ${aluno.nome}:`, error)
      }
    }

    alert('Processo de envio de mensagens concluído!')
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4 gradient-text">Configuração do WhatsApp (Twilio)</h2>
      
      <div className="card space-y-4">
        <div>
          <label className="label" htmlFor="accountSid">
            Account SID
          </label>
          <input
            id="accountSid"
            name="accountSid"
            type="text"
            value={config.accountSid}
            onChange={handleConfigChange}
            className="input"
            placeholder="Insira seu Twilio Account SID"
          />
          <p className="text-sm text-gray-400 mt-1">
            Encontre seu Account SID no painel de controle do Twilio.
          </p>
        </div>

        <div>
          <label className="label" htmlFor="authToken">
            Auth Token
          </label>
          <input
            id="authToken"
            name="authToken"
            type="password"
            value={config.authToken}
            onChange={handleConfigChange}
            className="input"
            placeholder="Insira seu Twilio Auth Token"
          />
          <p className="text-sm text-gray-400 mt-1">
            Encontre seu Auth Token no painel de controle do Twilio. Mantenha-o seguro.
          </p>
        </div>

        <div>
          <label className="label" htmlFor="twilioPhoneNumber">
            Número de Telefone do Twilio
          </label>
          <input
            id="twilioPhoneNumber"
            name="twilioPhoneNumber"
            type="text"
            value={config.twilioPhoneNumber}
            onChange={handleConfigChange}
            className="input"
            placeholder="+1234567890"
          />
          <p className="text-sm text-gray-400 mt-1">
            Este é o número do WhatsApp fornecido pelo Twilio para enviar mensagens.
          </p>
        </div>

        <div>
          <label className="label" htmlFor="defaultMessage">
            Mensagem Padrão
          </label>
          <textarea
            id="defaultMessage"
            name="defaultMessage"
            value={config.defaultMessage}
            onChange={handleConfigChange}
            className="input"
            rows={4}
            placeholder="Digite a mensagem padrão aqui"
          />
        </div>

        <button
          onClick={saveConfig}
          className="btn btn-primary flex items-center"
        >
          <Save className="mr-2" />
          Salvar Configuração
        </button>
      </div>

      <h3 className="text-xl font-bold mt-8 mb-4 gradient-text">Enviar Mensagens</h3>

      <div className="card space-y-4">
        <div>
          <label className="label" htmlFor="statusFilter">
            Filtrar Alunos
          </label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'Todos' | 'Ativo' | 'Inativo' | 'VencendoHoje')}
            className="input"
          >
            <option value="Todos">Todos os Alunos</option>
            <option value="Ativo">Alunos Ativos</option>
            <option value="Inativo">Alunos Inativos</option>
            <option value="VencendoHoje">Alunos com Mensalidade Vencendo Hoje</option>
          </select>
        </div>

        <div>
          <label className="label">
            Selecionar Alunos
          </label>
          <div className="max-h-60 overflow-y-auto border border-gray-700 rounded p-2">
            {filteredAlunos.map(aluno => (
              <div key={aluno.id} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id={`aluno-${aluno.id}`}
                  checked={selectedAlunos.includes(aluno.id)}
                  onChange={() => handleAlunoSelection(aluno.id)}
                  className="mr-2"
                />
                <label htmlFor={`aluno-${aluno.id}`}>{aluno.nome} - {aluno.telefone}</label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="label" htmlFor="message">
            Mensagem Personalizada (opcional)
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="input"
            rows={4}
            placeholder="Digite uma mensagem personalizada ou deixe em branco para usar a mensagem padrão"
          />
        </div>

        <button
          onClick={sendMessages}
          className="btn btn-primary flex items-center"
        >
          <Send className="mr-2" />
          Enviar Mensagens
        </button>
      </div>
    </div>
  )
}

