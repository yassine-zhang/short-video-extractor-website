import { Zap, Shield, Clock, Award } from "lucide-react"
import { Card } from "@/components/ui/card"

export function WhyChooseUs() {
  const reasons = [
    {
      icon: <Zap className="h-8 w-8 text-blue-500" />,
      title: "快速处理",
      description: "只需几秒钟，即可完成视频去水印",
    },
    {
      icon: <Shield className="h-8 w-8 text-green-500" />,
      title: "安全可靠",
      description: "不存储您的视频，保护您的隐私",
    },
    {
      icon: <Clock className="h-8 w-8 text-purple-500" />,
      title: "24/7 可用",
      description: "随时随地，想用就用，无需等待",
    },
    {
      icon: <Award className="h-8 w-8 text-yellow-500" />,
      title: "高质量输出",
      description: "保持原视频高清画质不降低",
    },
  ]

  return (
    <section className="mb-16">
      <h2 className="mb-8 text-center text-3xl font-bold">为什么选择我们</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {reasons.map((reason, index) => (
          <Card key={index} className="p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="mb-4 flex justify-center">{reason.icon}</div>
            <h3 className="mb-2 text-xl font-semibold">{reason.title}</h3>
            <p className="text-gray-600">{reason.description}</p>
          </Card>
        ))}
      </div>
    </section>
  )
}
