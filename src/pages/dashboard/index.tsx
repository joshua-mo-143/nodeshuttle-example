import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'
import AuthedLayout from '../../components/AuthedLayout'
import EditModal from '../../components/EditModal'
import {accountStore} from '../../zustandStore'

type record = {
  id: number,
  message: string,
  owner: string
}

export default function Home() {

  const router = useRouter();
  const [data, setData] = React.useState<record[]>([]);
  const [id, setId] = React.useState<number>(1);
  const [vis, setVis] = React.useState<boolean>(false);

  const {name} = accountStore();

  const handleDelete = async (e: React.SyntheticEvent) => {
    e.preventDefault()

    const element = e.target as HTMLButtonElement;
    const id = element.getAttribute("data-id");

    const url = `//${window.location.host}/api/notes/${id}`

    try {
      
const res = await fetch(url, {
      mode: 'cors',
      method: 'DELETE'
    });

    window.location.reload()
      
    } catch (e: any) {
      console.log(`Error: ${e}`)
    }
    
      }

  const handleEdit = (e: React.SyntheticEvent) => {
    e.preventDefault()

    const element = e.target as HTMLButtonElement;

    // @ts-ignore
    setId(element.getAttribute("data-id"))
    setVis(true)
  }

  React.useEffect(() => {
    const fetchData = async () => {

     const url = `//${window.location.host}/api/notes`

      try {
        const res = await fetch(url,
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
      {vis ? 
<EditModal vis={vis} setVis={setVis} id={id} setId={setId}/> : null}
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
          <td className="col-span-1 text-center">{record.id}</td>
          <td className="col-span-6 text-center">{record.message}</td>
          <td className="col-span-2 text-center">{record.owner}</td>
          <td className="col-span-1 flex flex-row justify-center">
               {name == record.owner ? <button  data-id={record.id} onClick={handleEdit} className="w-full px-4 text-center bg-stone-200 hover:bg-stone-100 transition-all">Edit</button> : null }
            </td>
          <td className="col-span-1">
                {name == record.owner ? <button data-id={record.id} onClick={handleDelete} className="w-full px-4 text-center bg-stone-200 hover:bg-stone-100 transition-all">Delete</button> : null }
            </td>
        </tr>
      ))}
          </table >
          
           : <p> There's no notes here :( Maybe try creating one? </p> }
    
    </div >
  </AuthedLayout>
    
  )
}
