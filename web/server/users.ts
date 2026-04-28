"use server"

import { auth } from "@/lib/auth"

export const signIn = async () =>{
    await auth.api.signInEmail({
        body: {
            email: "alberto@hamuyela.com",
            password: "cur10usx",
        }
    })
}

export const signUp = async () =>{
    await auth.api.signUpEmail({
        body: {
            email: "alberto@hamuyela.com",
            password: "cur10usx",
            name: "alberto",
        }
    })
}