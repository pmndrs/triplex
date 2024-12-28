/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        backgroundColor: "white",
        border: "1px solid rgba(0,0,0,0.1)",
        borderRadius: "12px",
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        height: "240px",
        padding: "1rem",
      }}
    >
      {children}
    </div>
  );
}

function CardTitle({ children }: { children: string }) {
  return (
    <h1
      style={{
        fontSize: "1.4rem",
        fontWeight: "600",
        margin: 0,
        marginTop: "4px",
      }}
      tabIndex={0}
    >
      {children}
    </h1>
  );
}

function CardHero() {
  return (
    <div
      style={{
        backgroundColor: "rgba(0,0,0,0.1)",
        borderRadius: "8px",
        height: "100%",
      }}
      tabIndex={0}
    />
  );
}

function CardContent({ children }: { children: React.ReactNode }) {
  return <div tabIndex={0}>{children}</div>;
}

export function CardExample() {
  return (
    <Card>
      <CardHero />
      <CardTitle>Inner Light</CardTitle>
      <CardContent>
        <span>Elderbrook & Bob Moses</span>
      </CardContent>
    </Card>
  );
}
