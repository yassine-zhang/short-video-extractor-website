import { CheckCircle } from "lucide-react"
import { Card } from "@/components/ui/card"

export function Features() {
  const features = [
    {
      title: "小红书去水印",
      description: "轻松下载小红书无水印图片和视频内容",
    },
    {
      title: "高清画质",
      description: "去水印后保持原视频高清画质不降低",
    },
    {
      title: "免费使用",
      description: "完全免费，无需注册，无需下载软件",
    },
    {
      title: "简单易用",
      description: "只需粘贴链接，一键解析下载",
    },
  ]

  return (
    <section className="mb-16">
      <h2 className="mb-8 text-center text-3xl font-bold">支持的平台和功能</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <Card key={index} className="p-6 hover:shadow-md transition-shadow">
            <div className="mb-2 flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <h3 className="text-xl font-semibold">{feature.title}</h3>
            </div>
            <p className="text-gray-600">{feature.description}</p>
          </Card>
        ))}
      </div>
    </section>
  )
}
