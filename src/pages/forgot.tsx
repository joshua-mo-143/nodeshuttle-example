import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import Link from 'next/link'
import React from 'react'
import GuestLayout from '../components/GuestLayout'

export default function Home() {

  const [email, setEmail] = React.useState<string>("");
  const [success, setSuccess] = React.useState<boolean>(false);

  const handleSubmit = async (e: React.SyntheticEvent) => {
      e.preventDefault()

    
 const url = `//${window.location.host}/api/auth/register`
    

  try {
      let res = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      headers: {
          "Content-Type": "application/json"
        },
    body: JSON.stringify({
      email: email
    }
        )});

    
  } catch (e:any) {
    console.log(`Error: ${e}`)
  }
  }
  
  
  return (
    <GuestLayout>
        <p className="lg:text-2xl ">Forgot Password</p>
            <form onSubmit={handleSubmit} className="flex flex-col justify-center items-center gap-10">
        <label className="flex flex-row justify-center items-center justify-center">
              <span>E-mail:</span>
            <input className="px-5 py-2" required value={email} onChange={(e) => setEmail((e.target as HTMLInputElement).value)}></input>
        </label>
        <button type="submit" className="px-5 py-2 bg-stone-200 hover:bg-stone-100 transition-all">Submit</button>
    </form>
      <p id="success" className={success ? "" : "invisible"}>Sent! You'll receive an email if your inputted email is valid. </p>
      
      <Link href="/" className="px-8 py-2 bg-stone-100 hover:bg-white transition-all">Back to Main</Link>
    
    </GuestLayout>
  )
}
