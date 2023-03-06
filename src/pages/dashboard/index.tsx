import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'
import AuthedLayout from '../../components/AuthedLayout'

type record = {
  id: number,
  message: string,
  owner: string
}

export default function Home() {

  let router = useRouter();

  let [data, setData] = React.useState<record[]>([]);

  const handleDelete = async (e: React.SyntheticEvent) => {
    e.preventDefault()

    const element = e.target as HTMLButtonElement;
    const id = element.getAttribute("data-id");

    try {
      
const res = await fetch(`http://${window.location.host}/api/notes/${id}`, {
      mode: 'cors',
      method: 'DELETE'
    });

    window.location.reload()
      
    } catch (e: any) {
      console.log(`Error: ${e}`)
    }
    
      }


  React.useEffect(() => {
    const fetchData = async () => {

      try {
        const res = await fetch(`http://${window.location.host}/api/notes`,
        {
            method: "GET",
            credentials: "include",
            mode: "cors",
            headers: new Headers({
              "Access-Control-Allow-Credentials": "true"
            }),
          });

        if (res.status == 403) {
          return router.push("/");
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
    <AuthedLayout>

        <div className="bg-stone-200 shadow-md mt-10 w-[100%-2rem] md:w-4/5 min-h-[20rem] rounded-md bg-sky-300 px-10 flex flex-col items-center">
          <h1 className="mt-5 text-xl lg:text-2xl">Dashboard</h1>

          { data.length > 0 ? 

          <table className="w-[100%] px-4 border-collapse">
            <thead>
            <tr className= "grid grid-cols-11 grid-rows-auto">
              <th className="col-span-1">Note ID</th>
              <th className="col-span-6">Note Message</th>
              <th className="col-span-2">Owner</th>
        <th className="col-span-1">Edit</th>
      <th className="col-span-1">Delete</th>
      </tr >
        </thead>
  
      {data.map((record: record) => (
        <tr className="border-collapse grid grid-cols-11 grid-rows-auto">
          <td className="col-span-1">{record.id}</td>
          <td className="col-span-6">{record.message}</td>
          <td className="col-span-2">{record.owner}</td>
          <td className="col-span-1"><Link href={`/dashboard/edit/${record.id}`} className="w-full px-4 bg-stone-200 hover:bg-stone-100 transition-all">Edit</Link></td>
          <td className="col-span-1"><button data-id={record.id} onClick={handleDelete} className="w-full px-4 bg-stone-200 hover:bg-stone-100 transition-all">Delete</button></td>
        </tr>
      ))}
    
          </table >
          
           : <p> There's no notes here :( Maybe try creating one? </p> }
    
    </div >
  </AuthedLayout>
    
  )
}
