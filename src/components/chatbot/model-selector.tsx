"use client"

import React from "react"
import { Check, ChevronDown, Sparkles, Eye } from "lucide-react"
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
      ? models.find((m) => m.id === currentSelection.selectedModelId)
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
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
            <div className="p-2 space-y-1">
              <button
                onClick={() => handleSelect({ mode: "auto" })}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition-colors cursor-pointer text-left",
                  currentSelection.mode === "auto" && "bg-primary/10"
                )}
              >
                {currentSelection.mode === "auto" && (
                  <Check className="w-4 h-4 text-primary" />
                )}
                {currentSelection.mode !== "auto" && (
                  <div className="w-4 h-4" />
                )}
                <div className="flex-1">
                  <div className="font-medium text-foreground">
                    Auto Selection
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Otomatis pilih model terbaik yang tersedia
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
                    <span className="font-medium text-foreground">
                      {model.name}
                    </span>
                    {model.supportsVision && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs bg-primary/20 text-primary rounded">
                        <Eye className="w-3 h-3" />
                        Vision
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground ml-6">
                    {model.description}
                  </div>
                  {model.pros.length > 0 && (
                    <ul className="text-xs text-muted-foreground ml-6 space-y-0.5">
                      {model.pros.map((pro, idx) => (
                        <li key={idx} className="flex items-start gap-1">
                          <span className="text-primary">•</span>
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
