'use client'

import { useGoogleLogin, GoogleLogin } from '@react-oauth/google'
import { Button } from '@/components/ui/button'
import { Chrome } from 'lucide-react'
import { useUserStore } from '@/stores/user-store'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function GoogleLoginButton() {
  const router = useRouter()
  const { login } = useUserStore()
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setIsLoading(true)
      console.log('Google login success:', credentialResponse)
      
      // Envoyer le token au backend pour vérification et création de session
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: credentialResponse.credential,
        }),
      })

      const data = await response.json()
      
      if (data.success && data.user) {
        // Mettre à jour le store avec les données utilisateur
        login({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          avatar: data.user.avatar,
          level: data.user.level || 1,
          xp: data.user.xp || 0,
          badges: data.user.badges || [],
          achievements: data.user.achievements || [],
          objectives: data.user.objectives || [],
          settings: data.user.settings || {
            theme: 'dark',
            notifications: true,
            sound: true,
            language: 'fr'
          }
        })
        
        // Rediriger vers le dashboard ou les objectifs
        router.push('/objectives')
      } else {
        console.error('Erreur lors de la connexion:', data.error)
      }
    } catch (error) {
      console.error('Erreur lors de la connexion Google:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleError = () => {
    console.error('Erreur de connexion Google')
  }

  return (
    <div className="w-full">
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        theme="filled_black"
        size="large"
        width="100%"
        text="continue_with"
        shape="rectangular"
        locale="fr"
      />
    </div>
  )
}

// Alternative avec bouton personnalisé
export function CustomGoogleLoginButton() {
  const router = useRouter()
  const { login } = useUserStore()
  const [isLoading, setIsLoading] = useState(false)

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsLoading(true)
        
        // Récupérer les infos utilisateur avec le token
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        })
        
        const userInfo = await userInfoResponse.json()
        
        // Envoyer au backend
        const response = await fetch('/api/auth/google-oauth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            accessToken: tokenResponse.access_token,
            userInfo: userInfo,
          }),
        })

        const data = await response.json()
        
        if (data.success && data.user) {
          login(data.user)
          router.push('/objectives')
        }
      } catch (error) {
        console.error('Erreur:', error)
      } finally {
        setIsLoading(false)
      }
    },
    onError: (error) => {
      console.error('Login Failed:', error)
    },
  })

  return (
    <Button
      onClick={() => googleLogin()}
      disabled={isLoading}
      className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300"
    >
      <Chrome className="mr-2 h-5 w-5" />
      {isLoading ? 'Connexion...' : 'Continuer avec Google'}
    </Button>
  )
}