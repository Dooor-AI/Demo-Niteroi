"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { Dispatch, SetStateAction } from "react"

export function NLQCard({
  nlqQuery,
  setNlqQuery,
  nlqResult,
  handleNlqSearch,
}: {
  nlqQuery: string
  setNlqQuery: Dispatch<SetStateAction<string>>
  nlqResult: string | null
  handleNlqSearch: () => void
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Search className="w-4 h-4" />
          Pergunte aos dados
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Input
            value={nlqQuery}
            onChange={(e) => setNlqQuery(e.target.value)}
            placeholder="Ex.: Qual o % que já usou o simulado do ENEM?"
            onKeyDown={(e) => e.key === "Enter" && handleNlqSearch()}
            className="font-normal"
          />
          <Button onClick={handleNlqSearch} className="font-medium">
            <Search className="w-4 h-4" />
          </Button>
        </div>
        {nlqResult && <p className="text-sm text-gray-700 mt-3">{nlqResult}</p>}
      </CardContent>
    </Card>
  )
}

