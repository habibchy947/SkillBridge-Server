import { prisma } from "../lib/prisma"
import { UserRole } from "../middlewares/auth"



async function seedAdmin() {
    try {
        const adminData = {
            name: process.env.ADMIN_NAME!,
            email: process.env.ADMIN_EMAIL!,
            role: UserRole.ADMIN,
            image: process.env.ADMIN_IMAGE,
            password: process.env.ADMIN_PASSWORD!
        }
        console.log(adminData)
        if (!adminData.email || !adminData.password) {
            throw new Error("Missing admin env variables");
        }
        const existingUser = await prisma.user.findUnique({
            where: {
                email: adminData.email
            }
        })

        // check user is exist or not
        if(existingUser) {
            throw new Error("User is already exists!!");
        }

        const signUpAdmin = await fetch("http://localhost:5000/api/auth/sign-up/email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Origin": "http://localhost:3000"
            },
            body: JSON.stringify(adminData)
        });

        if(signUpAdmin.ok) {
            await prisma.user.update({
                where: {
                    email: adminData.email
                },
                data: {
                    emailVerified: true
                }   
            })
        }

        console.log(signUpAdmin);

    } catch (error) {
        console.log(error)
    }
}


seedAdmin();