"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestProxy() {
  const [url, setUrl] = useState("")
  const [type, setType] = useState<"video" | "image">("image")
  const [proxyUrl, setProxyUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleTest = () => {
    if (!url) return

    setLoading(true)
    setError(null)

    const proxiedUrl = `/api/media-proxy?url=${encodeURIComponent(url)}&type=${type}`
    setProxyUrl(proxiedUrl)

    // 测试代理是否工作
    fetch(proxiedUrl, { method: "HEAD" })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`代理请求失败: ${response.status} ${response.statusText}`)
        }
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>代理测试工具</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">媒体URL</label>
              <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="输入需要代理的媒体URL" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">媒体类型</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input type="radio" checked={type === "image"} onChange={() => setType("image")} className="mr-2" />
                  图片
                </label>
                <label className="flex items-center">
                  <input type="radio" checked={type === "video"} onChange={() => setType("video")} className="mr-2" />
                  视频
                </label>
              </div>
            </div>

            <Button onClick={handleTest} disabled={!url || loading} className="w-full">
              {loading ? "测试中..." : "测试代理"}
            </Button>

            {error && <div className="p-3 bg-red-50 border border-red-300 text-red-700 rounded-md">{error}</div>}

            {proxyUrl && !error && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">代理URL</label>
                  <div className="p-2 bg-gray-100 rounded-md overflow-x-auto">
                    <code>{proxyUrl}</code>
                  </div>
                </div>

                {type === "image" && (
                  <div>
                    <label className="block text-sm font-medium mb-1">预览</label>
                    <div className="border rounded-md overflow-hidden">
                      <img
                        src={proxyUrl || "/placeholder.svg"}
                        alt="代理图片预览"
                        className="max-w-full h-auto"
                        onError={() => setError("图片加载失败")}
                      />
                    </div>
                  </div>
                )}

                {type === "video" && (
                  <div>
                    <label className="block text-sm font-medium mb-1">预览</label>
                    <div className="border rounded-md overflow-hidden">
                      <video
                        src={proxyUrl}
                        controls
                        className="max-w-full h-auto"
                        onError={() => setError("视频加载失败")}
                      >
                        您的浏览器不支持视频播放
                      </video>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
