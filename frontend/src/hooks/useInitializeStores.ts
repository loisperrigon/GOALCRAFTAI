"use client";

import { mockObjectives } from "@/data/mockObjectives";
import { useObjectiveStore } from "@/stores/objective-store";
import { useEffect, useRef } from "react";

export function useInitializeStores() {
  const { currentObjective, setActiveObjective } = useObjectiveStore();

  const initialized = useRef(false);

  useEffect(() => {
    // Si pas d'objectif actif, charger le premier mock par défaut
    if (!currentObjective && !initialized.current) {
      initialized.current = true;
      console.log("Chargement de l'objectif par défaut...");

      // Charger le premier objectif mock par défaut
      if (mockObjectives.length > 0) {
        setActiveObjective(mockObjectives[0]);
      }
    }
  }, []); // Pas de dépendances pour éviter les re-runs
}
