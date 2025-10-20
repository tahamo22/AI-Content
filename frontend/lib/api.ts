export async function createSession(backendUrl: string): Promise<{ sessionId: string; wsUrl: string; }>{
  const res = await fetch(`${backendUrl}/sessions`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
  if (!res.ok) throw new Error("Failed to create session");
  return res.json();
}
