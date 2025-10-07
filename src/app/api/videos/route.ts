import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isValidYouTubeUrl, extractYouTubeId } from '@/lib/youtube'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { subscription: true }
    })

    if (!user?.subscription || user.subscription.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Active subscription required' },
        { status: 403 }
      )
    }

    const videos = await prisma.video.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ videos })
  } catch (error) {
    console.error('Get videos error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { subscription: true }
    })

    if (!user?.subscription || user.subscription.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Active subscription required' },
        { status: 403 }
      )
    }

    const { url, title } = await request.json()

    if (!url || !title) {
      return NextResponse.json(
        { error: 'URL and title are required' },
        { status: 400 }
      )
    }

    // Validate YouTube URL
    if (!isValidYouTubeUrl(url)) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      )
    }

    const youtubeId = extractYouTubeId(url)
    if (!youtubeId) {
      return NextResponse.json(
        { error: 'Could not extract YouTube video ID' },
        { status: 400 }
      )
    }

    // Check for duplicates
    const existingVideo = await prisma.video.findFirst({
      where: {
        OR: [
          { url },
          { youtubeId }
        ]
      }
    })

    if (existingVideo) {
      return NextResponse.json(
        { error: 'Video already exists in the library' },
        { status: 400 }
      )
    }

    // Create video
    const video = await prisma.video.create({
      data: {
        userId: user.id,
        url,
        title: title.trim(),
        youtubeId
      }
    })

    return NextResponse.json({ video })
  } catch (error) {
    console.error('Add video error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const videoId = searchParams.get('id')

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      )
    }

    // Check if video belongs to user
    const video = await prisma.video.findFirst({
      where: {
        id: videoId,
        userId: session.user.id
      }
    })

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      )
    }

    await prisma.video.delete({
      where: { id: videoId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete video error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}