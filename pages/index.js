import Link from "next/link";
import Head from "next/head";
import Cookies from "js-cookie";

import React from "react";

const isAuthenticated = req => {
  if (!req.headers.cookie) {
    return false;
  }

  const cookie = req.headers.cookie.split(";").find(c => c.trim().startsWith(`${req.oidc.cookie.name}=`));

  return cookie ? !!cookie.split("=")[1] : !!cookie;
};

export default class App extends React.Component {
  state = {
    data: null
  };

  static getInitialProps(ctx) {
    return {
      isAuthenticated: isAuthenticated(ctx.req)
    };
  }

  getSecret = async () => {
    const res = await fetch("/api/me");
    const data = await res.text();

    this.setState({
      data
    });
  };

  render() {
    return (
      <>
        <Head>
          <title>Next.js + Node.js + Auth0</title>
          <link rel="stylesheet" href="https://css.zeit.sh/v1.css" type="text/css" />
        </Head>
        <main>
          <h1>Next.js + Node.js + Auth0</h1>
          <div className="buttons">
            <button onClick={this.getSecret}>Tell Me a Secret!</button>
            {!this.props.isAuthenticated ? (
              <Link href={"/login"}>
                <a>
                  <button>Login</button>
                </a>
              </Link>
            ) : (
              <Link href={"/logout"}>
                <a>
                  <button>Logout</button>
                </a>
              </Link>
            )}
          </div>
          {this.state.data && <p>{this.state.data}</p>}
        </main>
        <style jsx>{`
          .buttons {
            display: flex;
            justify-content: space-between;
          }
        `}</style>
      </>
    );
  }
}
