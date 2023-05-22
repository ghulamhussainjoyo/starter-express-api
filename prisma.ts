import { PrismaClient } from ".prisma/client";
const prisma = new PrismaClient();


async function main() {

    const users = await prisma.user.create({
        data: {
            name: "Ghulam Hussain"
        }
    });
    // console.log(users)
}

main()
    .then(res => res)
    .catch(err => err)
