import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import Link from 'next/link'
import GuestLayout from '../components/GuestLayout'

export default function Home() {
  return (
    <GuestLayout>
                    <p className="lg:text-2xl "> Sign in to enjoy the full features of Zest.</p>
              <Link href="/register" className="text-xl bg-stone-100 hover:bg-white transition-all shadow-md px-10 py-2 rounded-md">New User</Link>
              <Link href="/login" className="text-xl bg-stone-100 hover:bg-white transition-all shadow-md px-10 py-2 rounded-md">Log In</Link>
    </GuestLayout>
  )
}
