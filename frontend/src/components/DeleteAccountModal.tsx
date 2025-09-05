'use client'

import { useState } from "react"
import { signOut } from "next-auth/react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Trash2 } from "lucide-react"
import toast from 'react-hot-toast'

interface DeleteAccountModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function DeleteAccountModal({ isOpen, onClose }: DeleteAccountModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [agreed, setAgreed] = useState(false)
  
  const canDelete = confirmText === "SUPPRIMER" && agreed
  
  const handleDelete = async () => {
    if (!canDelete) return
    
    setIsDeleting(true)
    
    try {
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast({
          title: "Compte supprimé",
          description: "Votre compte a été supprimé avec succès. Vous allez être déconnecté.",
        })
        
        // Attendre un peu pour que l'utilisateur voie le message
        setTimeout(async () => {
          await signOut({ callbackUrl: '/' })
        }, 2000)
      } else {
        throw new Error(data.error || "Erreur lors de la suppression")
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le compte. Veuillez réessayer.",
        variant: "destructive"
      })
      setIsDeleting(false)
    }
  }
  
  const handleClose = () => {
    if (isDeleting) return
    setConfirmText("")
    setAgreed(false)
    onClose()
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-500">
            <AlertTriangle className="h-5 w-5" />
            Supprimer définitivement votre compte
          </DialogTitle>
          <DialogDescription className="pt-4 space-y-4">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-sm font-semibold text-red-400 mb-2">
                ⚠️ Cette action est IRRÉVERSIBLE
              </p>
              <p className="text-sm text-muted-foreground">
                Toutes vos données seront définitivement supprimées :
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
                <li>Vos objectifs et parcours</li>
                <li>Votre progression et achievements</li>
                <li>Vos conversations avec l'IA</li>
                <li>Votre profil et paramètres</li>
                <li>Votre historique complet</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">
                  Tapez <span className="font-mono bg-muted px-1 rounded">SUPPRIMER</span> pour confirmer
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="w-full mt-2 px-3 py-2 bg-background border border-border rounded-lg"
                  placeholder="Tapez SUPPRIMER"
                  disabled={isDeleting}
                />
              </div>
              
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1"
                  disabled={isDeleting}
                />
                <span className="text-sm text-muted-foreground">
                  Je comprends que cette action est irréversible et que toutes mes données seront perdues définitivement.
                </span>
              </label>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
          >
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!canDelete || isDeleting}
            className="gap-2"
          >
            {isDeleting ? (
              <>
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Suppression en cours...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Supprimer définitivement
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}