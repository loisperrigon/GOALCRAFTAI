"use client"

import { motion } from "framer-motion"
import { Progress } from "@/components/ui/progress"
import { Brain, Sparkles } from "lucide-react"
import { useObjectiveStore } from "@/stores/objective-store"

interface GenerationProgressProps {
  className?: string
}

export default function GenerationProgress({ className }: GenerationProgressProps) {
  const { currentObjective } = useObjectiveStore()
  
  if (!currentObjective?.isGenerating) {
    return null
  }
  
  const progress = currentObjective.generationProgress || 0
  // Ne pas compter le nœud racine ajouté dans l'UI
  const actualStepCount = currentObjective.skillTree?.nodes.length || 0
  const stepCount = actualStepCount
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`bg-card/50 backdrop-blur border border-purple-500/30 rounded-lg p-4 ${className || ''}`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="relative">
          <Brain className="h-5 w-5 text-purple-400" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0"
          >
            <Sparkles className="h-5 w-5 text-purple-400" />
          </motion.div>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-white">
            Génération de votre parcours en cours...
          </h3>
          <p className="text-xs text-muted-foreground">
            {stepCount > 0 
              ? `${stepCount} étapes créées`
              : "Analyse de votre objectif..."
            }
          </p>
        </div>
      </div>
      
      <Progress value={progress} className="h-2" />
      
      <div className="flex justify-between mt-2">
        <span className="text-xs text-muted-foreground">
          {progress}%
        </span>
        {stepCount > 0 && (
          <span className="text-xs text-purple-400">
            Étape {stepCount} en cours...
          </span>
        )}
      </div>
      
      {/* Indicateur d'activité sous forme de points animés */}
      <div className="flex justify-center gap-1 mt-3">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 bg-purple-500 rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}