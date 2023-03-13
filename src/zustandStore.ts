import { create } from 'zustand'
import {persist, createJSONStorage} from 'zustand/middleware'

interface AcctState {
	name: string,
	changeName: (to: string) => void
}

export const accountStore = create<AcctState>()(persist((set, get) => ({
	name: "",
	changeName: (to) => set({name: to}),
	}),
	{name: 'name',
	storage: createJSONStorage(() => sessionStorage),
}

)
)