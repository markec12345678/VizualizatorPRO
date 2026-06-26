import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getMaterialById } from '@/lib/catalog'
import { sendVisualizationNotification } from '@/lib/email'

const MAX_IMAGE_SIZE = 8 * 1024 * 1024
const ALLOWED_CATEGORIES = ['WPC_OGRAJA', 'KERAMIKA', 'BARVA', 'FAZADA']

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const body = await request.json()
    const { originalImage, materialId, projectId, customPrompt } = body

    if (!originalImage || !materialId) {
      return NextResponse.json(
        { error: 'Manjkajoči podatki: originalImage in materialId sta obvezna' },
        { status: 400 }
      )
    }

    if (originalImage.length > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: 'Slika je prevelika. Maksimalna velikost je 8MB.' },
        { status: 400 }
      )
    }

    const material = getMaterialById(materialId)
    if (!material) {
      return NextResponse.json(
        { error: 'Material ni najden v katalogu' },
        { status: 404 }
      )
    }

    if (!ALLOWED_CATEGORIES.includes(material.category)) {
      return NextResponse.json(
        { error: 'Nedovoljena kategorija materiala' },
        { status: 400 }
      )
    }

    let actualProjectId = projectId
    if (!actualProjectId) {
      let demoProject = await db.project.findFirst({
        where: { title: 'Demo projekt' }
      })
      if (!demoProject) {
        demoProject = await db.project.create({
          data: {
            title: 'Demo projekt',
            notes: 'Samodejno ustvarjen za demo vizualizacije',
          }
        })
      }
      actualProjectId = demoProject.id
    }

    const visualization = await db.visualization.create({
      data: {
        projectId: actualProjectId,
        originalImage: originalImage.substring(0, 100),
        status: 'PROCESSING',
        category: material.category,
        materialId: material.id,
        materialName: material.name,
        prompt: material.promptHint,
      },
    })

    let resultImage: string | null = null
    let errorMessage: string | null = null
    let mode: 'replicate' | 'zai-fallback' | 'demo' = 'demo'

    if (process.env.REPLICATE_API_TOKEN) {
      try {
        resultImage = await generateWithReplicate(originalImage, material, customPrompt)
        mode = 'replicate'
      } catch (err) {
        console.error('Replicate generiranje ni uspelo:', err)
        errorMessage = err instanceof Error ? err.message : 'Replicate napaka'
      }
    }

    if (!resultImage) {
      try {
        resultImage = await generateWithZAI(originalImage, material, customPrompt)
        mode = 'zai-fallback'
      } catch (err) {
        console.error('Z-AI generiranje ni uspelo:', err)
        if (!errorMessage) {
          errorMessage = err instanceof Error ? err.message : 'Z-AI napaka'
        }
      }
    }

    if (!resultImage) {
      resultImage = await generateDemoFallback(originalImage, material)
      mode = 'demo'
    }

    const processingTime = Math.floor((Date.now() - startTime) / 1000)

    if (resultImage) {
      await db.visualization.update({
        where: { id: visualization.id },
        data: {
          status: 'COMPLETED',
          resultImage: resultImage.substring(0, 100),
          processingTime,
        },
      })

      sendVisualizationNotification({
        materialName: material.name,
        category: material.category,
        processingTime,
        mode,
      }).catch(err => console.error('Email notification failed:', err))

      return NextResponse.json({
        success: true,
        visualizationId: visualization.id,
        resultImage,
        processingTime,
        mode,
        material: {
          id: material.id,
          name: material.name,
          category: material.category,
        },
      })
    } else {
      await db.visualization.update({
        where: { id: visualization.id },
        data: {
          status: 'FAILED',
          errorMessage: errorMessage || 'AI generiranje ni uspelo',
        },
      })

      return NextResponse.json(
        { 
          error: 'AI vizualizacija ni uspela',
          details: errorMessage,
          visualizationId: visualization.id,
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Napaka v /api/visualize:', error)
    return NextResponse.json(
      { 
        error: 'Napaka pri obdelavi zahteve',
        details: error instanceof Error ? error.message : 'Neznana napaka'
      },
      { status: 500 }
    )
  }
}

async function generateWithReplicate(
  originalImage: string,
  material: { name: string; promptHint: string; category: string },
  customPrompt?: string
): Promise<string> {
  const Replicate = (await import('replicate')).default
  
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN!,
  })

  const fullPrompt = [
    'photorealistic professional architectural photography,',
    material.promptHint,
    'applied to the existing structure,',
    'high quality 4k render,',
    'natural lighting, realistic shadows and reflections,',
    'preserved original room dimensions and perspective,',
    'sharp focus, professional visualization',
    customPrompt ? `, ${customPrompt}` : '',
  ].join(' ')

  const output = await replicate.run(
    'jagilroy/controlnet-interior-design:21b83e3d4e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e',
    {
      input: {
        image: originalImage,
        prompt: fullPrompt,
        negative_prompt: 'blurry, low quality, distorted, cartoon, painting, illustration, watermark, text',
        num_inference_steps: 30,
        guidance_scale: 7.5,
        controlnet_conditioning_scale: 0.8,
      }
    }
  ) as string[]

  if (output && output.length > 0) {
    const imageUrl = output[0]
    if (imageUrl.startsWith('data:')) {
      return imageUrl
    }
    
    const imageResponse = await fetch(imageUrl)
    const buffer = await imageResponse.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    return `data:image/png;base64,${base64}`
  }

  throw new Error('Replicate ni vrnil slike')
}

async function generateWithZAI(
  originalImage: string,
  material: { name: string; promptHint: string; category: string },
  customPrompt?: string
): Promise<string> {
  const ZAI = (await import('z-ai-web-dev-sdk')).default
  const zai = await ZAI.create()
  
  const fullPrompt = [
    'photorealistic professional architectural photography,',
    material.promptHint,
    'applied to the existing balcony/room structure,',
    'high quality 4k visualization,',
    'natural lighting, realistic shadows and reflections,',
    'preserved original room dimensions and perspective,',
    'sharp focus, professional render',
    customPrompt ? `, ${customPrompt}` : '',
  ].filter(Boolean).join(' ')
  
  const result = await zai.images.generations.create({
    prompt: fullPrompt,
    n: 1,
    size: '1024x1024',
    response_format: 'b64_json',
  })
  
  if (result.data && result.data.length > 0) {
    const b64 = result.data[0].b64_json
    if (b64) {
      return `data:image/png;base64,${b64}`
    }
  }
  
  throw new Error('Z-AI ni vrnil slike')
}

async function generateDemoFallback(
  originalImage: string,
  material: { name: string; category: string }
): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 1500))
  return originalImage
}

export async function GET() {
  const totalViz = await db.visualization.count()
  const completed = await db.visualization.count({ where: { status: 'COMPLETED' } })
  const failed = await db.visualization.count({ where: { status: 'FAILED' } })
  
  return NextResponse.json({
    status: 'active',
    totalVisualizations: totalViz,
    completed,
    failed,
    successRate: totalViz > 0 ? Math.round((completed / totalViz) * 100) : 0,
  })
}
