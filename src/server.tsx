"use server"

export async function getServerSideProps() {
  return await Promise.resolve({
    props: {
      message: "Hello from server",
    },
  });
}
