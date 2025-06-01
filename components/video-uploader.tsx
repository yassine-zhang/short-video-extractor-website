"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import {
  Clipboard,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Download,
  AlertCircle,
  ImageIcon,
  Video,
  RefreshCw,
} from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { type CodeTheme, getCodeThemeClass } from "@/lib/theme-utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Author {
  name: string
  url: string
}

interface Resource {
  type: "live" | "image" | "video"
  urls: string[]
}

interface ParseResponse {
  success: boolean
  data: {
    videoUrl?: string
    title: string
    imagesList?: string[]
    author?: Author
    resources?: Resource[]
  }
  message: string
  errorCode?: number
}

// 更新错误消息映射
const ERROR_MESSAGES = {
  1201: "无法辨别URL真实性，请确保链接正确且完整",
  1202: "无法识别的平台，目前仅支持抖音、快手、小红书等平台",
  1203: "此平台解析功能仍在开发中，请稍后再试",
}

const ITEMS_PER_PAGE = 10

export function VideoUploader() {
  const [url, setUrl] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<ParseResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasClipboardPermission, setHasClipboardPermission] = useState<boolean | null>(null)
  const [codeTheme, setCodeTheme] = useState<CodeTheme>("default")
  const [videoLoadErrors, setVideoLoadErrors] = useState<Record<string, boolean>>({})
  const [imageLoadErrors, setImageLoadErrors] = useState<Record<string, boolean>>({})
  const [retryCount, setRetryCount] = useState<Record<string, number>>({})
  const [activeTab, setActiveTab] = useState<string>("videos")
  const resultRef = useRef<HTMLDivElement>(null)

  // 从文本中提取URL
  const extractUrl = (text: string): string | null => {
    try {
      // 匹配http或https URL
      const urlRegex = /(https?:\/\/[^\s]+)/g
      const matches = text.match(urlRegex)

      if (matches && matches.length > 0) {
        // 返回第一个匹配的URL
        return matches[0]
      }
      return null
    } catch {
      return null
    }
  }

  // 获取代理URL
  const getProxiedUrl = (originalUrl: string, type: "video" | "image", forceRefresh = false) => {
    // 检测是否是小红书WebP图片
    const isXhsWebp =
      originalUrl.includes("xhscdn.com") && (originalUrl.includes("webp") || originalUrl.includes("!nd_"))

    // 对于小红书WebP图片，明确指定类型
    const mediaType = isXhsWebp ? "image" : type

    // 添加时间戳或随机数以防止缓存
    const cacheBuster = forceRefresh ? `&t=${Date.now()}` : ""

    return `/api/media-proxy?url=${encodeURIComponent(originalUrl)}&type=${mediaType}${cacheBuster}`
  }

  // 获取下载URL
  const getDownloadUrl = (originalUrl: string, type: "video" | "image") => {
    const filename = `${type}-${uuidv4()}`
    return `/api/media-proxy?url=${encodeURIComponent(originalUrl)}&type=${type}&download=true&filename=${filename}`
  }

  useEffect(() => {
    const checkClipboardPermission = async () => {
      try {
        if (navigator.permissions && navigator.permissions.query) {
          const result = await navigator.permissions.query({ name: "clipboard-read" as PermissionName })
          setHasClipboardPermission(result.state === "granted")

          result.addEventListener("change", () => {
            setHasClipboardPermission(result.state === "granted")
          })
        }
      } catch (err) {
        console.error("Clipboard permission check failed:", err)
      }
    }

    checkClipboardPermission()
  }, [])

  // 重置状态
  useEffect(() => {
    if (result) {
      setVideoLoadErrors({})
      setImageLoadErrors({})
      setRetryCount({})

      // Set active tab based on available resources
      if (result.data.resources) {
        const hasVideos = result.data.resources.some((r) => r.type === "live" || r.type === "video")
        const hasImages = result.data.resources.some((r) => r.type === "image")

        if (hasVideos) {
          setActiveTab("videos")
        } else if (hasImages) {
          setActiveTab("images")
        }
      } else if (result.data.videoUrl) {
        setActiveTab("videos")
      } else if (result.data.imagesList && result.data.imagesList.length > 0) {
        setActiveTab("images")
      }
    }
  }, [result])

  // Scroll to top when page changes
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    if (resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) {
      setError("请输入链接")
      return
    }

    const extractedUrl = extractUrl(url)
    if (!extractedUrl) {
      setError("未找到有效的http或https链接")
      return
    }

    setIsProcessing(true)
    setError(null)
    setResult(null)
    setCurrentPage(1)
    setVideoLoadErrors({})
    setImageLoadErrors({})
    setRetryCount({})

    try {
      const response = await fetch("https://sve-api.itcox.cn/public/parseVideo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: extractedUrl }),
      })

      const data: ParseResponse = await response.json()

      if (data.success) {
        setResult(data)
      } else {
        // 使用映射的错误消息或默认消息
        const errorMessage = data.errorCode
          ? ERROR_MESSAGES[data.errorCode as keyof typeof ERROR_MESSAGES] || data.message
          : data.message
        setError(errorMessage || "解析失败，请检查链接是否正确")
      }
    } catch (err) {
      setError("网络请求失败，请稍后重试")
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePaste = async () => {
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const permissionResult = await navigator.permissions.query({ name: "clipboard-read" as PermissionName })

        if (permissionResult.state === "denied") {
          setError("请允许访问剪贴板权限")
          return
        }
      }

      const text = await navigator.clipboard.readText()
      if (text) {
        setUrl(text)
        const extractedUrl = extractUrl(text)
        if (!extractedUrl) {
          setError("粘贴的内容中未找到有效的http或https链接")
        } else {
          setError(null)
        }
      }
    } catch (err) {
      setError("无法访问剪贴板，请手动粘贴链接或允许剪贴板访问权限")
    }
  }

  // 直接下载媒体文件
  const downloadMedia = async (mediaUrl: string, type: "video" | "image") => {
    try {
      setError(null)

      // 使用下载API
      window.open(getDownloadUrl(mediaUrl, type), "_blank")
    } catch (error) {
      console.error(`${type}下载失败:`, error)
      setError(`${type === "video" ? "视频" : "图片"}下载失败: ${error instanceof Error ? error.message : "未知错误"}`)
    }
  }

  // 处理媒体加载错误
  const handleMediaLoadError = (url: string, type: "video" | "image") => {
    console.error(`${type} failed to load: ${url}`)

    // 更新重试计数
    const currentRetryCount = retryCount[url] || 0
    const newRetryCount = { ...retryCount, [url]: currentRetryCount + 1 }
    setRetryCount(newRetryCount)

    // 如果重试次数小于3，尝试重新加载
    if (currentRetryCount < 2) {
      console.log(`Retrying ${type} load, attempt ${currentRetryCount + 1}: ${url}`)

      // 对于图片，我们可以立即更新状态，因为我们会使用新的URL
      if (type === "image") {
        // 暂时标记为错误，但不要永久标记
        setImageLoadErrors((prev) => ({ ...prev, [url]: false }))
      } else {
        setVideoLoadErrors((prev) => ({ ...prev, [url]: true }))
      }
    } else {
      // 超过重试次数，标记为永久错误
      if (type === "image") {
        setImageLoadErrors((prev) => ({ ...prev, [url]: true }))
      } else {
        setVideoLoadErrors((prev) => ({ ...prev, [url]: true }))
      }
    }
  }

  // 重试加载媒体
  const retryLoadMedia = (mediaUrl: string, type: "video" | "image") => {
    if (type === "image") {
      setImageLoadErrors((prev) => ({ ...prev, [mediaUrl]: false }))
    } else {
      setVideoLoadErrors((prev) => ({ ...prev, [mediaUrl]: false }))
    }

    // 重置重试计数
    setRetryCount((prev) => ({ ...prev, [mediaUrl]: 0 }))
  }

  // Get all videos from the result
  const getVideos = (): string[] => {
    if (!result) return []

    const videos: string[] = []

    // Add legacy videoUrl if present
    if (result.data.videoUrl) {
      videos.push(result.data.videoUrl)
    }

    // Add videos from resources
    if (result.data.resources) {
      result.data.resources.forEach((resource) => {
        if (resource.type === "live" || resource.type === "video") {
          videos.push(...resource.urls)
        }
      })
    }

    return videos
  }

  // Get all images from the result
  const getImages = (): string[] => {
    if (!result) return []

    const images: string[] = []

    // Add legacy imagesList if present
    if (result.data.imagesList) {
      images.push(...result.data.imagesList)
    }

    // Add images from resources
    if (result.data.resources) {
      result.data.resources.forEach((resource) => {
        if (resource.type === "image") {
          images.push(...resource.urls)
        }
      })
    }

    return images
  }

  const videos = getVideos()
  const allImages = getImages()
  const currentImages = allImages.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE) || []
  const totalPages = Math.ceil(allImages.length / ITEMS_PER_PAGE)
  const themeClass = getCodeThemeClass(codeTheme)
  const hasVideos = videos.length > 0
  const hasImages = allImages.length > 0

  return (
    <div className="w-full">
      {/* Input Form */}
      <div className="mb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <Input
              type="url"
              placeholder="粘贴视频链接"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                if (e.target.value) {
                  const extractedUrl = extractUrl(e.target.value)
                  if (!extractedUrl) {
                    setError("未找到有效的http或https链接")
                  } else {
                    setError(null)
                  }
                } else {
                  setError(null)
                }
              }}
              className="h-12 flex-1"
            />
            <Button type="button" onClick={handlePaste} variant="outline">
              <Clipboard className="h-5 w-5 mr-2" />
              粘贴
            </Button>
          </div>

          <Button type="submit" disabled={isProcessing || !url || !extractUrl(url)} className="w-full">
            {isProcessing ? (
              <span className="flex items-center justify-center">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                处理中...
              </span>
            ) : (
              "开始解析"
            )}
          </Button>
        </form>
      </div>

      {/* Permissions Warning */}
      {hasClipboardPermission === false && (
        <div className="mb-6 p-3 bg-yellow-50 border border-yellow-300 text-yellow-700 rounded-md">
          需要剪贴板访问权限才能使用粘贴功能。请在浏览器中允许访问剪贴板。
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-300 text-red-700 rounded-md flex items-center gap-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Results */}
      {result && result.success && (
        <div ref={resultRef}>
          {/* Result Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-medium break-words">{result.data.title}</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">样式:</span>
              <select
                value={codeTheme}
                onChange={(e) => setCodeTheme(e.target.value as CodeTheme)}
                className="rounded-md border border-input bg-background px-2 py-1 text-sm"
              >
                <option value="default">默认</option>
                <option value="dark">暗色</option>
                <option value="light">亮色</option>
                <option value="github">GitHub</option>
                <option value="dracula">Dracula</option>
                <option value="nord">Nord</option>
                <option value="solarized">Solarized</option>
              </select>
            </div>
          </div>

          {/* Author info if available */}
          {result.data.author && (
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full overflow-hidden">
                <img
                  src={getProxiedUrl(result.data.author.url, "image") || "/placeholder.svg"}
                  alt={result.data.author.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg?height=32&width=32"
                  }}
                />
              </div>
              <span className="font-medium">{result.data.author.name}</span>
            </div>
          )}

          {/* Content Area with Theme */}
          <div className={`p-4 rounded-md ${themeClass}`}>
            {/* Tabs for Videos and Images */}
            {(hasVideos || hasImages) && (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="videos" disabled={!hasVideos} className="flex items-center gap-1">
                    <Video className="h-4 w-4" />
                    <span>视频 ({videos.length})</span>
                  </TabsTrigger>
                  <TabsTrigger value="images" disabled={!hasImages} className="flex items-center gap-1">
                    <ImageIcon className="h-4 w-4" />
                    <span>图片 ({allImages.length})</span>
                  </TabsTrigger>
                </TabsList>

                {/* Videos Tab Content */}
                <TabsContent value="videos" className="mt-4">
                  <div className="space-y-6">
                    {videos.map((videoUrl, index) => {
                      const hasError = videoLoadErrors[videoUrl]
                      const proxiedUrl = getProxiedUrl(videoUrl, "video", retryCount[videoUrl] > 0)
                      const currentRetryCount = retryCount[videoUrl] || 0

                      return (
                        <div key={index} className="mb-6">
                          {!hasError ? (
                            <div className="relative pb-[56.25%] rounded-md overflow-hidden bg-gray-100">
                              <video
                                key={`video-${videoUrl}-${currentRetryCount}`}
                                controls
                                preload="metadata"
                                className="absolute inset-0 w-full h-full"
                                controlsList="nodownload"
                                onContextMenu={(e) => e.preventDefault()}
                                onError={() => handleMediaLoadError(videoUrl, "video")}
                              >
                                <source src={proxiedUrl} type="video/mp4" />
                                您的浏览器不支持视频播放
                              </video>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center p-8 bg-gray-100 rounded-md">
                              <AlertCircle className="h-10 w-10 text-yellow-500 mb-2" />
                              <p className="mb-4 text-center text-gray-600">视频加载失败，请尝试重新加载或直接下载</p>
                              <div className="text-xs text-gray-500 mb-2 max-w-full overflow-hidden text-ellipsis">
                                {videoUrl.substring(0, 30)}...
                              </div>
                              <Button
                                onClick={() => retryLoadMedia(videoUrl, "video")}
                                variant="outline"
                                size="sm"
                                className="mb-2"
                              >
                                <RefreshCw className="h-4 w-4 mr-1" />
                                重新加载
                              </Button>
                            </div>
                          )}
                          <div className="flex gap-2 mt-4">
                            <Button onClick={() => downloadMedia(videoUrl, "video")} className="flex-1">
                              <Download className="h-5 w-5 mr-2" />
                              下载视频 {videos.length > 1 ? `#${index + 1}` : ""}
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </TabsContent>

                {/* Images Tab Content */}
                <TabsContent value="images" className="mt-4">
                  <div className="space-y-4">
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                      {currentImages.map((image, index) => {
                        const imageIndex = (currentPage - 1) * ITEMS_PER_PAGE + index
                        const hasError = imageLoadErrors[image]
                        const currentRetryCount = retryCount[image] || 0
                        const proxiedUrl = getProxiedUrl(image, "image", currentRetryCount > 0)

                        return (
                          <div key={`${index}-${currentRetryCount}`} className="relative pb-[100%] w-full">
                            <div className="absolute inset-0 rounded-md overflow-hidden bg-gray-100">
                              {!hasError ? (
                                <img
                                  src={proxiedUrl || "/placeholder.svg"}
                                  alt={`图片 ${imageIndex + 1}`}
                                  className="h-full w-full object-contain"
                                  loading={index < 4 ? "eager" : "lazy"}
                                  onError={() => handleMediaLoadError(image, "image")}
                                />
                              ) : (
                                <div className="flex flex-col items-center justify-center h-full">
                                  <AlertCircle className="h-8 w-8 text-yellow-500 mb-2" />
                                  <p className="text-sm text-center text-gray-600">图片加载失败</p>
                                  <div className="text-xs text-gray-500 mt-1 max-w-full overflow-hidden text-ellipsis px-2">
                                    {image.substring(0, 30)}...
                                  </div>
                                  <Button
                                    onClick={() => retryLoadMedia(image, "image")}
                                    variant="outline"
                                    size="sm"
                                    className="mt-2"
                                  >
                                    <RefreshCw className="h-4 w-4 mr-1" />
                                    重新加载
                                  </Button>
                                </div>
                              )}
                              <div className="absolute bottom-2 right-2 flex gap-1">
                                <Button onClick={() => downloadMedia(image, "image")} className="text-sm" size="sm">
                                  <Download className="h-4 w-4 mr-1" />
                                  下载
                                </Button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-4 mt-6">
                        <Button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          variant="outline"
                          size="sm"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <span className="text-lg font-medium">
                          {currentPage} / {totalPages}
                        </span>
                        <Button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          variant="outline"
                          size="sm"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            )}

            {!hasVideos && !hasImages && (
              <div className="flex flex-col items-center justify-center p-8 bg-gray-100 rounded-md">
                <AlertCircle className="h-10 w-10 text-yellow-500 mb-2" />
                <p className="text-center text-gray-600">未找到视频或图片资源</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
