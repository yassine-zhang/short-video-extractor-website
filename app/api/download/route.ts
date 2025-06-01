import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get("url")
    const type = searchParams.get("type") || "video" // video, image
    const filename = searchParams.get("filename") || `${type}-${Date.now()}`

    if (!url) {
      return NextResponse.json({ error: "Missing URL parameter" }, { status: 400 })
    }

    console.log(`Downloading ${type} from: ${url}`)

    // 设置请求头
    const headers: Record<string, string> = {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
      Accept: "*/*",
      "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
      Connection: "keep-alive",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    }

    // 特殊处理小红书
    if (
      url.includes("xhscdn.com") ||
      url.includes("xhsimg.com") ||
      url.includes("xhs-cn.com") ||
      url.includes("xiaohongshu.com")
    ) {
      headers["Referer"] = "https://www.xiaohongshu.com/"
      headers["Origin"] = "https://www.xiaohongshu.com"
      headers["Host"] = new URL(url).hostname
      headers["Range"] = "bytes=0-"

      // 小红书视频需要特殊处理
      if (url.includes("sns-video-hw") || url.includes("sns-video-al")) {
        headers["Host"] = new URL(url).hostname
      }
    }

    // 发送请求
    const fetchResponse = await fetch(url, {
      headers,
      cache: "no-store",
      next: { revalidate: 0 },
    })

    if (!fetchResponse.ok) {
      console.error(`Download request failed: ${fetchResponse.status} ${fetchResponse.statusText}`)
      return NextResponse.json(
        {
          error: "Failed to download content",
          status: fetchResponse.status,
          statusText: fetchResponse.statusText,
        },
        { status: fetchResponse.status },
      )
    }

    // 获取响应内容
    const data = await fetchResponse.arrayBuffer()
    console.log(`Successfully downloaded ${data.byteLength} bytes`)

    // 确定内容类型
    let contentType = fetchResponse.headers.get("content-type") || ""
    if (!contentType) {
      if (type === "video") {
        contentType = "video/mp4"
      } else if (type === "image") {
        contentType = "image/jpeg"
      } else {
        contentType = "application/octet-stream"
      }
    }

    // 设置文件扩展名
    const extension = type === "video" ? "mp4" : "jpg"

    // 设置响应头
    return new NextResponse(data, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}.${extension}"`,
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })
  } catch (error) {
    console.error("Download error:", error)
    return NextResponse.json(
      {
        error: "Download error",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
