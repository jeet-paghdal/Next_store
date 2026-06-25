const { PrismaClient } = require('@prisma/client')
const products = require('./products.json')
const prisma = new PrismaClient()

async function main() {
  for (const product of products) {
    await prisma.product.create({
      data: product,
    })
  }
}
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

//Read products → insert them one by one → if all good, disconnect. If error, show it and exit.
