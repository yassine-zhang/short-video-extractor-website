import { VideoUploader } from "@/components/video-uploader"
import { Features } from "@/components/features"
import { WhyChooseUs } from "@/components/why-choose-us"
import { Sponsor } from "@/components/sponsor"
import Documentation from "@/components/documentation"
import { Footer } from "@/components/footer"
import { StatusIndicator } from "@/components/status-indicator"
import { Card } from "@/components/ui/card"

export default function Home() {
  return (
    <main className="container mx-auto py-10 px-4">
      {/* Header with title and status indicator */}
      <div className="mb-10">
        <div className="flex justify-end mb-2">
          <StatusIndicator />
        </div>
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">短视频去水印工具</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            目前支持小红书平台的视频和图片无水印下载，未来将支持抖音、快手等平台，简单易用，完全免费
          </p>
        </div>
      </div>

      <Card className="p-6 mb-10">
        <VideoUploader />
      </Card>

      <div className="space-y-16">
        <Features />
        <WhyChooseUs />
        <Sponsor />
        <Documentation />
      </div>

      <Footer />
    </main>
  )
}
