import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import React from 'react'
import Link from 'next/link'
import {useRouter} from 'next/router'
import GuestLayout from '../components/GuestLayout'

export default function Home() {

  let [username, setUsername] = React.useState<string>("");
  let [email, setEmail] = React.useState<string>("");
  let [password, setPassword] = React.useState<string>("");
  let [confirm, setConfirm] = React.useState<string>("");
  let [error, setError] = React.useState<string>("");

  let router = useRouter();

   
  
  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()

    let element = document.querySelector('#error') as HTMLParagraphElement

    if (password != confirm) {
      element.innerText = "Your password and confirmed password need to be the same!"
      return
    }

    
    const url = `//${window.location.host}/api/auth/register`

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
            email: email,
            password: password
          }),
        })

      router.push("/login");
      
    } catch(e: any) {
      console.log(`Error: ${e}`)
    }
  }
  
  return (
    <GuestLayout>
                <form onSubmit={(e) => handleSubmit(e)} className="flex flex-col items-center justify-center gap-4 w-max max-w-[40rem] bg-sky-200 px-5 py-5 rounded-md">  
              <p className="text-2xl">Register</p>
              <label htmlFor="username" className="flex flex-row items-center gap-4 w-[20rem]">
                <span>Username:</span>
                <input className="px-5 py-2 w-full" name="username" type="text" placeholder="Username" value={username} required
                 onChange={(e) => setUsername((e.target as HTMLInputElement).value)}></input>
              </label>
        <label htmlFor="email" className="flex flex-row items-center gap-4 w-[20rem]">
        <span>Email: </span>
        
<input className="px-5 py-2 w-full" name="email" type="email" placeholder="E-mail" value={email} required
                onChange={(e) => setEmail((e.target as HTMLInputElement).value)}></input>
            
              </label>
              
<label htmlFor="password" className="flex flex-row items-center gap-4 w-[20rem]">
                <span>Password:</span>
                <input className="px-5 py-2 w-full" name="password" type="password" placeholder="Password" value={password} required
                onChange={(e) => setPassword((e.target as HTMLInputElement).value)}></input>
            
              </label>

<label htmlFor="confirm" className="flex flex-row items-center gap-4 w-[20rem]">
                <span>Confirm password:</span>
                <input className="px-5 py-2 w-full" name="confirm" type="password" placeholder="Confirm password" value={confirm} required
                onChange={(e) => setConfirm((e.target as HTMLInputElement).value)}></input>
              </label>
            <p id="error" className="w-3/5 h-[2rem]"></p>
            <button type="submit" className="px-8 py-2 bg-stone-100 hover:bg-white transition-all">Submit</button>
           </form>

              <Link href="/login" className="px-8 py-2 bg-stone-100 hover:bg-white transition-all">I have an account</Link>
    </GuestLayout>
  )
}
