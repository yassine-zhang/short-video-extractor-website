import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // Try a simple fetch to the status API without any authentication
    // This will help us determine if it's a network issue or an auth issue
    const testResponse = await fetch("https://status.itcox.cn/", {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    })

    const testStatus = testResponse.status
    const testOk = testResponse.ok

    // Now try the actual API call
    const apiResponse = await fetch("https://status.itcox.cn/api/status?tag=sve-api", {
      method: "GET",
      headers: {
        Authorization: `Bearer kener_b9279a59bb9e232603a890a5f96bfbc74927b4f3b16ee1d51a735c5cec2449eb`,
        Accept: "application/json",
      },
    })

    const apiStatus = apiResponse.status
    const apiOk = apiResponse.ok

    let apiData = null
    if (apiOk) {
      apiData = await apiResponse.json()
    }

    return NextResponse.json({
      testEndpoint: {
        status: testStatus,
        ok: testOk,
      },
      apiEndpoint: {
        status: apiStatus,
        ok: apiOk,
        data: apiData,
      },
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
  }
}
