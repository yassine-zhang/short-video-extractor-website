import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

export async function GET() {
  try {
    console.log("Fetching service status from: https://status.itcox.cn/api/status?tag=sve-api")

    const response = await fetch("https://status.itcox.cn/api/status?tag=sve-api", {
      method: "GET",
      headers: {
        Authorization: `Bearer kener_b9279a59bb9e232603a890a5f96bfbc74927b4f3b16ee1d51a735c5cec2449eb`,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) {
      console.error(`Status API returned ${response.status}: ${response.statusText}`)
      throw new Error(`Status API returned ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log("Status API response:", data)

    // Map the API response to our expected format
    return NextResponse.json({
      status: data.status?.toLowerCase() || "unknown",
      uptime: data.uptime,
      lastUpdatedAt: data.last_updated_at,
    })
  } catch (error) {
    console.error("Error fetching service status:", error)
    return NextResponse.json({ status: "unknown", error: error instanceof Error ? error.message : String(error) })
  }
}
