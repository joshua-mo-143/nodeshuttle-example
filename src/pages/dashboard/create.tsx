import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'

const inter = Inter({ subsets: ['latin'] })

type record = {
  id: number,
  message: string,
  owner: string
}

export default function Home() {

  let router = useRouter();

  let [data, setData] = React.useState<record[]>([]);

  const handleLogout = async (e: React.SyntheticEvent) => {
    e.preventDefault()

    const res = await fetch(`http://${window.location.host}/api/auth/logout`);

    if (res.ok) {
      router.push("/");
    }

  }


  React.useEffect(() => {
    const fetchData = async () => {

      try {
        const res = await fetch(`http://${window.location.host}/api/notes`);

        if (res.status == 403) {
          router.push("/");
          return
        }
        const data: record[] = await res.json()

        setData(data);

      } catch (e: any) {
        console.log(`Error: ${e}`);
      }
    };
    fetchData()
  }, []);

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

          { data.length > 0 ? 

          <table>
            <thead>
            <tr>
              <th>Note ID</th>
              <th>Note Message</th>
              <th>Owner</th>
        <th>Edit</th>
      <th>Delete</th>
      </tr >
        </thead>
  
      {data.map((record: record) => (
        <tr>
          <td>{record.id}</td>
          <td>{record.message}</td>
          <td>{record.owner}</td>
          <td><button>Edit</button></td>
          <td><button>Delete</button></td>
        </tr>
      ))}
    
          </table >
          
           : <p> There's no notes here :( Maybe try creating one? </p> }
    
    </div >
              </main >
  </>
    
  )
}
