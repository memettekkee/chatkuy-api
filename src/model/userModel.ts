import prisma from '../database/prisma'

export const registerUser = async (userData: any) => {
    const user = await prisma.user.create({ 
        data: userData 
    })
    return user
}

export const existingUser = async (email: string) => {
    const user = await prisma.user.findUnique({
        where: {email: email}
    })
    return user
}

export const allUser = async () => {
    const user = await prisma.user.findMany()
    return user
}

export const userById = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: {id: userId}
    })
    return user
}

export const updateUser = async (userId: string, name: string, email: string, avatar: string) => {
    const user = await prisma.user.update({
        where: {id: userId},
        data: {
            name: name,
            email: email,
            avatar: avatar
        }
    })
    return user
}