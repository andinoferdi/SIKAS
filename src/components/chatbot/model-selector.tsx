"use client"

import React from "react"
import { Check, ChevronDown, Sparkles } from "lucide-react"
import type { AIModel, ModelSelection } from "@/types/chatbot"
import { cn } from "@/lib/utils"

interface ModelSelectorProps {
  models: AIModel[]
  currentSelection: ModelSelection
  onSelectionChange: (selection: ModelSelection) => void
}

export function ModelSelector({
  models,
  currentSelection,
  onSelectionChange,
}: ModelSelectorProps) {
  const selectedModel =
    currentSelection.mode === "manual" && currentSelection.selectedModelId
      ? models.find((model) => model.id === currentSelection.selectedModelId)
      : null

  const displayText =
    currentSelection.mode === "auto"
      ? "Auto (Pilih otomatis)"
      : selectedModel?.name || "Pilih model"

  const [isOpen, setIsOpen] = React.useState(false)

  const handleSelect = (selection: ModelSelection) => {
    onSelectionChange(selection)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors w-full text-left text-sm cursor-pointer"
      >
        <Sparkles className="w-4 h-4 text-primary" />
        <span className="flex-1 truncate">{displayText}</span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted-foreground transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg z-50 max-h-96 overflow-y-auto">
            <div className="p-2 space-y-1">
              <button
                onClick={() => handleSelect({ mode: "auto" })}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition-colors cursor-pointer text-left",
                  currentSelection.mode === "auto" && "bg-primary/10"
                )}
              >
                {currentSelection.mode === "auto" ? (
                  <Check className="w-4 h-4 text-primary" />
                ) : (
                  <div className="w-4 h-4" />
                )}
                <div className="flex-1">
                  <div className="font-medium text-foreground">Auto Selection</div>
                  <div className="text-sm text-muted-foreground">
                    Pakai model gratis OpenRouter terbaru yang tersedia
                  </div>
                </div>
              </button>

              <div className="border-t border-border my-2" />

              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() =>
                    handleSelect({ mode: "manual", selectedModelId: model.id })
                  }
                  className={cn(
                    "w-full flex flex-col gap-1 px-3 py-2 rounded-md hover:bg-muted transition-colors cursor-pointer text-left",
                    currentSelection.mode === "manual" &&
                      currentSelection.selectedModelId === model.id &&
                      "bg-primary/10"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {currentSelection.mode === "manual" &&
                    currentSelection.selectedModelId === model.id ? (
                      <Check className="w-4 h-4 text-primary shrink-0" />
                    ) : (
                      <div className="w-4 h-4 shrink-0" />
                    )}
                    <span className="font-medium text-foreground">{model.name}</span>
                    {model.recommended ? (
                      <span className="rounded-full border border-border px-2 py-0.5 text-sm text-muted-foreground">
                        Terbaru
                      </span>
                    ) : null}
                    {model.vision ? (
                      <span className="rounded-full border border-border px-2 py-0.5 text-sm text-muted-foreground">
                        Gambar
                      </span>
                    ) : null}
                  </div>

                  <div className="ml-6 truncate text-sm text-muted-foreground">
                    {model.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
