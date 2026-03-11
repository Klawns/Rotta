"use client"

import { useState, useEffect, useCallback } from "react"

export interface Client {
  id: string
  name: string
  address?: string
  phone?: string
  createdAt: string
}

const STORAGE_KEY = "delivery-clients"

function getStoredClients(): Client[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
}

function storeClients(clients: Client[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clients))
}

export function useClients() {
  const [clients, setClients] = useState<Client[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setClients(getStoredClients())
    setIsLoaded(true)
  }, [])

  const addClient = useCallback((name: string, address?: string, phone?: string) => {
    const newClient: Client = {
      id: crypto.randomUUID(),
      name,
      address,
      phone,
      createdAt: new Date().toISOString(),
    }
    setClients((prev) => {
      const updated = [newClient, ...prev]
      storeClients(updated)
      return updated
    })
    return newClient
  }, [])

  const deleteClient = useCallback((id: string) => {
    setClients((prev) => {
      const updated = prev.filter((client) => client.id !== id)
      storeClients(updated)
      return updated
    })
  }, [])

  const updateClient = useCallback((id: string, data: Partial<Omit<Client, "id" | "createdAt">>) => {
    setClients((prev) => {
      const updated = prev.map((client) =>
        client.id === id ? { ...client, ...data } : client
      )
      storeClients(updated)
      return updated
    })
  }, [])

  const getClientById = useCallback((id: string) => {
    return clients.find((client) => client.id === id)
  }, [clients])

  return {
    clients,
    isLoaded,
    addClient,
    deleteClient,
    updateClient,
    getClientById,
  }
}
