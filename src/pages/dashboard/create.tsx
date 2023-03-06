import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'

export default function Home() {

  let router = useRouter();

  let [message, setMessage] = React.useState<string>("");

  const handleLogout = async (e: React.SyntheticEvent) => {
    e.preventDefault()

    const res = await fetch(`http://${window.location.host}/api/auth/logout`);

    if (res.ok) {
      router.push("/");
    }
  }

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    try {
    const res = await fetch(`http://${window.location.host}/api/notes/create`, {
      mode: 'cors',
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      }, 
      body: JSON.stringify({
        message: message
      })
    })

      router.push("/dashboard")

    } catch (e: any) {
      console.log(`Error: ${e}`)
    }
  }
  
  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="bg-stone-300 flex flex-col items-center pb-20 min-h-screen">
        <nav className="h-10 w-full flex flex-row justify-between items-center px-5">
          <Link href="/dashboard">Zest.</Link>
          <button onClick={(e) => handleLogout(e)}>Log Out</button>
        </nav>

        <nav className="h-10 pl-5  w-full flex flex-row justify-start gap-10 items-center px-5 border-b border-black/10">
          <div className="text-stone-400">Notes</div>
          <Link href="/dashboard/create" className="hover:text-stone-400 transition-all">Create Note</Link>
        </nav>


        <div className="bg-stone-200 shadow-md mt-10 w-[100%-2rem] md:w-4/5 min-h-[20rem] rounded-md bg-sky-300 px-10 flex flex-col items-center">
          <h1 className="mt-5 text-xl lg:text-2xl">Dashboard</h1>

          <form onSubmit={handleSubmit} className="flex flex-cols justify-center items-center">
                       <label htmlFor="message" className="flex flex-row gap-4 items-center justify-center">
              
 <span>Enter your message here: </span>
              <input name="message" className="px-5 py-2" type="text" value={message} onChange={(e) => setMessage((e.target as HTMLInputElement).value)}></input>
           </label>
         <button type="submit" className="px-5 py-2 bg-stone-200 hover:bg-stone-100 transition-all">Submit</button>
            </form>
    </div >
   </main >
  </>
    
  )
}