import { AuthUser, fetchAuthSession } from 'aws-amplify/auth';

interface AppProps {
  signOut?: () => void;
  user?: AuthUser;
}

export default function App({ signOut, user }: AppProps) {
  const logToken = async () => {
    const session = await fetchAuthSession();
    console.log(session.tokens?.idToken?.toString());
  };

  return (
    <div>
      <h1>Hello {user?.signInDetails?.loginId}</h1>
      <button onClick={logToken}>Log Token</button>
      <button onClick={signOut}>Sign out</button>
    </div>
  );
}