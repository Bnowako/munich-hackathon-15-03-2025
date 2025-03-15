"use client"

import * as React from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { useMemo, useEffect, useState } from "react"
import { navItems } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { getRFQ } from "@/lib/api"

export function BreadcrumbNav() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [rfqTitle, setRfqTitle] = useState<string>("")
  
  // Fetch RFQ title when on details page
  useEffect(() => {
    async function fetchRFQTitle() {
      if (pathname === '/rfq/details') {
        const id = searchParams.get('id')
        if (id) {
          try {
            const rfq = await getRFQ(id)
            setRfqTitle(rfq.title)
          } catch (error) {
            console.error("Error fetching RFQ:", error)
          }
        }
      }
    }
    
    fetchRFQTitle()
  }, [pathname, searchParams])
  
  const breadcrumbItems = useMemo(() => {
    // Special handling for RFQ details page
    if (pathname === '/rfq/details') {
      const id = searchParams.get('id')
      const truncatedTitle = rfqTitle.length > 50 
        ? rfqTitle.substring(0, 50) + '...'
        : rfqTitle || `RFQ #${id}`
        
      return [
        {
          title: 'Home',
          url: '/',
          isCurrentPage: false
        },
        {
          title: 'RFQs',
          url: '/rfq',
          isCurrentPage: false
        },
        {
          title: truncatedTitle,
          url: `/rfq/details?id=${id}`,
          isCurrentPage: true
        }
      ]
    }

    // Handle main nav items
    const currentItem = navItems.find(item => item.url === pathname)
    if (currentItem) {
      return [
        {
          title: 'Home',
          url: '/',
          isCurrentPage: false
        },
        {
          title: currentItem.title,
          url: currentItem.url,
          isCurrentPage: true
        }
      ]
    }

    return []
  }, [pathname, searchParams, rfqTitle])

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={item.url}>
            <BreadcrumbItem>
              {item.isCurrentPage ? (
                <BreadcrumbPage>{item.title}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={item.url}>
                  {item.title}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < breadcrumbItems.length - 1 && (
              <BreadcrumbSeparator />
            )}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
} 