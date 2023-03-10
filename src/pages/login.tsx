import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import React from 'react'
import Link from 'next/link'
import {useRouter} from 'next/router'
import GuestLayout from '../components/GuestLayout'

export default function Home() {

  let [username, setUsername] = React.useState<string>("");
  let [password, setPassword] = React.useState<string>("");
  let [error, setError] = React.useState<string>("");

  let router = useRouter()
  
  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()

  const url = `//${window.location.host}/api/auth/login`

    try {
      await fetch(url, 
        {
          method: "POST",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username,
            password: password
          }),
        })

      router.push("/dashboard");
      
    } catch(e: any) {
      console.log(`Error: ${e}`)
    }
  }
  
  return (
    <GuestLayout>
               <form onSubmit={(e) => handleSubmit(e)} className="flex flex-col gap-4">  
              <p className="text-2xl">Log In</p>
              <label htmlFor="username" className="flex flex-row items-center gap-4 w-[20rem]">
                <span>Username:</span>
                <input className="px-5 py-2 w-full" name="username" type="text" placeholder="Username" value={username} required
                 onChange={(e) => setUsername((e.target as HTMLInputElement).value)}></input>
              </label>
              
<label htmlFor="password" className="flex flex-row items-center gap-4 w-[20rem]">
                <span>Password:</span>
                <input className="px-5 py-2 w-full" name="password" type="password" placeholder="Password" value={password} required
                onChange={(e) => setPassword((e.target as HTMLInputElement).value)}></input>
            
              </label>

            <p id="error" className="w-3/5 h-[2rem]"></p>
            <button type="submit" className="px-8 py-2 bg-stone-100 hover:bg-white transition-all">Submit</button>
           </form>
          
            <Link href="/register" className="px-8 py-2 bg-stone-100 hover:bg-white transition-all">I'm a new user</Link>
    </GuestLayout>
  )
}