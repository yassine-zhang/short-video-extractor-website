import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

export function Sponsor() {
  return (
    <section className="mb-16 text-center">
      <h2 className="mb-8 text-3xl font-bold">赞助我们</h2>
      <div className="mx-auto max-w-md">
        <Card>
          <CardContent className="p-6">
            <p className="mb-4 text-lg font-medium">如果您觉得这个工具有用，欢迎赞助支持我们继续开发</p>
            <div className="mx-auto mb-4 w-48 h-48 relative">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/wechat-pay-LqQ6q9OThje53AB8awjxTwq5DZcTtW.png"
                alt="微信赞助二维码"
                width={192}
                height={192}
                className="h-full w-full"
              />
            </div>
            <p className="text-sm text-gray-500">使用微信扫描上方二维码进行赞助</p>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
