import { useEffect, useState } from "react";
import Link from "next/link";
import Head from "next/head";
import Cookies from "js-cookie";

export default () => {
  const [auth, setAuth] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    function getAuth() {
      console.log(Cookies.get("aud"));
      if (Cookies.get("access_token")) {
        setAuth(true);
        return null;
      }
    }
    getAuth();
  }, []);

  const getSecret = async () => {
    const res = await fetch("/api/me");
    const secret = await res.text();
    setData(secret);
  };

  const logout = async () => {
    Cookies.remove("access_token");
    setAuth(false);
  };
  return (
    <>
      <Head>
        <title>Next.js + Node.js + Auth0</title>
        <link rel="stylesheet" href="https://css.zeit.sh/v1.css" type="text/css" />
      </Head>
      <main>
        <h1>Next.js + Node.js + Auth0</h1>
        <div className="buttons">
          <button onClick={getSecret}>Tell Me a Secret!</button>
          {!auth ? (
            <Link href={"/login"}>
              <a>
                <button>Login</button>
              </a>
            </Link>
          ) : (
            <Link href={"/logout"}>
              <a onClick={logout}>
                <button>Logout</button>
              </a>
            </Link>
          )}
        </div>
        {data && <p>{data}</p>}
      </main>
      <style jsx>{`
        .buttons {
          display: flex;
          justify-content: space-between;
        }
      `}</style>
    </>
  );
};
