"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  LayoutDashboardIcon,
  UsersIcon,
  MessageCircleIcon,
  FileTextIcon,
  LogOutIcon,
  SunIcon,
  MoonIcon,
} from "lucide-react"
import Dashboard from "../components/Dashboard"
import AlunosList from "../components/AlunosList"
import WhatsAppConfig from "../components/WhatsAppConfig"
import Relatorios from "../components/Relatorios"
import React from "react"

const menuItems = [
  { text: "Dashboard", icon: LayoutDashboardIcon, component: Dashboard },
  { text: "Alunos", icon: UsersIcon, component: AlunosList },
  { text: "WhatsApp", icon: MessageCircleIcon, component: WhatsAppConfig },
  { text: "Relatórios", icon: FileTextIcon, component: Relatorios },
]

export default function Home() {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isDarkMode, setIsDarkMode] = useState(true)

  useEffect(() => {
    const savedMode = localStorage.getItem("colorMode")
    setIsDarkMode(savedMode === "dark")
  }, [])

  const toggleColorMode = () => {
    setIsDarkMode(!isDarkMode)
    localStorage.setItem("colorMode", isDarkMode ? "light" : "dark")
  }

  const handleExit = () => {
    if (typeof window !== "undefined" && window.electron) {
      window.electron.closeApp()
    } else {
      console.log("Função de fechar aplicativo não disponível")
    }
  }

  return (
    <div
      className={`flex h-screen ${isDarkMode ? "bg-gradient-to-br from-gray-900 to-black text-white" : "bg-gradient-to-br from-gray-100 to-white text-gray-800"}`}
    >
      <nav
        className={`w-56 h-full overflow-y-auto glassmorphism m-4 rounded-xl flex flex-col justify-between ${isDarkMode ? "text-white" : "text-gray-800"}`}
      >
        <div>
          <div className="p-6">
            <h1 className="text-4xl font-black gradient-text mb-6">GYM</h1>
          </div>
          <ul className="space-y-2">
            {menuItems.map((item, index) => (
              <li key={item.text}>
                <Link
                  href="#"
                  onClick={() => setSelectedIndex(index)}
                  className={`flex items-center p-3 rounded-lg transition-all duration-300 ${selectedIndex === index ? "bg-blue-500 neon-border" : "hover:bg-gray-800"}`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  <span className="font-medium">{item.text}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="p-4 space-y-2">
          <button
            onClick={toggleColorMode}
            className="flex items-center justify-center w-full py-2 px-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all duration-300"
          >
            {isDarkMode ? <SunIcon className="mr-2 h-5 w-5" /> : <MoonIcon className="mr-2 h-5 w-5" />}
            <span className="font-medium">{isDarkMode ? "Modo Claro" : "Modo Escuro"}</span>
          </button>
          <button
            onClick={handleExit}
            className="flex items-center justify-center w-full py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300"
          >
            <LogOutIcon className="mr-2 h-5 w-5" />
            <span className="font-medium">Sair do Sistema</span>
          </button>
        </div>
      </nav>
      <main className="flex-1 p-4 overflow-auto">
        <header className="glassmorphism mb-6 p-4 rounded-xl">
          <h2 className="text-2xl font-bold gradient-text">{menuItems[selectedIndex].text}</h2>
        </header>
        <div className="glassmorphism p-6 rounded-xl overflow-auto" style={{ maxHeight: "calc(100vh - 140px)" }}>
          {menuItems[selectedIndex].component &&
            React.createElement(menuItems[selectedIndex].component, { isDarkMode })}
        </div>
      </main>
    </div>
  )
}

