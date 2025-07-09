"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"

export default function Profile() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main content */}
      <div className="ml-64">
        <Header title="Perfil do Usuário" setSidebarOpen={setSidebarOpen} />

        <main className="p-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Informações do Usuário</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Detalhes pessoais e configurações da conta.</p>
              </div>
              <div className="border-t border-gray-200">
                <dl>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Nome Completo</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">John Doe</dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">john.doe@example.com</dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Telefone</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">(11) 99999-9999</dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Sobre</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      Fugiat ipsum ipsum deserunt culpa aute sint do nostrud anim incididunt cillum culpa consequat.
                      Excepteur qui ipsum aliquip voluptate voluptate irure.
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Anexos</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                        <li className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                          <div className="w-0 flex-1 flex items-center">
                            <svg
                              className="flex-shrink-0 h-5 w-5 text-gray-400"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path
                                fillRule="evenodd"
                                d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a3 3 0 00-3-3H8zm-2 2H7a1 1 0 011 1v4a3 3 0 01-6 0V7a1 1 0 011-1zm8 0H13a1 1 0 011 1v4a3 3 0 01-6 0V7a1 1 0 011-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="ml-2 flex-1 w-0 truncate">curriculum_vitae.pdf</span>
                          </div>
                          <div className="ml-4 flex-shrink-0">
                            <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                              Download
                            </a>
                          </div>
                        </li>
                        <li className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                          <div className="w-0 flex-1 flex items-center">
                            <svg
                              className="flex-shrink-0 h-5 w-5 text-gray-400"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path
                                fillRule="evenodd"
                                d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a3 3 0 00-3-3H8zm-2 2H7a1 1 0 011 1v4a3 3 0 01-6 0V7a1 1 0 011-1zm8 0H13a1 1 0 011 1v4a3 3 0 01-6 0V7a1 1 0 011-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="ml-2 flex-1 w-0 truncate">cover_letter.pdf</span>
                          </div>
                          <div className="ml-4 flex-shrink-0">
                            <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                              Download
                            </a>
                          </div>
                        </li>
                      </ul>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
