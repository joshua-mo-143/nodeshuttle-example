import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import Link from 'next/link'
import React from 'react'
import GuestLayout from '../components/GuestLayout'

export default function Home() {

  const handleSubmit = async (e: React.SyntheticEvent) => {
    
  }
  
  return (
    <GuestLayout>
     
              <p className="lg:text-2xl ">Forgot Password</p>
            <form onSubmit={handleSubmit} className="flex flex-col justify-center items-center gap-10">
        <label className="flex flex-row justify-center items-center justify-center">
              <span>E-mail:</span>
            <input className="px-5 py-2"></input>
        </label>
        <button type="submit" className="px-5 py-2 bg-stone-200 hover:bg-stone-100 transition-all">Submit</button>
    </form>
    </GuestLayout>
  )
}
