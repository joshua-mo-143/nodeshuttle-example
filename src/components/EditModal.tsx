import React from 'react'

type props = {
  vis: boolean
}

export default function EditModal() {

  const handleSubmit = async (e: React.SyntheticEvent) => {
    
  }
  
  return (
    <div className="w-screen h-screen backdrop-blur flex flex-col items-center justify-center">
      <div className="bg-red-300">
        <form onSubmit={handleSubmit}>
          <label htmlFor="message" className="flex flex-row justify-center items-center gap-10">
            <span> Edit message: </span>
            <input className="px-5 py-2"></input>
          </label>

          <button type="submit" className="bg-stone-200 hover:bg-stone-100 transition-all">Submit</button>
      </form>
        </div>
    </div>
  )
}