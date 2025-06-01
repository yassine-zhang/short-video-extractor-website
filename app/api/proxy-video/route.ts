import { NextResponse } from "next/server"

const PLATFORM_CONFIGS = {
  "xhscdn.com": {
    referer: "https://www.xiaohongshu.com",
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.0",
    origin: "https://www.xiaohongshu.com",
    host: "sns-video-hw.xhscdn.com",
  },
  "xiaohongshu.com": {
    referer: "https://www.xiaohongshu.com",
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.0",
    origin: "https://www.xiaohongshu.com",
    host: "sns-video-hw.xhscdn.com",
  },
  "kuaishou.com": {
    referer: "https://www.kuaishou.com",
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
    origin: "https://www.kuaishou.com",
  },
  "douyin.com": {
    referer: "https://www.douyin.com",
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 ByteLocale/zh-CN",
    origin: "https://www.douyin.com",
  },
  "weibo.com": {
    referer: "https://weibo.com",
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
    origin: "https://weibo.com",
  },
}

export const dynamic = "force-dynamic" // 禁用缓存

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const videoUrl = searchParams.get("url")

  if (!videoUrl) {
    return new NextResponse("Missing URL parameter", { status: 400 })
  }

  try {
    // 根据视频URL确定平台
    const platformConfig = Object.entries(PLATFORM_CONFIGS).find(([domain]) => videoUrl.includes(domain))

    // 设置通用请求头
    const headers: HeadersInit = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      Accept: "*/*",
      "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
      Connection: "keep-alive",
      Range: "bytes=0-",
    }

    // 添加平台特定的请求头
    if (platformConfig) {
      const [_, config] = platformConfig
      headers["Referer"] = config.referer
      headers["User-Agent"] = config.userAgent
      if (config.origin) headers["Origin"] = config.origin
      if (config.host) headers["Host"] = config.host
    }

    // 特殊处理小红书视频
    if (videoUrl.includes("xhscdn.com")) {
      headers["sec-ch-ua"] = '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"'
      headers["sec-ch-ua-mobile"] = "?0"
      headers["sec-ch-ua-platform"] = '"Windows"'
      headers["Sec-Fetch-Dest"] = "video"
      headers["Sec-Fetch-Mode"] = "no-cors"
      headers["Sec-Fetch-Site"] = "cross-site"
    }

    console.log("Fetching video with headers:", headers)
    console.log("Video URL:", videoUrl)

    const response = await fetch(videoUrl, {
      headers,
      cache: "no-store",
      next: { revalidate: 0 },
    })

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const contentType = response.headers.get("content-type")
    const contentLength = response.headers.get("content-length")
    const videoData = await response.arrayBuffer()

    console.log("Video fetched successfully, size:", videoData.byteLength)
    console.log("Content-Type:", contentType)

    const responseHeaders: HeadersInit = {
      "Content-Type": contentType || "video/mp4",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    }

    if (contentLength) {
      responseHeaders["Content-Length"] = contentLength
    }

    return new NextResponse(videoData, { headers: responseHeaders })
  } catch (error) {
    console.error("Error proxying video:", error)
    return new NextResponse("Error fetching video: " + (error instanceof Error ? error.message : String(error)), {
      status: 500,
    })
  }
}
