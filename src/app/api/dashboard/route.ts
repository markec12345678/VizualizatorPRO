import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/session'

/**
 * GET /api/dashboard
 * Vrne statistike za prijavljenega uporabnika in njegovo organizacijo
 * 
 * Vrne:
 * - organization: podatki o organizaciji (ime, paket, omejitve)
 * - user: podatki o uporabniku (vloga, ime)
 * - stats: število projektov, vizualizacij, leadov, poraba
 * - recentProjects: zadnji projekti
 * - recentVisualizations: zadnje vizualizacije
 * - usage: poraba glede na paket (v izdelavi)
 */
export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Nisi prijavljen' },
        { status: 401 }
      )
    }

    if (!user.organizationId) {
      return NextResponse.json(
        { error: 'Nisi član nobene organizacije' },
        { status: 403 }
      )
    }

    // Pridobi organizacijo
    const organization = await db.organization.findUnique({
      where: { id: user.organizationId },
      include: {
        _count: {
          select: {
            users: true,
            projects: true,
            visualizations: true,
            materials: true,
          },
        },
      },
    })

    if (!organization) {
      return NextResponse.json(
        { error: 'Organizacija ni najdena' },
        { status: 404 }
      )
    }

    // Pridobi zadnje projekte
    const recentProjects = await db.project.findMany({
      where: { organizationId: organization.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        _count: {
          select: { visualizations: true },
        },
      },
    })

    // Pridobi zadnje vizualizacije
    const recentVisualizations = await db.visualization.findMany({
      where: { organizationId: organization.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        materialName: true,
        category: true,
        status: true,
        processingTime: true,
        createdAt: true,
      },
    })

    // Statistike za zadnjih 30 dni
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const vizLast30Days = await db.visualization.count({
      where: {
        organizationId: organization.id,
        createdAt: { gte: thirtyDaysAgo },
      },
    })

    const leadsLast30Days = await db.project.count({
      where: {
        organizationId: organization.id,
        title: { startsWith: 'Lead:' },
        createdAt: { gte: thirtyDaysAgo },
      },
    })

    // Poraba glede na paket
    const totalViz = organization._count.visualizations
    const maxViz = organization.maxVisualizations
    const usagePercent = maxViz > 0 ? Math.round((totalViz / maxViz) * 100) : 0

    // Uporabniki organizacije
    const teamMembers = await db.user.findMany({
      where: { organizationId: organization.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        plan: organization.plan,
        maxUsers: organization.maxUsers,
        maxVisualizations: organization.maxVisualizations,
      },
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      stats: {
        totalProjects: organization._count.projects,
        totalVisualizations: totalViz,
        totalLeads: organization._count.projects, // lead-i so shranjeni kot projekti
        totalTeamMembers: organization._count.users,
        totalCustomMaterials: organization._count.materials,
        vizLast30Days,
        leadsLast30Days,
      },
      usage: {
        visualizations: {
          used: totalViz,
          max: maxViz,
          percent: usagePercent,
          remaining: Math.max(0, maxViz - totalViz),
        },
        teamMembers: {
          used: organization._count.users,
          max: organization.maxUsers,
          remaining: Math.max(0, organization.maxUsers - organization._count.users),
        },
      },
      recentProjects: recentProjects.map(p => ({
        id: p.id,
        title: p.title,
        customerName: p.customerName,
        status: p.status,
        createdAt: p.createdAt,
        visualizationsCount: (p as any)._count?.visualizations || 0,
      })),
      recentVisualizations,
      teamMembers,
    })
  } catch (error) {
    console.error('Napaka v /api/dashboard:', error)
    return NextResponse.json(
      { error: 'Napaka pri pridobivanju podatkov' },
      { status: 500 }
    )
  }
}
