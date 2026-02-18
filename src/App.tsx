import { AuthUser } from 'aws-amplify/auth';

interface AppProps {
  signOut?: () => void;
  user?: AuthUser;
}

export default function App({ signOut, user }: AppProps) {
  return (
    <div>
      <h1>Hello {user?.signInDetails?.loginId}</h1>
      <button onClick={signOut}>Sign out</button>
    </div>
  );
}