import React from 'react'
import Head from 'next/head'

interface ErrorProps {
  statusCode?: number
}

function Error({ statusCode }: ErrorProps) {
  return (
    <>
      <Head>
        <title>Erro {statusCode} - Roteiro Verde Leblon</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-green-700 mb-4">
            {statusCode || 'Erro'}
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            {statusCode
              ? `Ocorreu um erro ${statusCode} no servidor`
              : 'Ocorreu um erro no cliente'}
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    </>
  )
}

Error.getInitialProps = ({ res, err }: any) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default Error










