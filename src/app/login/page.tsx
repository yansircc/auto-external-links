import { signIn, auth } from "@/server/auth";

export default async function SignInPage() {
  const session = await auth();
  return (
    <>
      <form
        action={async (formData) => {
          "use server";
          await signIn("http-email", formData);
        }}
      >
        <input type="text" name="email" placeholder="Email" />
        <button type="submit">Signin</button>
      </form>
      {session && <p>Signed in as {session.user?.email}</p>}
    </>
  );
}
