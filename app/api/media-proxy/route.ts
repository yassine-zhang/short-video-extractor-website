import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

// 平台特定的配置
const PLATFORM_CONFIGS: Record<string, Record<string, string>> = {
  "xhscdn.com": {
    Referer: "https://www.xiaohongshu.com/",
    "User-Agent":
      "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1",
    Origin: "https://www.xiaohongshu.com",
    Accept: "*/*",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    Connection: "keep-alive",
    "sec-ch-ua": '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"macOS"',
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "cross-site",
    Pragma: "no-cache",
    "Cache-Control": "no-cache",
  },
  "xiaohongshu.com": {
    Referer: "https://www.xiaohongshu.com/",
    "User-Agent":
      "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1",
    Origin: "https://www.xiaohongshu.com",
    Accept: "*/*",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    Connection: "keep-alive",
  },
  "kuaishou.com": {
    Referer: "https://www.kuaishou.com/",
    "User-Agent":
      "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1",
    Origin: "https://www.kuaishou.com",
    Accept: "*/*",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    Connection: "keep-alive",
  },
  "douyin.com": {
    Referer: "https://www.douyin.com/",
    "User-Agent":
      "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1",
    Origin: "https://www.douyin.com",
    Accept: "*/*",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    Connection: "keep-alive",
  },
}

// 小红书特定的CDN域名配置
const XHS_CDN_DOMAINS = ["xhscdn.com", "xhsimg.com", "xhs-cn.com", "xiaohongshu.com"]

// 小红书特定的图片CDN域名
const XHS_IMAGE_CDN_DOMAINS = [
  "sns-webpic-qc.xhscdn.com",
  "sns-img-qc.xhscdn.com",
  "sns-img-hw.xhscdn.com",
  "sns-img-bd.xhscdn.com",
]

// 小红书特定的视频CDN域名
const XHS_VIDEO_CDN_DOMAINS = [
  "sns-video-qc.xhscdn.com",
  "sns-video-hw.xhscdn.com",
  "sns-video-bd.xhscdn.com",
  "sns-video-al.xhscdn.com",
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get("url")
    const type = searchParams.get("type") || "auto" // video, image, auto

    if (!url) {
      return NextResponse.json({ error: "Missing URL parameter" }, { status: 400 })
    }

    console.log(`Proxying ${type} request for: ${url}`)

    // 解析URL以获取域名
    const urlObj = new URL(url)
    const hostname = urlObj.hostname

    // 确定平台并获取相应的请求头
    let headers: Record<string, string> = {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
      Accept: "*/*",
      "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
      Connection: "keep-alive",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    }

    // 添加平台特定的请求头
    let platformFound = false
    for (const [domain, config] of Object.entries(PLATFORM_CONFIGS)) {
      if (url.includes(domain)) {
        headers = { ...headers, ...config }
        platformFound = true
        break
      }
    }

    // 特殊处理小红书 - 检查所有可能的小红书CDN域名
    const isXhsDomain = XHS_CDN_DOMAINS.some((domain) => hostname.includes(domain))
    const isXhsImageCdn = XHS_IMAGE_CDN_DOMAINS.some((domain) => hostname === domain)
    const isXhsVideoCdn = XHS_VIDEO_CDN_DOMAINS.some((domain) => hostname === domain)

    if (isXhsDomain) {
      // 基本小红书请求头
      headers["Referer"] = "https://www.xiaohongshu.com/"
      headers["Origin"] = "https://www.xiaohongshu.com"
      headers["Host"] = hostname

      // 特殊处理WebP图片
      if (isXhsImageCdn || url.includes("webp") || url.includes("!nd_")) {
        headers["Accept"] = "image/webp,image/apng,image/*,*/*;q=0.8"
        headers["Sec-Fetch-Dest"] = "image"
        headers["Sec-Fetch-Mode"] = "no-cors"

        // 移除可能导致问题的请求头
        delete headers["Range"]
      }
      // 特殊处理视频
      else if (isXhsVideoCdn || type === "video") {
        headers["Range"] = "bytes=0-"
        headers["Sec-Fetch-Dest"] = "video"
        headers["Accept"] = "video/webm,video/mp4,video/*;q=0.9,*/*;q=0.8"
      }

      platformFound = true
    }

    if (!platformFound) {
      console.warn("未识别的平台URL:", url)
    }

    console.log("Request headers:", headers)

    // 发送请求
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30秒超时

    try {
      const fetchResponse = await fetch(url, {
        headers,
        cache: "no-store",
        next: { revalidate: 0 },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!fetchResponse.ok) {
        console.error(`Proxy request failed: ${fetchResponse.status} ${fetchResponse.statusText}`)
        return NextResponse.json(
          {
            error: "Failed to fetch content",
            status: fetchResponse.status,
            statusText: fetchResponse.statusText,
            url: url,
          },
          { status: fetchResponse.status },
        )
      }

      // 获取响应内容
      const data = await fetchResponse.arrayBuffer()
      console.log(`Successfully fetched ${data.byteLength} bytes from ${url}`)

      // 确定内容类型
      let contentType = fetchResponse.headers.get("content-type") || ""

      // 根据URL和类型参数猜测内容类型
      if (!contentType) {
        if (type === "video" || url.match(/\.(mp4|mov|webm|avi)$/i)) {
          contentType = "video/mp4"
        } else if (url.includes("webp") || url.match(/\.(webp)$/i)) {
          contentType = "image/webp"
        } else if (type === "image" || url.match(/\.(jpg|jpeg|png|gif)$/i)) {
          contentType = "image/jpeg"
        } else {
          contentType = "application/octet-stream"
        }
      }

      // 获取所有原始响应头
      const originalHeaders: Record<string, string> = {}
      fetchResponse.headers.forEach((value, key) => {
        originalHeaders[key] = value
      })

      console.log("Original response headers:", originalHeaders)

      // 设置响应头
      const responseHeaders: HeadersInit = {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      }

      // 保留一些有用的原始头
      const headersToKeep = ["content-length", "etag"]

      headersToKeep.forEach((header) => {
        const value = fetchResponse.headers.get(header)
        if (value) {
          responseHeaders[header] = value
        }
      })

      // 添加Content-Disposition头以支持下载，但仅当请求中包含download参数时
      if (searchParams.get("download") === "true") {
        const extension = type === "video" ? "mp4" : contentType.includes("webp") ? "webp" : "jpg"
        responseHeaders["Content-Disposition"] = `attachment; filename="${type}-${Date.now()}.${extension}"`
      }

      // 返回响应
      return new NextResponse(data, { headers: responseHeaders })
    } finally {
      clearTimeout(timeoutId)
    }
  } catch (error) {
    console.error("Proxy error:", error)
    return NextResponse.json(
      {
        error: "Proxy error",
        message: error instanceof Error ? error.message : String(error),
        url: new URL(request.url).searchParams.get("url") || "",
      },
      { status: 500 },
    )
  }
}
