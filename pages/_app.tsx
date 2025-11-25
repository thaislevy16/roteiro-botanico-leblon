import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useEffect } from 'react'
import 'leaflet/dist/leaflet.css'
import '../styles/globals.css'
import Layout from '../components/Layout'

export default function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Registrar service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registrado com sucesso:', registration);
        })
        .catch((registrationError) => {
          console.log('Falha no registro do SW:', registrationError);
        });
    }
  }, []);

  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  )
}
